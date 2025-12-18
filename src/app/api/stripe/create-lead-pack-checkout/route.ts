import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// Lead pack price configurations (in cents)
const LEAD_PACK_PRICES: Record<string, { 
  amount: number; 
  leads: number; 
  name: string;
  allowedPlans: string[];
}> = {
  'free-50': { 
    amount: 1000, // $10
    leads: 50, 
    name: '50 Extra Leads (Free Plan)',
    allowedPlans: ['free'],
  },
  'pro-100': { 
    amount: 1000, // $10
    leads: 100, 
    name: '100 Extra Leads (Pro Plan)',
    allowedPlans: ['pro'],
  },
  'pro-250': { 
    amount: 2000, // $20
    leads: 250, 
    name: '250 Extra Leads (Pro Plan)',
    allowedPlans: ['pro'],
  },
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packId } = await req.json()

    if (!packId || !LEAD_PACK_PRICES[packId]) {
      return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 })
    }

    const pack = LEAD_PACK_PRICES[packId]

    // Get user's current subscription to verify they can purchase this pack
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single()

    const currentPlan = subscription?.plan || 'free'

    if (!pack.allowedPlans.includes(currentPlan)) {
      return NextResponse.json({ 
        error: `This pack is not available for your plan` 
      }, { status: 400 })
    }

    // Create Stripe checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pack.name,
              description: `Add ${pack.leads} extra leads to your account`,
            },
            unit_amount: pack.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=lead-pack&leads=${pack.leads}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        pack_id: packId,
        leads: pack.leads.toString(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Lead pack checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
