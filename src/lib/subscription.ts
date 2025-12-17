import { createClient } from '@/lib/supabase/server'
import { PLANS, PlanKey } from '@/lib/stripe'

export interface SubscriptionData {
  plan: PlanKey
  leadsUsed: number
  leadsLimit: number
  isUnlimited: boolean
  canGenerateLead: boolean
  remainingLeads: number
}

export async function getUserSubscription(userId: string): Promise<SubscriptionData> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  const plan: PlanKey = data?.plan || 'free'
  const leadsUsed = data?.leads_used_this_month || 0
  const planDetails = PLANS[plan]
  const leadsLimit = planDetails.leadsPerMonth
  const isUnlimited = leadsLimit === -1
  const remainingLeads = isUnlimited ? Infinity : Math.max(0, leadsLimit - leadsUsed)
  const canGenerateLead = isUnlimited || leadsUsed < leadsLimit

  return {
    plan,
    leadsUsed,
    leadsLimit,
    isUnlimited,
    canGenerateLead,
    remainingLeads,
  }
}

export async function incrementLeadCount(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // First check if user can generate a lead
  const subscription = await getUserSubscription(userId)
  
  if (!subscription.canGenerateLead) {
    return false
  }

  // Check if we need to reset the monthly count
  const { data: subData } = await supabase
    .from('user_subscriptions')
    .select('leads_reset_date')
    .eq('user_id', userId)
    .single()

  const resetDate = subData?.leads_reset_date ? new Date(subData.leads_reset_date) : null
  const now = new Date()
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

  if (resetDate && resetDate < oneMonthAgo) {
    // Reset the count
    await supabase
      .from('user_subscriptions')
      .update({
        leads_used_this_month: 1,
        leads_reset_date: now.toISOString(),
      })
      .eq('user_id', userId)
  } else {
    // Increment the count
    await supabase
      .from('user_subscriptions')
      .update({
        leads_used_this_month: subscription.leadsUsed + 1,
      })
      .eq('user_id', userId)
  }

  return true
}

export async function ensureUserSubscription(userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!data) {
    // Create default free subscription
    await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan: 'free',
        subscription_status: 'active',
        leads_used_this_month: 0,
        leads_reset_date: new Date().toISOString(),
      })
  }
}
