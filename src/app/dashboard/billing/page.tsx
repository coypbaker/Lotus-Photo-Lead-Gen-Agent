'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PLANS, PlanKey } from '@/lib/plans'

interface Subscription {
  plan: PlanKey
  subscription_status: string
  current_period_end: string | null
  leads_used_this_month: number
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error)
      }

      if (data) {
        setSubscription(data)
      } else {
        // Default to free plan if no subscription exists
        setSubscription({
          plan: 'free',
          subscription_status: 'active',
          current_period_end: null,
          leads_used_this_month: 0,
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planKey: PlanKey) => {
    if (planKey === 'free') return
    
    setUpgrading(planKey)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      })

      const { url, error } = await response.json()
      
      if (error) {
        console.error('Checkout error:', error)
        alert('Failed to start checkout. Please try again.')
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setUpgrading(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })
      const { url, error } = await response.json()
      
      if (error) {
        console.error('Portal error:', error)
        alert('Failed to open billing portal. Please try again.')
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#333] border-t-[#d4af37]"></div>
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'free'
  const currentPlanDetails = PLANS[currentPlan]
  const leadsUsed = subscription?.leads_used_this_month || 0
  const leadsLimit = currentPlanDetails.leadsPerMonth
  const isUnlimited = leadsLimit === -1

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-24">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#f5f5f5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Billing & Subscription</h1>
          <p className="mt-3 text-[#a0a0a0]">
            Manage your subscription and view your usage.
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="card p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-[#666]">Current Plan</p>
              <h2 className="text-2xl font-bold text-[#f5f5f5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>{currentPlanDetails.name}</h2>
              {subscription?.subscription_status && subscription.subscription_status !== 'active' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#d4af37]/20 text-[#d4af37] mt-2">
                  {subscription.subscription_status}
                </span>
              )}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-4xl font-bold text-[#f5f5f5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                ${currentPlanDetails.price}
                <span className="text-lg font-normal text-[#666]">/month</span>
              </p>
            </div>
          </div>

          {/* Usage */}
          <div className="mt-8 pt-8 border-t border-[#333]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-[#a0a0a0]">Leads Used This Month</p>
              <p className="text-sm text-[#f5f5f5]">
                {leadsUsed} / {isUnlimited ? '∞' : leadsLimit}
              </p>
            </div>
            {!isUnlimited && (
              <div className="w-full bg-[#333] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#d4af37] to-[#e5c45e] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((leadsUsed / leadsLimit) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Manage Subscription Button */}
          {currentPlan !== 'free' && (
            <div className="mt-6">
              <button
                onClick={handleManageSubscription}
                className="text-[#d4af37] hover:text-[#e5c45e] text-sm font-medium transition-colors"
              >
                Manage subscription →
              </button>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <h3 className="text-xl font-bold text-[#f5f5f5] mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          {currentPlan === 'free' ? 'Upgrade Your Plan' : 'Available Plans'}
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => {
            const isCurrentPlan = key === currentPlan
            const isPro = key === 'pro'
            
            return (
              <div
                key={key}
                className={`rounded-2xl p-8 transition-all duration-300 ${
                  isPro
                    ? 'bg-gradient-to-b from-[#d4af37]/20 to-[#1a1a1a] border border-[#d4af37]/50 shadow-xl shadow-[#d4af37]/10'
                    : 'card'
                } ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}
              >
                {isCurrentPlan && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                    isPro ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-green-900/30 text-green-400'
                  }`}>
                    Current Plan
                  </span>
                )}
                {isPro && !isCurrentPlan && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#d4af37] to-[#e5c45e] text-[#0f0f0f] mb-4">
                    POPULAR
                  </span>
                )}
                
                <h4 className={`text-lg font-semibold ${isPro ? 'text-[#d4af37]' : 'text-[#a0a0a0]'}`}>
                  {plan.name}
                </h4>
                
                <div className="mt-3">
                  <span className="text-4xl font-bold text-[#f5f5f5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    ${plan.price}
                  </span>
                  <span className="text-[#666] ml-1">/month</span>
                </div>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-center text-sm ${isPro ? 'text-[#f5f5f5]' : 'text-[#a0a0a0]'}`}>
                      <svg className="h-5 w-5 mr-3 text-[#d4af37] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => !isCurrentPlan && key !== 'free' && handleUpgrade(key)}
                  disabled={isCurrentPlan || upgrading === key}
                  className={`mt-8 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    isCurrentPlan
                      ? 'bg-[#252525] text-[#666] cursor-default'
                      : key === 'free'
                        ? 'bg-[#252525] text-[#666] cursor-default'
                        : isPro
                          ? 'btn-gold'
                          : 'bg-[#252525] text-[#f5f5f5] border border-[#333] hover:border-[#d4af37]/50'
                  } disabled:opacity-50`}
                >
                  {upgrading === key
                    ? 'Loading...'
                    : isCurrentPlan
                      ? 'Current Plan'
                      : key === 'free'
                        ? 'Free'
                        : 'Upgrade'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
