'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
    <div className="min-h-screen flex items-center justify-center bg-[#0c0a15] py-12 px-4 sm:px-6 lg:px-8 pt-28">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-[#14b8a6] via-[#a855f7] to-[#f43f5e] flex items-center justify-center shadow-lg shadow-[#a855f7]/20">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h2 className="mt-8 text-3xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Create Your Account
          </h2>
          <p className="mt-3 text-[#a9a4b8]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#14b8a6] hover:text-[#2dd4bf] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="card p-8" onSubmit={handleSignup}>
          {error && (
            <div className="mb-6 rounded-xl bg-red-900/20 border border-red-700/30 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#f0eef5] mb-2">
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
                className="w-full px-4 py-3 bg-[#14101f] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#6b6480] focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/20"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#f0eef5] mb-2">
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
                className="w-full px-4 py-3 bg-[#14101f] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#6b6480] focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/20"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#f0eef5] mb-2">
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
                className="w-full px-4 py-3 bg-[#14101f] border border-[#2d2640] rounded-xl text-[#f0eef5] placeholder-[#6b6480] focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full btn-primary py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          
          <p className="mt-6 text-xs text-center text-[#6b6480]">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  )
}
