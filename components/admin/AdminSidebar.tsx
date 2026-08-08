'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Image as ImageIcon,
  Ticket, BarChart3, LogOut, Menu, X, ChevronRight, Megaphone
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: Tags, label: 'Categories', href: '/admin/categories' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: ImageIcon, label: 'Banners', href: '/admin/banners' },
  { icon: Ticket, label: 'Coupons', href: '/admin/coupons' },
  { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-sm">
            <Image src="/logo/crazilo-logo.png" alt="Crazilo Admin" width={110} height={36} className="h-7 w-auto object-contain" />
          </div>
        </Link>
        <span className="bg-brand-red/30 border border-brand-red/50 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <Package className="w-4 h-4" /> View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[200] w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-white shadow-lg"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-[150]" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-brand-dark z-[160] transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
