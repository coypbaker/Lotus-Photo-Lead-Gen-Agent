import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateLeadScore } from '@/lib/leadScoring'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

interface PlaceResult {
  place_id: string
  name: string
  formatted_address?: string
  formatted_phone_number?: string
  website?: string
  types?: string[]
}

export async function POST() {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('photographer_niche, target_locations')
      .eq('user_id', user.id)
      .single()

    if (!settings?.target_locations) {
      return NextResponse.json(
        { error: 'Please configure your target locations in Settings first' },
        { status: 400 }
      )
    }

    // Parse locations (comma-separated)
    const locations = settings.target_locations
      .split(',')
      .map((loc: string) => loc.trim())
      .filter(Boolean)

    if (locations.length === 0) {
      return NextResponse.json(
        { error: 'No target locations configured' },
        { status: 400 }
      )
    }

    // Build search queries based on niche
    const niche = settings.photographer_niche?.toLowerCase() || 'wedding'
    const searchQueries = buildSearchQueries(niche, locations)

    // Fetch leads from Google Places
    const allLeads: PlaceResult[] = []
    
    for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries
      const places = await searchGooglePlaces(query)
      allLeads.push(...places)
      
      if (allLeads.length >= 10) break
    }

    // Deduplicate by place_id and limit to 10
    const uniqueLeads = Array.from(
      new Map(allLeads.map(lead => [lead.place_id, lead])).values()
    ).slice(0, 10)

    // Get existing place_ids for this user to avoid duplicates
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('place_id')
      .eq('user_id', user.id)

    const existingPlaceIds = new Set(existingLeads?.map(l => l.place_id) || [])

    // Filter out existing leads
    const newLeads = uniqueLeads.filter(lead => !existingPlaceIds.has(lead.place_id))

    if (newLeads.length === 0) {
      return NextResponse.json({
        message: 'No new leads found. Try expanding your search locations.',
        leadsAdded: 0,
      })
    }

    // Insert new leads with scoring
    const scoringContext = {
      targetLocations: locations,
      niche: niche,
    }
    
    const leadsToInsert = newLeads.map(lead => ({
      user_id: user.id,
      name: lead.name,
      website: lead.website || null,
      phone: lead.formatted_phone_number || null,
      address: lead.formatted_address || null,
      place_id: lead.place_id,
      source: 'google_places',
      score: calculateLeadScore({
        name: lead.name,
        website: lead.website,
        phone: lead.formatted_phone_number,
        address: lead.formatted_address,
      }, scoringContext),
      status: 'new',
    }))

    const { error: insertError } = await supabase
      .from('leads')
      .insert(leadsToInsert)

    if (insertError) {
      console.error('Error inserting leads:', insertError)
      return NextResponse.json(
        { error: 'Failed to save leads' },
        { status: 500 }
      )
    }

    // Update leads_used_this_month in user_subscriptions
    await supabase
      .from('user_subscriptions')
      .update({
        leads_used_this_month: supabase.rpc('increment_leads', { count: newLeads.length })
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      message: `Found ${newLeads.length} new leads!`,
      leadsAdded: newLeads.length,
    })

  } catch (error) {
    console.error('Lead generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate leads' },
      { status: 500 }
    )
  }
}

function buildSearchQueries(niche: string, locations: string[]): string[] {
  const queries: string[] = []
  
  const searchTerms: Record<string, string[]> = {
    wedding: ['wedding venue', 'event venue', 'wedding planner', 'bridal shop'],
    portrait: ['photo studio', 'photography studio', 'modeling agency'],
    event: ['event venue', 'conference center', 'banquet hall', 'event planner'],
    corporate: ['corporate office', 'conference center', 'coworking space'],
    real_estate: ['real estate agency', 'property management', 'luxury homes'],
    default: ['wedding venue', 'event venue', 'photography studio'],
  }

  const terms = searchTerms[niche] || searchTerms.default

  for (const location of locations) {
    for (const term of terms) {
      queries.push(`${term} ${location}`)
    }
  }

  return queries
}

async function searchGooglePlaces(query: string): Promise<PlaceResult[]> {
  try {
    // Text Search API
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (searchData.status !== 'OK' || !searchData.results) {
      console.log('Places search status:', searchData.status)
      return []
    }

    // Get details for each place (limited to first 5 to conserve API calls)
    const detailedResults: PlaceResult[] = []
    
    for (const place of searchData.results.slice(0, 5)) {
      const details = await getPlaceDetails(place.place_id)
      if (details) {
        detailedResults.push(details)
      }
    }

    return detailedResults
  } catch (error) {
    console.error('Google Places search error:', error)
    return []
  }
}

async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,website,types&key=${GOOGLE_PLACES_API_KEY}`
    
    const response = await fetch(detailsUrl)
    const data = await response.json()

    if (data.status === 'OK' && data.result) {
      return data.result as PlaceResult
    }
    return null
  } catch (error) {
    console.error('Place details error:', error)
    return null
  }
}

