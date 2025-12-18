'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, Sparkles, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/context/ThemeContext'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-28 relative overflow-hidden">
      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-24 right-6 p-3 rounded-xl glass hover:scale-105 transition-transform z-20"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-5 w-5 text-[#f59e0b]" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-5 w-5 text-[#a855f7]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Background glows */}
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#14b8a6]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-[#a855f7]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#f43f5e]/5 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-[#14b8a6] via-[#a855f7] to-[#f43f5e] flex items-center justify-center shadow-xl shadow-[#a855f7]/30"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-4xl font-bold text-[#f0eef5]" 
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            Join Lotus
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-[#a9a4b8]"
          >
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#14b8a6] hover:text-[#2dd4bf] transition-colors">
              Sign in
            </Link>
          </motion.p>
        </div>
        
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl p-10" 
          onSubmit={handleSignup}
        >
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 rounded-2xl bg-red-900/20 border border-red-700/30 p-5 flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#a9a4b8] mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#14b8a6]" />
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#4d4660] focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#a9a4b8] mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#a855f7]" />
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#4d4660] focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#a9a4b8] mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#f43f5e]" />
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-4 bg-[#0c0a15] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#4d4660] focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 focus:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="mt-10 w-full relative overflow-hidden group py-4 rounded-2xl font-semibold text-[#0c0a15] bg-gradient-to-r from-[#14b8a6] via-[#2dd4bf] to-[#14b8a6] bg-[length:200%_100%] disabled:opacity-50 shadow-lg shadow-[#14b8a6]/25 hover:shadow-[#14b8a6]/40 transition-shadow flex items-center justify-center gap-2"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">
              {loading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 border-2 border-[#0c0a15]/30 border-t-[#0c0a15] rounded-full"
                />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="inline-block ml-2 h-4 w-4" />
                </>
              )}
            </span>
          </motion.button>
          
          <p className="mt-8 text-xs text-center text-[#6b6480]">
            By signing up, you agree to our{' '}
            <span className="text-[#a9a4b8] hover:text-[#14b8a6] cursor-pointer transition-colors">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[#a9a4b8] hover:text-[#14b8a6] cursor-pointer transition-colors">Privacy Policy</span>.
          </p>
        </motion.form>
      </motion.div>
    </div>
  )
}
