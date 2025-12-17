/**
 * Lead Scoring Engine
 * 
 * Rule-based scoring system for lead qualification.
 * Future: Replace with scikit-learn ML model via Python API.
 * 
 * Scoring Rules:
 * - Base score: 50
 * - +20 points: website contains "wedding" or "event"
 * - +15 points: name contains "venue", "studio", "planner", "coordinator"
 * - +10 points: located in target location
 * - +5 points: has phone number
 * - +5 points: has website
 */

interface LeadData {
  name: string
  website?: string | null
  phone?: string | null
  address?: string | null
  types?: string[]
}

interface ScoringContext {
  targetLocations: string[]
  niche: string
}

export function calculateLeadScore(lead: LeadData, context?: ScoringContext): number {
  let score = 50 // Base score

  const nameLower = lead.name.toLowerCase()
  const websiteLower = lead.website?.toLowerCase() || ''
  const addressLower = lead.address?.toLowerCase() || ''

  // +20 points: website contains relevant keywords
  const websiteKeywords = ['wedding', 'event', 'bridal', 'celebration', 'reception', 'ceremony']
  if (websiteKeywords.some(keyword => websiteLower.includes(keyword))) {
    score += 20
  }

  // +15 points: name contains business type keywords
  const nameKeywords = ['venue', 'studio', 'planner', 'coordinator', 'hall', 'ballroom', 'estate', 'manor', 'garden']
  if (nameKeywords.some(keyword => nameLower.includes(keyword))) {
    score += 15
  }

  // +10 points: in target location
  if (context?.targetLocations && context.targetLocations.length > 0) {
    const inTargetLocation = context.targetLocations.some(location => 
      addressLower.includes(location.toLowerCase())
    )
    if (inTargetLocation) {
      score += 10
    }
  }

  // +5 points: has phone number
  if (lead.phone) {
    score += 5
  }

  // +5 points: has website
  if (lead.website) {
    score += 5
  }

  // Niche-specific bonuses
  if (context?.niche) {
    const nicheLower = context.niche.toLowerCase()
    
    if (nicheLower.includes('wedding')) {
      const weddingKeywords = ['wedding', 'bridal', 'bride', 'groom', 'chapel', 'ceremony']
      if (weddingKeywords.some(kw => nameLower.includes(kw) || websiteLower.includes(kw))) {
        score += 10
      }
    }
    
    if (nicheLower.includes('corporate') || nicheLower.includes('event')) {
      const corporateKeywords = ['conference', 'corporate', 'business', 'meeting', 'convention']
      if (corporateKeywords.some(kw => nameLower.includes(kw) || websiteLower.includes(kw))) {
        score += 10
      }
    }
    
    if (nicheLower.includes('portrait')) {
      const portraitKeywords = ['studio', 'portrait', 'headshot', 'photo']
      if (portraitKeywords.some(kw => nameLower.includes(kw) || websiteLower.includes(kw))) {
        score += 10
      }
    }
  }

  // Cap score at 100
  return Math.min(score, 100)
}

/**
 * Batch score multiple leads
 */
export function scoreLeads(leads: LeadData[], context?: ScoringContext): Array<LeadData & { score: number }> {
  return leads
    .map(lead => ({
      ...lead,
      score: calculateLeadScore(lead, context),
    }))
    .sort((a, b) => b.score - a.score) // Sort by score descending
}

/**
 * Get score breakdown for debugging/display
 */
export function getScoreBreakdown(lead: LeadData, context?: ScoringContext): {
  total: number
  breakdown: Array<{ rule: string; points: number; applied: boolean }>
} {
  const nameLower = lead.name.toLowerCase()
  const websiteLower = lead.website?.toLowerCase() || ''
  const addressLower = lead.address?.toLowerCase() || ''

  const breakdown = [
    {
      rule: 'Base score',
      points: 50,
      applied: true,
    },
    {
      rule: 'Website contains wedding/event keywords',
      points: 20,
      applied: ['wedding', 'event', 'bridal', 'celebration'].some(kw => websiteLower.includes(kw)),
    },
    {
      rule: 'Name contains venue/studio keywords',
      points: 15,
      applied: ['venue', 'studio', 'planner', 'coordinator', 'hall', 'ballroom'].some(kw => nameLower.includes(kw)),
    },
    {
      rule: 'In target location',
      points: 10,
      applied: context?.targetLocations?.some(loc => addressLower.includes(loc.toLowerCase())) || false,
    },
    {
      rule: 'Has phone number',
      points: 5,
      applied: !!lead.phone,
    },
    {
      rule: 'Has website',
      points: 5,
      applied: !!lead.website,
    },
  ]

  const total = Math.min(
    breakdown.reduce((sum, item) => sum + (item.applied ? item.points : 0), 0),
    100
  )

  return { total, breakdown }
}
