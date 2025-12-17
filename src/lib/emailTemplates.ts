/**
 * Email Templates for Lead Outreach
 * 
 * Generates personalized, warm photographer-to-business emails
 */

interface OutreachEmailParams {
  leadName: string
  leadWebsite?: string | null
  photographerNiche?: string
  idealClientDescription?: string
  emailSignature?: string
  senderName?: string
}

export function generateOutreachEmail(params: OutreachEmailParams): {
  subject: string
  html: string
  text: string
} {
  const {
    leadName,
    leadWebsite,
    photographerNiche = 'wedding',
    idealClientDescription,
    emailSignature,
    senderName = 'A local photographer',
  } = params

  // Generate subject line
  const subject = `Loved ${leadName}'s work – collaboration idea`

  // Determine the type of business for personalization
  const isVenue = /venue|hall|estate|manor|garden|ballroom/i.test(leadName)
  const isPlanner = /planner|coordinator|planning/i.test(leadName)
  const isFlorist = /floral|florist|flower/i.test(leadName)

  // Build personalized opening
  let opening = ''
  if (leadWebsite) {
    opening = `I came across ${leadName} while researching local ${isVenue ? 'venues' : isPlanner ? 'planners' : 'businesses'} and was immediately impressed by what you've built.`
  } else {
    opening = `I've heard great things about ${leadName} from others in the ${photographerNiche} community, and wanted to reach out.`
  }

  // Build the value proposition based on business type
  let valueProposition = ''
  if (isVenue) {
    valueProposition = `I specialize in ${photographerNiche} photography and love capturing the unique character of beautiful spaces like yours. I'd love to explore how we might work together – whether that's being a recommended vendor, doing a styled shoot to showcase your venue, or simply connecting to refer clients to each other.`
  } else if (isPlanner) {
    valueProposition = `As a ${photographerNiche} photographer, I know how important it is to work with planners who share the same commitment to creating unforgettable experiences. I'd love to connect and see if there's an opportunity to collaborate – I'm always looking for talented planners to recommend to my clients.`
  } else {
    valueProposition = `I'm a local ${photographerNiche} photographer always looking to connect with other professionals in the industry. I believe the best client experiences come from vendors who know and trust each other. Would you be open to a quick chat about potential collaboration?`
  }

  // Add ideal client description if provided
  let idealClientSection = ''
  if (idealClientDescription) {
    idealClientSection = `\n\nA bit about my work: ${idealClientDescription}`
  }

  // Build the call to action
  const callToAction = `Would you have 15 minutes for a quick call or coffee this week? I'd love to learn more about ${leadName} and share some ideas.`

  // Compose the HTML email
  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi there,</p>
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">${opening}</p>
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">${valueProposition}</p>
  ${idealClientSection ? `<p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">${idealClientSection}</p>` : ''}
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">${callToAction}</p>
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Looking forward to connecting!</p>
  
  ${emailSignature ? `<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; white-space: pre-line;">${emailSignature}</div>` : `<p style="font-size: 16px; line-height: 1.6;">Best,<br>${senderName}</p>`}
</div>
  `.trim()

  // Compose plain text version
  const text = `Hi there,

${opening}

${valueProposition}
${idealClientSection}

${callToAction}

Looking forward to connecting!

${emailSignature || `Best,\n${senderName}`}
  `.trim()

  return { subject, html, text }
}

/**
 * Generate a follow-up email template
 */
export function generateFollowUpEmail(params: OutreachEmailParams & { daysSinceFirst: number }): {
  subject: string
  html: string
  text: string
} {
  const { leadName, emailSignature, senderName = 'A local photographer', daysSinceFirst } = params

  const subject = `Quick follow-up – ${leadName}`

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi there,</p>
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">I wanted to quickly follow up on my note from ${daysSinceFirst === 7 ? 'last week' : 'a few days ago'}. I know how busy things can get!</p>
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">I'm still very interested in exploring a potential collaboration with ${leadName}. Even a brief 10-minute call would be great.</p>
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">If you're not the right person to speak with, I'd appreciate being pointed in the right direction.</p>
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Thanks so much!</p>
  
  ${emailSignature ? `<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; white-space: pre-line;">${emailSignature}</div>` : `<p style="font-size: 16px; line-height: 1.6;">Best,<br>${senderName}</p>`}
</div>
  `.trim()

  const text = `Hi there,

I wanted to quickly follow up on my note from ${daysSinceFirst === 7 ? 'last week' : 'a few days ago'}. I know how busy things can get!

I'm still very interested in exploring a potential collaboration with ${leadName}. Even a brief 10-minute call would be great.

If you're not the right person to speak with, I'd appreciate being pointed in the right direction.

Thanks so much!

${emailSignature || `Best,\n${senderName}`}
  `.trim()

  return { subject, html, text }
}

/**
 * Generate daily summary email for autonomous mode
 */
export function generateDailySummaryEmail(params: {
  leadsFound: number
  leadsContacted: number
  senderName?: string
}): {
  subject: string
  html: string
  text: string
} {
  const { leadsFound, leadsContacted, senderName = 'there' } = params
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const subject = `📊 Your Daily Lead Report – ${leadsFound} found, ${leadsContacted} contacted`

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); padding: 12px 24px; border-radius: 12px;">
      <span style="color: white; font-size: 24px; font-weight: bold;">PhotoLeadAgent</span>
    </div>
  </div>

  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${senderName},</p>
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Here's your daily lead generation summary for <strong>${today}</strong>:</p>
  
  <div style="background: linear-gradient(135deg, #f3e8ff, #dbeafe); border-radius: 12px; padding: 24px; margin: 24px 0;">
    <div style="display: flex; justify-content: space-around; text-align: center;">
      <div style="flex: 1;">
        <div style="font-size: 36px; font-weight: bold; color: #7c3aed;">${leadsFound}</div>
        <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">New Leads Found</div>
      </div>
      <div style="width: 1px; background: #d1d5db;"></div>
      <div style="flex: 1;">
        <div style="font-size: 36px; font-weight: bold; color: #3b82f6;">${leadsContacted}</div>
        <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">Outreach Sent</div>
      </div>
    </div>
  </div>

  ${leadsFound > 0 ? `
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
    🎯 We found <strong>${leadsFound} new potential partners</strong> matching your criteria today.
  </p>
  ` : ''}

  ${leadsContacted > 0 ? `
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
    ✉️ We sent personalized outreach emails to <strong>${leadsContacted} leads</strong> on your behalf.
  </p>
  ` : ''}

  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
    Check your dashboard to see the new leads and track responses.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      View Dashboard →
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    You're receiving this because you enabled autonomous mode in PhotoLeadAgent.<br/>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings" style="color: #7c3aed;">Manage your preferences</a>
  </p>
</div>
  `.trim()

  const text = `Hi ${senderName},

Here's your daily lead generation summary for ${today}:

📊 NEW LEADS FOUND: ${leadsFound}
✉️ OUTREACH SENT: ${leadsContacted}

${leadsFound > 0 ? `We found ${leadsFound} new potential partners matching your criteria today.` : ''}
${leadsContacted > 0 ? `We sent personalized outreach emails to ${leadsContacted} leads on your behalf.` : ''}

Check your dashboard to see the new leads and track responses:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

---
You're receiving this because you enabled autonomous mode in PhotoLeadAgent.
Manage your preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings
  `.trim()

  return { subject, html, text }
}
