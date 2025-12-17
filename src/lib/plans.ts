export const PLANS = {
  free: {
    name: 'Free',
    priceId: null as string | null,
    price: 0,
    leadsPerMonth: 10,
    features: [
      '10 leads/month',
      'Basic lead scoring',
      'Email notifications',
    ],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
    price: 29,
    leadsPerMonth: 200,
    features: [
      '200 leads/month',
      'Priority AI scanning',
      'Advanced lead scoring',
      'Outreach templates',
      'Email support',
    ],
  },
  premium: {
    name: 'Premium',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    price: 79,
    leadsPerMonth: -1,
    features: [
      'Unlimited leads',
      'Priority AI scanning',
      'Advanced lead scoring',
      'Outreach templates',
      'Multi-location support',
      'Priority support',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS

export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return key as PlanKey
    }
  }
  return null
}

export function getPlanLimits(plan: PlanKey) {
  return {
    leadsPerMonth: PLANS[plan].leadsPerMonth,
    isUnlimited: PLANS[plan].leadsPerMonth === -1,
  }
}
