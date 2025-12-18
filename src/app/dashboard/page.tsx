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
    <div className="min-h-screen bg-[#0c0a15] pt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Dashboard Navigation */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[#f0eef5]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Dashboard
          </h1>
          <div className="flex items-center space-x-2 p-1.5 bg-[#14101f] rounded-xl border border-[#2d2640]">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-lg"
            >
              Leads
            </Link>
            <Link
              href="/dashboard/settings"
              className="px-5 py-2.5 text-sm font-medium text-[#a9a4b8] hover:text-[#f0eef5] hover:bg-[#1e1830] rounded-lg transition-all duration-200"
            >
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              className="px-5 py-2.5 text-sm font-medium text-[#a9a4b8] hover:text-[#f0eef5] hover:bg-[#1e1830] rounded-lg transition-all duration-200"
            >
              Billing
            </Link>
          </div>
        </div>

        <div className="card p-8">
          <LeadsPanel />
        </div>
        
        <div className="mt-8 text-center text-sm text-[#6b6480]">
          Logged in as: <span className="text-[#a9a4b8]">{user.email}</span>
        </div>
      </div>
    </div>
  )
}
