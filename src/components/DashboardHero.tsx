'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardHeroProps {
  userEmail: string
}

export default function DashboardHero({ userEmail }: DashboardHeroProps) {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/dashboard', label: 'Leads', icon: '📋' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
    { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
  ]

  return (
    <div className="relative">
      {/* Hero Section with Photography Backdrop */}
      <div className="relative h-72 sm:h-80 overflow-hidden rounded-3xl mb-10">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&q=80)',
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a15]/95 via-[#0c0a15]/80 to-[#0c0a15]/60" />
        {/* Purple/Teal Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a855f7]/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#14b8a6]/20 blur-[80px] rounded-full" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-center px-8 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#14b8a6] text-sm font-medium tracking-widest uppercase mb-3">
              Lotus Photo Leads
            </p>
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#f0eef5] leading-tight max-w-2xl"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              Your Autonomous Photography Lead Agent
            </h1>
            <p className="mt-4 text-[#a9a4b8] text-lg max-w-xl">
              AI-powered lead discovery working 24/7 to grow your photography business.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Elegant Navigation Pills */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <nav className="flex items-center gap-1 p-1 glass rounded-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-3 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'text-white'
                    : 'text-[#a9a4b8] hover:text-[#f0eef5] hover:bg-[#1e1830]/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-xl"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10 hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="text-sm text-[#6b6480]">
          <span className="text-[#a9a4b8]">{userEmail}</span>
        </div>
      </motion.div>
    </div>
  )
}
