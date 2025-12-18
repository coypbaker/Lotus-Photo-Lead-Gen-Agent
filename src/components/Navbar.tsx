'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-[#333]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center shadow-lg shadow-[#d4af37]/20 group-hover:shadow-[#d4af37]/40 transition-all duration-300">
                <span className="text-[#0f0f0f] font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-semibold text-[#f5f5f5] tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                PhotoLead<span className="text-[#d4af37]">Agent</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {loading ? (
              <div className="h-8 w-24 bg-[#333] animate-pulse rounded-lg"></div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[#a0a0a0] hover:text-[#d4af37] px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-xl bg-[#1a1a1a] border border-[#333] px-5 py-2.5 text-sm font-medium text-[#a0a0a0] hover:text-[#f5f5f5] hover:border-[#444] transition-all duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#a0a0a0] hover:text-[#d4af37] px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
