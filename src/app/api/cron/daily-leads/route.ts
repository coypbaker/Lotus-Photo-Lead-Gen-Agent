import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sgMail from '@sendgrid/mail'
import { calculateLeadScore } from '@/lib/leadScoring'
import { generateOutreachEmail, generateDailySummaryEmail } from '@/lib/emailTemplates'

// Use service role for cron jobs to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  // If no cron secret is set, allow in development
  if (!cronSecret && process.env.NODE_ENV === 'development') {
    return true
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  // Verify this is a legitimate cron request
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    usersProcessed: 0,
    totalLeadsFound: 0,
    totalOutreachSent: 0,
    errors: [] as string[],
  }

  try {
    // Get all users with autonomous mode enabled
    const { data: usersWithAutonomous, error: usersError } = await supabase
      .from('user_settings')
      .select(`
        user_id,
        photographer_niche,
        target_locations,
        ideal_client_description,
        email_signature,
        daily_lead_target,
        daily_outreach_limit
      `)
      .eq('autonomous_mode', true)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    if (!usersWithAutonomous || usersWithAutonomous.length === 0) {
      return NextResponse.json({ message: 'No users with autonomous mode enabled', results })
    }

    // Process each user
    for (const userSettings of usersWithAutonomous) {
      try {
        const userId = userSettings.user_id

        // Get user's email
        const { data: userData } = await supabase.auth.admin.getUserById(userId)
        const userEmail = userData?.user?.email

        if (!userEmail) {
          results.errors.push(`User ${userId}: No email found`)
          continue
        }

        // Check subscription limits
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('plan, leads_used_this_month')
          .eq('user_id', userId)
          .single()

        const plan = subscription?.plan || 'free'
        const leadsUsed = subscription?.leads_used_this_month || 0
        const planLimits: Record<string, number> = { free: 10, pro: 200, premium: -1 }
        const monthlyLimit = planLimits[plan] || 10

        // Check if user has reached monthly limit
        if (monthlyLimit !== -1 && leadsUsed >= monthlyLimit) {
          results.errors.push(`User ${userId}: Monthly limit reached`)
          continue
        }

        // Check if already ran today
        const today = new Date().toISOString().split('T')[0]
        const { data: existingRun } = await supabase
          .from('autonomous_run_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('run_date', today)
          .single()

        if (existingRun) {
          continue // Already processed today
        }

        // Find new leads
        const leadsFound = await findLeadsForUser(userSettings)
        results.totalLeadsFound += leadsFound.length

        // Save new leads
        let savedLeads = 0
        for (const lead of leadsFound) {
          // Check for duplicates
          const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('user_id', userId)
            .eq('place_id', lead.place_id)
            .single()

          if (!existing) {
            const locations = userSettings.target_locations?.split(',').map((l: string) => l.trim()) || []
            const score = calculateLeadScore({
              name: lead.name,
              website: lead.website,
              phone: lead.formatted_phone_number,
              address: lead.formatted_address,
            }, {
              targetLocations: locations,
              niche: userSettings.photographer_niche || 'wedding',
            })

            await supabase.from('leads').insert({
              user_id: userId,
              name: lead.name,
              website: lead.website || null,
              phone: lead.formatted_phone_number || null,
              address: lead.formatted_address || null,
              place_id: lead.place_id,
              source: 'google_places',
              score,
              status: 'new',
            })
            savedLeads++
          }
        }

        // Send outreach emails (respect daily limit)
        const dailyOutreachLimit = userSettings.daily_outreach_limit || 5
        let outreachSent = 0

        if (process.env.SENDGRID_API_KEY) {
          const { data: newLeads } = await supabase
            .from('leads')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'new')
            .order('score', { ascending: false })
            .limit(dailyOutreachLimit)

          for (const lead of newLeads || []) {
            if (outreachSent >= dailyOutreachLimit) break
            if (!lead.website) continue // Skip leads without website

            try {
              const domain = lead.website.replace(/https?:\/\//, '').replace(/\/.*/, '').replace('www.', '')
              const recipientEmail = `info@${domain}`

              const emailContent = generateOutreachEmail({
                leadName: lead.name,
                leadWebsite: lead.website,
                photographerNiche: userSettings.photographer_niche || 'wedding',
                idealClientDescription: userSettings.ideal_client_description,
                emailSignature: userSettings.email_signature,
                senderName: userEmail.split('@')[0],
              })

              await sgMail.send({
                to: recipientEmail,
                from: {
                  email: process.env.SENDGRID_FROM_EMAIL || userEmail,
                  name: userSettings.email_signature?.split('\n')[0] || 'PhotoLeadAgent',
                },
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html,
                replyTo: userEmail,
              })

              // Update lead status
              await supabase
                .from('leads')
                .update({
                  status: 'contacted',
                  notes: `Auto-outreach sent on ${new Date().toLocaleDateString()} to ${recipientEmail}`,
                })
                .eq('id', lead.id)

              outreachSent++
              results.totalOutreachSent++
            } catch (emailError) {
              console.error(`Failed to send email for lead ${lead.id}:`, emailError)
            }
          }
        }

        // Log the run
        await supabase.from('autonomous_run_logs').insert({
          user_id: userId,
          run_date: today,
          leads_found: savedLeads,
          leads_contacted: outreachSent,
          summary_sent: false,
        })

        // Send daily summary email
        if (process.env.SENDGRID_API_KEY && (savedLeads > 0 || outreachSent > 0)) {
          try {
            const summaryEmail = generateDailySummaryEmail({
              leadsFound: savedLeads,
              leadsContacted: outreachSent,
              senderName: userEmail.split('@')[0],
            })

            await sgMail.send({
              to: userEmail,
              from: {
                email: process.env.SENDGRID_FROM_EMAIL || 'noreply@photoleadagent.com',
                name: 'PhotoLeadAgent',
              },
              subject: summaryEmail.subject,
              text: summaryEmail.text,
              html: summaryEmail.html,
            })

            // Update summary_sent
            await supabase
              .from('autonomous_run_logs')
              .update({ summary_sent: true })
              .eq('user_id', userId)
              .eq('run_date', today)
          } catch (summaryError) {
            console.error(`Failed to send summary to ${userEmail}:`, summaryError)
          }
        }

        results.usersProcessed++
      } catch (userError) {
        console.error(`Error processing user:`, userError)
        results.errors.push(`User processing error: ${userError}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Daily autonomous run completed`,
      results,
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

async function findLeadsForUser(settings: {
  photographer_niche?: string
  target_locations?: string
  daily_lead_target?: number
}): Promise<Array<{
  place_id: string
  name: string
  formatted_address?: string
  formatted_phone_number?: string
  website?: string
}>> {
  if (!GOOGLE_PLACES_API_KEY || !settings.target_locations) {
    return []
  }

  const locations = settings.target_locations.split(',').map(l => l.trim()).filter(Boolean)
  const niche = settings.photographer_niche?.toLowerCase() || 'wedding'
  const limit = Math.min(settings.daily_lead_target || 10, 10) // Cap at 10

  const searchTerms: Record<string, string[]> = {
    wedding: ['wedding venue', 'event venue', 'wedding planner'],
    portrait: ['photo studio', 'photography studio'],
    event: ['event venue', 'conference center', 'banquet hall'],
    corporate: ['corporate office', 'conference center'],
    default: ['wedding venue', 'event venue'],
  }

  const terms = searchTerms[niche] || searchTerms.default
  const allLeads: Array<{
    place_id: string
    name: string
    formatted_address?: string
    formatted_phone_number?: string
    website?: string
  }> = []

  for (const location of locations.slice(0, 2)) {
    for (const term of terms.slice(0, 2)) {
      if (allLeads.length >= limit) break

      const query = `${term} ${location}`
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`

      try {
        const response = await fetch(searchUrl)
        const data = await response.json()

        if (data.status === 'OK' && data.results) {
          for (const place of data.results.slice(0, 3)) {
            if (allLeads.length >= limit) break

            // Get place details
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=place_id,name,formatted_address,formatted_phone_number,website&key=${GOOGLE_PLACES_API_KEY}`
            const detailsResponse = await fetch(detailsUrl)
            const detailsData = await detailsResponse.json()

            if (detailsData.status === 'OK' && detailsData.result) {
              allLeads.push(detailsData.result)
            }
          }
        }
      } catch (error) {
        console.error('Google Places error:', error)
      }
    }
  }

  // Deduplicate
  const unique = Array.from(new Map(allLeads.map(l => [l.place_id, l])).values())
  return unique.slice(0, limit)
}
