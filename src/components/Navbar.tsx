'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, Settings, CreditCard, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

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
    setMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-[#2d2640]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-[#14b8a6] via-[#a855f7] to-[#f43f5e] flex items-center justify-center shadow-lg shadow-[#a855f7]/20 group-hover:shadow-[#a855f7]/40 transition-all duration-300"
                >
                  <span className="text-white font-bold text-base sm:text-lg">L</span>
                </motion.div>
                <span className="text-lg sm:text-xl font-semibold text-[#f0eef5] tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                  Lotus <span className="text-gradient-primary hidden sm:inline">Photo Leads</span>
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-[#1a1528] border border-[#2d2640] hover:border-[#a855f7]/50 transition-all"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Sun className="h-4 w-4 text-[#f59e0b]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Moon className="h-4 w-4 text-[#a855f7]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {loading ? (
                <div className="h-8 w-24 bg-[#2d2640] animate-pulse rounded-lg"></div>
              ) : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-[#a9a4b8] hover:text-[#14b8a6] px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignOut}
                    className="rounded-xl bg-[#1a1528] border border-[#2d2640] px-5 py-2.5 text-sm font-medium text-[#a9a4b8] hover:text-[#f0eef5] hover:border-[#a855f7]/50 transition-all duration-200"
                  >
                    Sign Out
                  </motion.button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[#a9a4b8] hover:text-[#14b8a6] px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Log In
                  </Link>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/signup"
                      className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold inline-block"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-[#a9a4b8] hover:text-[#f0eef5] hover:bg-[#1e1830] transition-all"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[#0c0a15]/80 backdrop-blur-sm md:hidden"
              onClick={closeMobileMenu}
            />
            
            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 glass-dark border-l border-[#2d2640] md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#2d2640]">
                  <span className="text-lg font-semibold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Menu
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Mobile Theme Toggle */}
                    <motion.button
                      onClick={toggleTheme}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl bg-[#1a1528] border border-[#2d2640] transition-all"
                      aria-label="Toggle theme"
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-4 w-4 text-[#f59e0b]" />
                      ) : (
                        <Moon className="h-4 w-4 text-[#a855f7]" />
                      )}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={closeMobileMenu}
                      className="p-2 rounded-xl text-[#6b6480] hover:text-[#f0eef5] hover:bg-[#1e1830] transition-all"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-[#1e1830] animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : user ? (
                    <div className="space-y-2">
                      {menuItems.map((item, index) => (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={item.href}
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 p-4 rounded-xl text-[#a9a4b8] hover:text-[#f0eef5] hover:bg-[#1e1830] transition-all active:scale-95"
                          >
                            <item.icon className="h-5 w-5 text-[#14b8a6]" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </motion.div>
                      ))}
                      
                      <div className="pt-4 mt-4 border-t border-[#2d2640]">
                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full p-4 rounded-xl text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-all active:scale-95"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">Sign Out</span>
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Link
                          href="/login"
                          onClick={closeMobileMenu}
                          className="flex items-center justify-center p-4 rounded-xl text-[#f0eef5] border border-[#2d2640] hover:border-[#14b8a6]/50 transition-all active:scale-95"
                        >
                          Log In
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Link
                          href="/signup"
                          onClick={closeMobileMenu}
                          className="flex items-center justify-center p-4 rounded-xl text-[#0c0a15] font-semibold bg-gradient-to-r from-[#14b8a6] to-[#0d9488] shadow-lg shadow-[#14b8a6]/25 active:scale-95"
                        >
                          Get Started
                        </Link>
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Footer */}
                {user && (
                  <div className="p-4 border-t border-[#2d2640]">
                    <p className="text-xs text-[#6b6480] truncate">
                      Signed in as: <span className="text-[#a9a4b8]">{user.email}</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
