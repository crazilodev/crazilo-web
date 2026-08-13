'use client'

import { Menu } from 'lucide-react'
import { useAdminSidebarStore } from '@/lib/store/adminSidebarStore'

interface AdminHeaderProps {
  adminName: string
  adminEmail: string
}

export default function AdminHeader({ adminName, adminEmail }: AdminHeaderProps) {
  const { toggle } = useAdminSidebarStore()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-2 rounded-xl text-gray-700 hover:text-brand-red hover:bg-gray-100 transition-colors flex items-center justify-center"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-semibold text-gray-450 uppercase tracking-widest">
            Control Panel
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-[10px] sm:text-xs font-bold text-brand-red uppercase tracking-wider">
            Management Suite
          </span>
        </div>
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
  )
}
