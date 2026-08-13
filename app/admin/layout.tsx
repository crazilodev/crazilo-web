import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: { default: 'Admin Panel | Crazilo', template: '%s | Admin — Crazilo' },
  robots: 'noindex, nofollow',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const adminName = profile?.full_name || user?.email?.split('@')[0] || 'Admin'
  const adminEmail = user?.email || 'admin@crazilo.com'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar navigation */}
      <AdminSidebar />

      {/* Main Admin Workspace */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Control Bar Header */}
        <AdminHeader adminName={adminName} adminEmail={adminEmail} />

        {/* Dynamic Panel Workspace content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
