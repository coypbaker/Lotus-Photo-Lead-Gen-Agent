import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeadsPanel from '@/components/LeadsPanel'
import DashboardHero from '@/components/DashboardHero'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0c0a15] pt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <DashboardHero userEmail={user.email || ''} />
        
        <LeadsPanel />
      </div>
    </div>
  )
}
