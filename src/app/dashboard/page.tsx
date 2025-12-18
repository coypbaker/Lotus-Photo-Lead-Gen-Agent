import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LeadsPanel from '@/components/LeadsPanel'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Dashboard Navigation */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[#f5f5f5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Dashboard
          </h1>
          <div className="flex items-center space-x-2 p-1.5 bg-[#1a1a1a] rounded-xl border border-[#333]">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-medium text-[#0f0f0f] bg-gradient-to-r from-[#d4af37] to-[#b8962e] rounded-lg"
            >
              Leads
            </Link>
            <Link
              href="/dashboard/settings"
              className="px-5 py-2.5 text-sm font-medium text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#252525] rounded-lg transition-all duration-200"
            >
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              className="px-5 py-2.5 text-sm font-medium text-[#a0a0a0] hover:text-[#f5f5f5] hover:bg-[#252525] rounded-lg transition-all duration-200"
            >
              Billing
            </Link>
          </div>
        </div>

        <div className="card p-8">
          <LeadsPanel />
        </div>
        
        <div className="mt-8 text-center text-sm text-[#666]">
          Logged in as: <span className="text-[#a0a0a0]">{user.email}</span>
        </div>
      </div>
    </div>
  )
}
