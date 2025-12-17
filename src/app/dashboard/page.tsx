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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg"
            >
              Leads
            </Link>
            <Link
              href="/dashboard/settings"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Billing
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <LeadsPanel />
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Logged in as: {user.email}
        </div>
      </div>
    </div>
  )
}
