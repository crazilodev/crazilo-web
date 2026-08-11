'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Image as ImageIcon,
  Ticket, LogOut, Menu, X, ChevronRight, ChevronDown, Megaphone,
  Users, Star, LayoutGrid, Sparkles, Settings, Mail, AlertOctagon,
  MessageSquare
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navGroups = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  {
    label: 'Commerce',
    icon: Package,
    children: [
      { icon: Package, label: 'Products', href: '/admin/products' },
      { icon: Tags, label: 'Categories', href: '/admin/categories' },
      { icon: AlertOctagon, label: 'Inventory', href: '/admin/inventory' },
      { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
      { icon: Users, label: 'Customers', href: '/admin/customers' },
    ],
  },
  {
    label: 'Content CMS',
    icon: ImageIcon,
    children: [
      { icon: ImageIcon, label: 'Banners', href: '/admin/banners' },
      { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
      { icon: Star, label: 'Testimonials', href: '/admin/content/testimonials' },
      { icon: LayoutGrid, label: 'Feature Cards', href: '/admin/content/feature-cards' },
      { icon: Sparkles, label: 'Highlights', href: '/admin/content/highlights' },
    ],
  },
  {
    label: 'Marketing',
    icon: Ticket,
    children: [
      { icon: Ticket, label: 'Coupons', href: '/admin/coupons' },
      { icon: Mail, label: 'Newsletter', href: '/admin/marketing/newsletter' },
    ],
  },
  {
    label: 'Community',
    icon: MessageSquare,
    children: [
      { icon: MessageSquare, label: 'Reviews', href: '/admin/reviews' },
    ],
  },
  {
    label: 'Configuration',
    icon: Settings,
    children: [
      { icon: Settings, label: 'Site Settings', href: '/admin/settings' },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [pendingCounts, setPendingCounts] = useState({ orders: 0, reviews: 0 })

  useEffect(() => {
    const groupsToOpen: Record<string, boolean> = {}
    navGroups.forEach((group) => {
      if (group.children) {
        const hasActiveChild = group.children.some((child) => {
          if (child.href === '/admin') return pathname === '/admin'
          return pathname.startsWith(child.href)
        })
        if (hasActiveChild) {
          groupsToOpen[group.label] = true
        }
      }
    })
    setOpenGroups((prev) => ({ ...prev, ...groupsToOpen }))
  }, [pathname])

  // Fetch pending review and pending order metrics for badges
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const supabase = createClient()
        const [
          { count: pendingOrders },
          { count: pendingReviews }
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false)
        ])
        setPendingCounts({
          orders: pendingOrders || 0,
          reviews: pendingReviews || 0
        })
      } catch {
        // Safe silent fail
      }
    }
    fetchPendingCounts()
  }, [pathname])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const nextState: Record<string, boolean> = {}
      // Keep target group toggled, collapse all others
      nextState[label] = !prev[label]
      return nextState;
    })
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-brand-dark text-white">
      {/* Logo */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-sm">
            <Image
              src="/logo/crazilo-logo.png"
              alt="Crazilo Admin"
              width={110}
              height={36}
              className="h-7 w-auto object-contain"
            />
          </div>
        </Link>
        <span className="bg-brand-red/30 border border-brand-red/50 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navGroups.map((group) => {
          const Icon = group.icon
          
          if (!group.children) {
            // Direct Link
            const isActive =
              group.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(group.href!)
                 
            return (
              <Link
                key={group.href}
                href={group.href!}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                <span>{group.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
              </Link>
            )
          }

          // Collapsible Group
          const isExpanded = !!openGroups[group.label]
          const isGroupActive = group.children.some((child) =>
            pathname.startsWith(child.href)
          )

          return (
            <div key={group.label} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isGroupActive
                    ? 'text-white bg-white/5'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {Icon && <Icon className="w-5 h-5 flex-shrink-0 text-white/50" />}
                <span>{group.label}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 ml-auto opacity-60" />
                ) : (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                )}
              </button>

              {isExpanded && (
                <div className="pl-4 space-y-1 transition-all duration-200">
                  {group.children.map((child) => {
                    const ChildIcon = child.icon
                    const isChildActive = pathname === child.href || (child.href !== '/admin' && pathname.startsWith(child.href))

                    // Dynamically map counts to badges for Orders & Reviews
                    let badgeCount = 0
                    if (child.label === 'Orders') badgeCount = pendingCounts.orders
                    if (child.label === 'Reviews') badgeCount = pendingCounts.reviews

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                          isChildActive
                            ? 'text-white bg-brand-red shadow-md shadow-brand-red/20'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {ChildIcon && <ChildIcon className="w-4 h-4 flex-shrink-0" />}
                        <span className="flex-1 text-left">{child.label}</span>
                        {badgeCount > 0 && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isChildActive ? 'bg-white text-brand-red' : 'bg-brand-red text-white'
                          }`}>
                            {badgeCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
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
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[150]"
          onClick={() => setIsOpen(false)}
        />
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
