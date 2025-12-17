import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanByPriceId } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Create admin client for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planKey = session.metadata?.planKey

        if (userId && planKey && session.subscription) {
          // Get subscription details
          const subscriptionResponse = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          const subscription = subscriptionResponse as Stripe.Subscription

          // Update or insert user subscription
          const { error } = await supabaseAdmin
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              plan: planKey,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0]?.price.id,
              subscription_status: subscription.status,
              current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
            }, { onConflict: 'user_id' })

          if (error) {
            console.error('Error updating subscription:', error)
          } else {
            console.log('Subscription created for user:', userId, 'Plan:', planKey)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const planKey = priceId ? getPlanByPriceId(priceId) : null
        const subData = subscription as unknown as { current_period_start: number; current_period_end: number }

        // Find user by stripe_subscription_id and update
        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            plan: planKey || 'free',
            subscription_status: subscription.status,
            stripe_price_id: priceId,
            current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('Subscription updated:', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Downgrade to free plan
        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            plan: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            stripe_price_id: null,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error canceling subscription:', error)
        } else {
          console.log('Subscription canceled:', subscription.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const invoiceData = invoice as unknown as { subscription?: string }
        
        if (invoiceData.subscription) {
          const { error } = await supabaseAdmin
            .from('user_subscriptions')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_subscription_id', invoiceData.subscription)

          if (error) {
            console.error('Error updating payment status:', error)
          }
        }
        console.log('Payment failed for invoice:', invoice.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
