import AdminSidebar from '@/components/admin/AdminSidebar'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

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
        <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Control Panel
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-brand-red uppercase tracking-wider">
              Management Suite
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick action or Admin Avatar details */}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-tight">
                {adminName}
              </p>
              <p className="text-[10px] text-gray-400 font-mono">
                {adminEmail}
              </p>
            </div>
            
            <div className="w-9 h-9 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red font-bold text-sm shadow-inner uppercase">
              {adminName[0]}
            </div>
          </div>
        </header>

        {/* Dynamic Panel Workspace content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
