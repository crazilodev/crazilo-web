'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShoppingCart, User, Heart, ChevronDown,
  LogOut, Package, Settings, Menu, X, Compass, MapPin
} from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/store/cartStore'
import { useWishlistStore } from '@/lib/store/wishlistStore'
import { Category, Profile } from '@/types'
import type { User as SupaUser } from '@supabase/supabase-js'
import { getMainCategories, getSubcategories } from '@/lib/data/categories'
import { getProfileById } from '@/lib/data/profiles'

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<SupaUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toggleCart, getTotalItems } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const totalCartItems = getTotalItems()

  useEffect(() => {
    const supabase = createClient()
    const fetchData = async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        const mainCategories = await getMainCategories(supabase)
        const nestedSubcategories = await Promise.all(
          mainCategories.map((category) => getSubcategories(supabase, category.id))
        )
        setCategories([...mainCategories, ...nestedSubcategories.flat()])

        if (u) {
          setUser(u)
          const prof = await getProfileById(supabase, u.id)
          if (prof) setProfile(prof)
        }
      } catch (e) {
        console.error('Navbar mount fetch failed', e)
      }
    }
    fetchData()
  }, [])

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
    setUser(null)
    setProfile(null)
    setShowUserMenu(false)
    router.push('/')
    router.refresh()
  }

  const mainCategories = categories.filter((cat) => !cat.parent_id)
  
  const collectionsNav = [
    { label: 'Best Sellers', href: '/products?sort=popular' },
    { label: 'New Arrivals', href: '/products?filter=new' },
    { label: 'Healthy Picks', href: '/products' },
    { label: 'Premium Nuts', href: '/category/nuts' }
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-200">
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile menu toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#B91C1C]"
            aria-label="Toggle mobile menu"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Crazilo Brand Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/logo/crazilo-logo.png"
              alt="Crazilo Dryfruits and Spices"
              width={160}
              height={56}
              className="h-10 lg:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Left-Center Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Shop Dropdown */}
            <div className="relative group">
              <Link
                href="/products"
                className="flex items-center gap-1 py-2 text-sm font-semibold text-gray-800 hover:text-[#B91C1C] transition-colors"
              >
                <span>Shop</span>
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform" />
              </Link>
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 py-3 z-50">
                {mainCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="block px-5 py-2.5 text-xs font-semibold text-gray-700 hover:text-[#B91C1C] hover:bg-[#FFF8F0]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Collections Dropdown */}
            <div className="relative group">
              <Link
                href="/products"
                className="flex items-center gap-1 py-2 text-sm font-semibold text-gray-800 hover:text-[#B91C1C] transition-colors"
              >
                <span>Collections</span>
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform" />
              </Link>
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 py-3 z-50">
                {collectionsNav.map((col) => (
                  <Link
                    key={col.label}
                    href={col.href}
                    className="block px-5 py-2.5 text-xs font-semibold text-gray-700 hover:text-[#B91C1C] hover:bg-[#FFF8F0]"
                  >
                    {col.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/our-story"
              className="text-sm font-semibold text-gray-800 hover:text-[#B91C1C] transition-colors"
            >
              Our Story
            </Link>

            <Link
              href="/blog"
              className="text-sm font-semibold text-gray-800 hover:text-[#B91C1C] transition-colors"
            >
              Blog
            </Link>
          </div>

          {/* Right Action Items: Search field + Account + Cart */}
          <div className="flex items-center gap-4 flex-1 justify-end max-w-lg">
            
            {/* Inline search bar (Visible on desktop) */}
            <form onSubmit={handleSearch} className="relative hidden md:block w-full max-w-[280px]">
              <input
                type="text"
                placeholder="Search for snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFF8F0] border border-gray-100 text-xs font-semibold text-gray-850 placeholder:text-gray-400 rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-[#B91C1C] transition-colors"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#B91C1C]">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile search trigger */}
            <button
              onClick={() => setShowSearch(true)}
              className="md:hidden p-2 text-gray-700 hover:text-[#B91C1C]"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Icon / Dropdown */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-1.5 text-gray-755 hover:text-[#B91C1C] rounded-full transition-colors flex items-center justify-center border border-gray-100 shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#B91C1C] text-white flex items-center justify-center text-[11px] font-bold">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <Link
                        href="/account"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#FFF8F0] hover:text-[#B91C1C]"
                      >
                        <User className="w-4 h-4" />
                        <span>My Account</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#FFF8F0] hover:text-[#B91C1C] text-left border-t border-gray-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="p-2 text-gray-750 hover:text-[#B91C1C] hover:bg-[#FFF8F0] rounded-full transition-colors inline-flex items-center border border-gray-100"
                  aria-label="Sign In"
                >
                  <User className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-750 hover:text-[#B91C1C] hover:bg-[#FFF8F0] rounded-full transition-colors inline-flex items-center border border-gray-100"
              aria-label="Cart"
              id="cart-toggle-btn"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#B91C1C] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-white shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slide-over Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 z-40 bg-black"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-[280px] bg-white shadow-2xl flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <Image
                  src="/logo/crazilo-logo.png"
                  alt="Crazilo"
                  width={120}
                  height={42}
                  className="h-8 w-auto object-contain"
                />
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-500 hover:text-[#B91C1C]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6 font-heading">
                <Link
                  href="/products"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-base font-bold text-gray-800 hover:text-[#B91C1C] border-b border-gray-50 pb-2"
                >
                  Shop All Snacks
                </Link>

                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Categories</p>
                  {mainCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setShowMobileMenu(false)}
                      className="text-sm font-semibold text-gray-700 hover:text-[#B91C1C] pl-2"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Collections</p>
                  {collectionsNav.map((col) => (
                    <Link
                      key={col.label}
                      href={col.href}
                      onClick={() => setShowMobileMenu(false)}
                      className="text-sm font-semibold text-gray-700 hover:text-[#B91C1C] pl-2"
                    >
                      {col.label}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/our-story"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-base font-bold text-gray-800 hover:text-[#B91C1C] border-b border-gray-50 pb-2 pt-2"
                >
                  Our Story
                </Link>

                <Link
                  href="/blog"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-base font-bold text-gray-800 hover:text-[#B91C1C] border-b border-gray-50 pb-2"
                >
                  Blog
                </Link>
              </div>

              {/* Mobile Quick links footer */}
              <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col gap-4 text-xs font-semibold text-gray-500">
                <Link href="/orders" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 hover:text-[#B91C1C]">
                  <Compass className="w-4 h-4" />
                  <span>Track Order</span>
                </Link>
                <Link href="/store-locator" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 hover:text-[#B91C1C]">
                  <MapPin className="w-4 h-4" />
                  <span>Store Locator</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modern Spotlight Search Modal for Mobile Trigger ── */}
      <AnimatePresence>
        {showSearch && (
          <>
            {/* Blurred backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSearch(false)}
            />

            {/* Mobile panel */}
            <motion.div
              key="mobile-panel"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-4 left-3 right-3 z-[70] bg-white rounded-2xl shadow-2xl border border-[#EFE7DD] overflow-hidden"
            >
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F0EAE0]">
                  <Search className="w-4 h-4 text-[#B91C1C] flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setShowSearch(false)}
                    placeholder="Search snacks, dry fruits..."
                    className="flex-1 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
                    autoFocus
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')}
                      className="text-gray-400 text-base leading-none flex-shrink-0">×</button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#B91C1C] text-white text-[11px] font-extrabold rounded-lg hover:bg-[#7F1D1D] transition-colors tracking-wider flex-shrink-0"
                  >
                    GO
                  </button>
                </div>
              </form>

              <div className="px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">🔥 Trending</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Cashews', 'Almonds', 'Makhana', 'Pistachio', 'Gift Box', 'Walnuts'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(tag)}`)
                        setShowSearch(false)
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#FFF8F0] border border-[#EFE7DD] text-[11px] font-semibold text-gray-700 active:bg-[#B91C1C] active:text-white transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

