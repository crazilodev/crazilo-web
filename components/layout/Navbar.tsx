'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShoppingCart, User, Heart, ChevronDown,
  LogOut, Package, Settings, Crown, X
} from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/store/cartStore'
import { useWishlistStore } from '@/lib/store/wishlistStore'
import { Category, Profile } from '@/types'
import type { User as SupaUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<SupaUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toggleCart, getTotalItems } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const totalCartItems = getTotalItems()
  const wishlistCount = wishlistItems.length

  useEffect(() => {
    const supabase = createClient()
    const fetchData = async () => {
      const [{ data: cats }, { data: { user: u } }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('display_order').limit(10),
        supabase.auth.getUser(),
      ])
      if (cats) setCategories(cats)
      if (u) {
        setUser(u)
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).single()
        if (prof) setProfile(prof)
      }
    }
    fetchData()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setProfile(prof)
      } else { setProfile(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setShowSearch(false)
    setShowCategories(false)
    setShowUserMenu(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Best Sellers', href: '/products?sort=popular' },
    { label: 'Offers', href: '/products?tag=sale' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-200">
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <Image
              src="/logo/crazilo-logo.png"
              alt="Crazilo Dryfruits and Spices"
              width={160}
              height={56}
              className="h-10 lg:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav Links (High Contrast Dark Text) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-brand-red bg-red-50'
                      : 'text-gray-800 hover:text-brand-red hover:bg-gray-100/70'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {/* Categories Menu */}
            <div
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-800 hover:text-brand-red hover:bg-gray-100/70 rounded-full transition-all duration-200">
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 z-50"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:text-brand-red hover:bg-red-50 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Action Icons (High Contrast) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2.5 text-gray-700 hover:text-brand-red transition-colors rounded-full hover:bg-gray-100"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account"
              className="relative p-2.5 text-gray-700 hover:text-brand-red transition-colors rounded-full hover:bg-gray-100"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 text-gray-700 hover:text-brand-red transition-colors rounded-full hover:bg-gray-100"
              aria-label="Cart"
              id="cart-toggle-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartItems > 0 && (
                <motion.span
                  key={totalCartItems}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm"
                >
                  {totalCartItems > 9 ? '9+' : totalCartItems}
                </motion.span>
              )}
            </button>

            {/* User Account / Sign In */}
            <div className="relative ml-1">
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 text-gray-700 hover:text-brand-red transition-colors rounded-full hover:bg-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-sm hover:shadow-md"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-sm text-gray-900 truncate">{profile?.full_name || 'My Account'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {profile?.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-brand-gold hover:bg-amber-50">
                        <Crown className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <Link href="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Package className="w-4 h-4 text-gray-400" /> My Orders
                    </Link>
                    <Link href="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="w-4 h-4 text-gray-400" /> Account Settings
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left border-t border-gray-100">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Search Drawer Input */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pb-4 border-t border-gray-100 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex gap-2 pt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dry fruits, nuts, spices, makhana..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 text-sm input-brand bg-gray-50"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-red text-white text-xs font-bold rounded-full hover:bg-brand-red-dark transition-colors"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
