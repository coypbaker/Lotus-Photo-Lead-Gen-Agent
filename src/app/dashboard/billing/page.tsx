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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'free'
  const currentPlanDetails = PLANS[currentPlan]
  const leadsUsed = subscription?.leads_used_this_month || 0
  const leadsLimit = currentPlanDetails.leadsPerMonth
  const isUnlimited = leadsLimit === -1

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription and view your usage.
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <h2 className="text-2xl font-bold text-gray-900">{currentPlanDetails.name}</h2>
              {subscription?.subscription_status && subscription.subscription_status !== 'active' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                  {subscription.subscription_status}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                ${currentPlanDetails.price}
                <span className="text-base font-normal text-gray-500">/month</span>
              </p>
            </div>
          </div>

          {/* Usage */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Leads Used This Month</p>
              <p className="text-sm text-gray-600">
                {leadsUsed} / {isUnlimited ? '∞' : leadsLimit}
              </p>
            </div>
            {!isUnlimited && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all"
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
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Manage subscription →
              </button>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {currentPlan === 'free' ? 'Upgrade Your Plan' : 'Available Plans'}
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => {
            const isCurrentPlan = key === currentPlan
            const isPro = key === 'pro'
            
            return (
              <div
                key={key}
                className={`rounded-2xl p-6 ${
                  isPro
                    ? 'bg-gradient-to-br from-purple-600 to-blue-500 text-white ring-4 ring-purple-200'
                    : 'bg-white border border-gray-200'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isCurrentPlan && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${
                    isPro ? 'bg-white/20 text-white' : 'bg-green-100 text-green-800'
                  }`}>
                    Current Plan
                  </span>
                )}
                {isPro && !isCurrentPlan && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900 mb-3">
                    POPULAR
                  </span>
                )}
                
                <h4 className={`text-lg font-semibold ${isPro ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h4>
                
                <div className="mt-2">
                  <span className={`text-3xl font-bold ${isPro ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={isPro ? 'text-purple-100' : 'text-gray-500'}>/month</span>
                </div>
                
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-center text-sm ${isPro ? 'text-white' : 'text-gray-600'}`}>
                      <svg className={`h-4 w-4 mr-2 ${isPro ? 'text-yellow-400' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => !isCurrentPlan && key !== 'free' && handleUpgrade(key)}
                  disabled={isCurrentPlan || upgrading === key}
                  className={`mt-6 w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                    isCurrentPlan
                      ? isPro
                        ? 'bg-white/20 text-white cursor-default'
                        : 'bg-gray-100 text-gray-400 cursor-default'
                      : key === 'free'
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : isPro
                          ? 'bg-white text-purple-600 hover:bg-gray-100'
                          : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600'
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
