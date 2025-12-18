'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Zap, Crown, Sparkles, Check, ArrowRight, TrendingUp, Users, Mail } from 'lucide-react'
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
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
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

  const planIcons: Record<PlanKey, typeof Zap> = {
    free: Users,
    pro: Zap,
    premium: Crown,
  }

  const planColors: Record<PlanKey, string> = {
    free: '#14b8a6',
    pro: '#a855f7',
    premium: '#f59e0b',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0a15] flex items-center justify-center pt-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-2 border-[#2d2640] border-t-[#14b8a6]"
        />
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'free'
  const currentPlanDetails = PLANS[currentPlan]
  const leadsUsed = subscription?.leads_used_this_month || 0
  const leadsLimit = currentPlanDetails.leadsPerMonth
  const isUnlimited = leadsLimit === -1

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0c0a15] pt-24"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#f59e0b] via-[#a855f7] to-[#14b8a6] flex items-center justify-center">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Billing & Subscription
              </h1>
              <p className="text-[#6b6480]">Manage your plan and usage</p>
            </div>
          </div>
        </motion.div>

        {/* Current Plan Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 mb-10 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7]/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div 
                className="h-16 w-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${planColors[currentPlan]}20` }}
              >
                {(() => {
                  const Icon = planIcons[currentPlan]
                  return <Icon className="h-8 w-8" style={{ color: planColors[currentPlan] }} />
                })()}
              </div>
              <div>
                <p className="text-sm text-[#6b6480] mb-1">Current Plan</p>
                <h2 className="text-2xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                  {currentPlanDetails.name}
                </h2>
                {subscription?.subscription_status && subscription.subscription_status !== 'active' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#a855f7]/20 text-[#a855f7] mt-2">
                    {subscription.subscription_status}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-left lg:text-right">
              <p className="text-5xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                ${currentPlanDetails.price}
                <span className="text-lg font-normal text-[#6b6480]">/mo</span>
              </p>
            </div>
          </div>

          {/* Elegant Divider */}
          <div className="h-px w-full my-8" style={{ background: 'linear-gradient(to right, transparent, #a855f740, transparent)' }} />

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#0c0a15]/50">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-[#14b8a6]" />
                <span className="text-sm text-[#6b6480]">Leads Used</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-[#f0eef5]">{leadsUsed}</span>
                <span className="text-[#6b6480] mb-1">/ {isUnlimited ? '∞' : leadsLimit}</span>
              </div>
              {!isUnlimited && (
                <div className="mt-3 w-full bg-[#2d2640] rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((leadsUsed / leadsLimit) * 100, 100)}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="bg-gradient-to-r from-[#14b8a6] to-[#a855f7] h-2 rounded-full"
                  />
                </div>
              )}
            </div>
            
            <div className="p-5 rounded-2xl bg-[#0c0a15]/50">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-[#a855f7]" />
                <span className="text-sm text-[#6b6480]">Outreach Limit</span>
              </div>
              <span className="text-3xl font-bold text-[#f0eef5]">
                {currentPlan === 'premium' ? '∞' : currentPlan === 'pro' ? '100' : '10'}
              </span>
              <span className="text-[#6b6480] ml-2">/month</span>
            </div>
            
            <div className="p-5 rounded-2xl bg-[#0c0a15]/50">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-[#f59e0b]" />
                <span className="text-sm text-[#6b6480]">AI Features</span>
              </div>
              <span className="text-lg font-semibold text-[#f0eef5]">
                {currentPlan === 'premium' ? 'Full Access' : currentPlan === 'pro' ? 'Enhanced' : 'Basic'}
              </span>
            </div>
          </div>

          {/* Manage Subscription Button */}
          {currentPlan !== 'free' && (
            <motion.button
              onClick={handleManageSubscription}
              whileHover={{ x: 5 }}
              className="mt-6 text-[#14b8a6] hover:text-[#2dd4bf] text-sm font-medium transition-colors flex items-center gap-2"
            >
              Manage subscription
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          )}
        </motion.div>

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            {currentPlan === 'free' ? 'Upgrade Your Plan' : 'Available Plans'}
          </h3>
          <p className="text-[#6b6480] mt-2">Choose the plan that fits your photography business</p>
        </motion.div>
        
        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan], index) => {
            const isCurrentPlan = key === currentPlan
            const isPro = key === 'pro'
            const Icon = planIcons[key]
            const color = planColors[key]
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onMouseEnter={() => setHoveredPlan(key)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative rounded-3xl p-8 transition-all duration-500 ${
                  isPro
                    ? 'bg-gradient-to-b from-[#a855f7]/20 via-[#1a1528] to-[#14101f] border-2 border-[#a855f7]/50'
                    : 'glass'
                } ${isCurrentPlan ? 'ring-2 ring-[#14b8a6]' : ''}`}
                style={{
                  transform: hoveredPlan === key ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: hoveredPlan === key ? `0 20px 40px ${color}20` : 'none',
                }}
              >
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 pointer-events-none"
                  style={{ 
                    opacity: hoveredPlan === key ? 0.5 : 0,
                    background: `radial-gradient(circle at 50% 0%, ${color}20, transparent 70%)`,
                  }}
                />

                {/* Badge */}
                {isCurrentPlan && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#14b8a6]/20 text-[#14b8a6] mb-4">
                    <Check className="h-3.5 w-3.5" />
                    Current Plan
                  </span>
                )}
                {isPro && !isCurrentPlan && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#14b8a6] via-[#a855f7] to-[#f43f5e] text-white mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    MOST POPULAR
                  </span>
                )}
                
                {/* Plan Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="h-6 w-6" style={{ color }} />
                  </div>
                  <h4 className="text-xl font-semibold text-[#f0eef5]">{plan.name}</h4>
                </div>
                
                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    ${plan.price}
                  </span>
                  <span className="text-[#6b6480] ml-2">/month</span>
                </div>

                {/* Divider */}
                <div className="h-px w-full mb-6" style={{ background: `linear-gradient(to right, transparent, ${color}40, transparent)` }} />
                
                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#a9a4b8]">
                      <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <motion.button
                  onClick={() => !isCurrentPlan && key !== 'free' && handleUpgrade(key)}
                  disabled={isCurrentPlan || upgrading === key || key === 'free'}
                  whileHover={{ scale: isCurrentPlan || key === 'free' ? 1 : 1.02 }}
                  whileTap={{ scale: isCurrentPlan || key === 'free' ? 1 : 0.98 }}
                  className={`relative overflow-hidden w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                    isCurrentPlan
                      ? 'bg-[#1e1830] text-[#6b6480] cursor-default'
                      : key === 'free'
                        ? 'bg-[#1e1830] text-[#6b6480] cursor-default'
                        : 'text-[#0c0a15] shadow-lg'
                  } disabled:opacity-50`}
                  style={{
                    background: isCurrentPlan || key === 'free' 
                      ? undefined 
                      : `linear-gradient(135deg, ${color}, ${color}dd)`,
                    boxShadow: isCurrentPlan || key === 'free' 
                      ? undefined 
                      : `0 4px 20px ${color}40`,
                  }}
                >
                  {/* Shine effect */}
                  {!isCurrentPlan && key !== 'free' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    {upgrading === key ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-[#0c0a15]/30 border-t-[#0c0a15] rounded-full"
                        />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <Check className="h-5 w-5" />
                        Current Plan
                      </>
                    ) : key === 'free' ? (
                      'Free Forever'
                    ) : (
                      <>
                        Upgrade Now
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
