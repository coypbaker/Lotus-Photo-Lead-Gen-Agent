import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sgMail from '@sendgrid/mail'
import { generateOutreachEmail } from '@/lib/emailTemplates'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function POST(request: Request) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: 'SendGrid API key not configured' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = await request.json()

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Check if lead has already been contacted
    if (lead.status === 'contacted' || lead.status === 'replied' || lead.status === 'converted') {
      return NextResponse.json(
        { error: 'This lead has already been contacted' },
        { status: 400 }
      )
    }

    // Get user settings for email personalization
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Generate the email
    const emailContent = generateOutreachEmail({
      leadName: lead.name,
      leadWebsite: lead.website,
      photographerNiche: settings?.photographer_niche || 'wedding',
      idealClientDescription: settings?.ideal_client_description,
      emailSignature: settings?.email_signature,
      senderName: user.email?.split('@')[0] || 'A local photographer',
    })

    // For now, we need a recipient email - use the lead's website domain or a test email
    // In production, you'd scrape contact emails or use an email finder service
    let recipientEmail = process.env.TEST_EMAIL_RECIPIENT || user.email

    // Try to extract email from website (basic approach)
    if (lead.website) {
      const domain = lead.website.replace(/https?:\/\//, '').replace(/\/.*/, '').replace('www.', '')
      // Common patterns: info@, contact@, hello@
      recipientEmail = `info@${domain}`
    }

    // Send the email via SendGrid
    const msg = {
      to: recipientEmail!,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || user.email!,
        name: settings?.email_signature?.split('\n')[0] || 'PhotoLeadAgent',
      },
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      replyTo: user.email!,
    }

    await sgMail.send(msg)

    // Update lead status to contacted
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: 'contacted',
        notes: `Outreach email sent on ${new Date().toLocaleDateString()} to ${recipientEmail}`,
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('Error updating lead status:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: `Outreach email sent to ${recipientEmail}`,
      emailSent: {
        to: recipientEmail,
        subject: emailContent.subject,
      },
    })

  } catch (error: unknown) {
    console.error('Send outreach error:', error)
    
    // Handle SendGrid specific errors
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as { response?: { body?: { errors?: Array<{ message: string }> } } }
      const errorMessage = sgError.response?.body?.errors?.[0]?.message || 'Failed to send email'
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'Failed to send outreach email' },
      { status: 500 }
    )
  }
}
