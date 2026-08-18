'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShoppingCart, User, Heart, ChevronDown,
  LogOut, Package, Settings, Menu, X, Compass, MapPin,
  ChevronRight, ArrowRight, Shield
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

  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
        setSearchTerm('')
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showSearch || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch, showUserMenu])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

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

  // Prevent background scrolling when mobile menu or search drawer is active
  useEffect(() => {
    if (showMobileMenu || showSearch) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showMobileMenu, showSearch])

  // Support closing modals and drawers with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false)
        setShowSearch(false)
        setShowUserMenu(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-close mobile menu on route transitions
  useEffect(() => {
    setShowMobileMenu(false)
    setShowSearch(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  useEffect(() => {
    if (showSearch) {
      const fetchSuggestions = async () => {
        try {
          const supabase = createClient()
          const { data } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('is_active', true)
            .limit(4)
          setSuggestedProducts(data || [])
        } catch (e) {
          console.error(e)
        }
      }
      fetchSuggestions()
    }
  }, [showSearch])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .ilike('name', `%${searchTerm.trim()}%`)
          .limit(4)
        setSearchResults(data || [])
      } catch (err) {
        console.error('Real-time search error', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const handleSpotlightSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setShowSearch(false)
      setSearchTerm('')
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
    <>
      <header className={`sticky top-0 border-b border-gray-100/80 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-200 ${
        showMobileMenu || showSearch ? 'z-[99]' : 'z-50'
      }`}>
        <nav className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Crazilo Brand Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/logo/crazilo-logo.png"
              alt="Crazilo Dryfruits and Spices"
              width={140}
              height={48}
              className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Right Section: Navigation Links & Action Items */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            {/* Desktop Aligned-Right Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {/* Shop Dropdown */}
              <div className="relative group">
                <Link
                  href="/products"
                  className="flex items-center gap-1 py-2 text-sm font-semibold text-gray-800 hover:text-[#B91C1C] transition-colors"
                >
                  <span>Shop</span>
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-0 pt-1.5 w-56 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-3">
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
                <div className="absolute top-full left-0 pt-1.5 w-56 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-3">
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

            {/* Action Items */}
            <div className="flex items-center gap-1.5 sm:gap-4">
              {/* Search Icon Trigger */}
              <button
                onClick={() => setShowSearch(true)}
                className="p-1.5 text-gray-700 hover:text-[#B91C1C] transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account Icon / Dropdown */}
              <div 
                ref={userMenuRef}
                className="relative"
              >
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-1 rounded-full text-gray-755 hover:text-[#B91C1C] border border-gray-100 shadow-sm transition-colors flex items-center justify-center focus:outline-none"
                      aria-expanded={showUserMenu}
                      aria-haspopup="true"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#B91C1C] text-white flex items-center justify-center text-[11px] font-bold">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 top-full pt-2 w-48 z-50">
                        <div className="bg-[#FFFFFF] rounded-2xl shadow-xl border border-gray-100 py-2">
                          {profile?.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#B91C1C] hover:bg-[#FFF8F0]"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
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
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="p-1.5 rounded-full text-gray-750 hover:text-[#B91C1C] hover:bg-[#FFF8F0] border border-gray-100 transition-colors inline-flex items-center"
                    aria-label="Sign In"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className="relative p-1.5 rounded-full text-gray-755 hover:text-[#B91C1C] hover:bg-[#FFF8F0] border border-gray-100 transition-colors inline-flex items-center"
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

              {/* Mobile menu toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-1.5 text-gray-700 hover:text-[#B91C1C] transition-colors"
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>

      {/* ── Spotlight Search Modal Overlay (Centered, with blurred backdrop) ── */}
      <AnimatePresence>
        {showSearch && (
          <>
            {/* Backdrop */}
            <motion.div
              key="search-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
              onClick={() => {
                setShowSearch(false)
                setSearchTerm('')
              }}
            />

            {/* Centered Modal Container */}
            <motion.div
              ref={searchRef}
              key="search-modal"
              initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 sm:top-24 left-1/2 z-[101] w-full max-w-[calc(100%-2rem)] sm:max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-150 overflow-hidden"
            >
              <form onSubmit={handleSpotlightSearch}>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products, categories, or tags..."
                    className="flex-1 text-sm sm:text-base font-medium text-gray-800 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-gray-450 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearch(false)
                      setSearchTerm('')
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </form>

              {/* Suggestions / Real-Time Results panel */}
              <div className="max-h-[380px] overflow-y-auto p-5">
                {searchTerm.trim() === '' ? (
                  <div className="space-y-6">
                    {/* POPULAR SUGGESTIONS */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Popular Suggestions</p>
                      <div className="flex flex-wrap gap-2">
                        {['All Products', 'Trending', 'Best Sellers', 'New Arrivals', 'Offers'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (tag === 'All Products') {
                                router.push('/products')
                              } else if (tag === 'Trending') {
                                router.push('/products?sort=popular')
                              } else if (tag === 'Best Sellers') {
                                router.push('/products?filter=bestseller')
                              } else if (tag === 'New Arrivals') {
                                router.push('/products?filter=new')
                              } else {
                                router.push('/products')
                              }
                              setShowSearch(false)
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-[#FFF8F0] hover:bg-[#FFF2E3] border border-gray-150 text-xs font-bold text-gray-700 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SUGGESTED PRODUCTS */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Suggested Products</p>
                        <button
                          type="button"
                          onClick={() => {
                            router.push('/products')
                            setShowSearch(false)
                          }}
                          className="text-xs font-bold text-[#B91C1C] hover:text-[#7F1D1D] flex items-center gap-1 transition-colors"
                        >
                          <span>View All</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {suggestedProducts.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/products/${prod.slug}`}
                            onClick={() => setShowSearch(false)}
                            className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:border-[#B91C1C] hover:bg-red-50/5 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-white flex items-center justify-center">
                                <Image
                                  src={prod.thumbnail_url || prod.images?.[0] || ''}
                                  alt={prod.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="text-left">
                                <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#B91C1C] transition-colors line-clamp-1">{prod.name}</h4>
                                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">{prod.category?.name || 'Nuts'}</p>
                                <p className="text-xs font-black text-gray-800 mt-0.5">₹{prod.price}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#B91C1C] group-hover:translate-x-0.5 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SEARCH RESULTS */
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Search Results ({searchResults.length})
                    </p>

                    {searchLoading ? (
                      <div className="py-8 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#B91C1C] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/products/${prod.slug}`}
                            onClick={() => {
                              setShowSearch(false)
                              setSearchTerm('')
                            }}
                            className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:border-[#B91C1C] hover:bg-red-50/5 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-white flex items-center justify-center">
                                <Image
                                  src={prod.thumbnail_url || prod.images?.[0] || ''}
                                  alt={prod.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="text-left">
                                <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#B91C1C] transition-colors line-clamp-1">{prod.name}</h4>
                                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">{prod.category?.name || 'Nuts'}</p>
                                <p className="text-xs font-black text-gray-800 mt-0.5">₹{prod.price}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#B91C1C] group-hover:translate-x-0.5 transition-all" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-xs font-bold text-gray-500">No products found matching &ldquo;{searchTerm}&rdquo;</p>
                      </div>
                    )}

                    {!searchLoading && searchResults.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
                          setShowSearch(false)
                          setSearchTerm('')
                        }}
                        className="w-full text-center py-2.5 text-xs font-black text-[#B91C1C] hover:text-[#7F1D1D] flex items-center justify-center gap-1 border-t border-gray-100 mt-4 transition-colors"
                      >
                        <span>View all results for &ldquo;{searchTerm}&rdquo;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              className="fixed inset-0 z-[100] bg-black"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[101] w-full max-w-[280px] bg-white shadow-2xl flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-end mb-8">
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-500 hover:text-[#B91C1C]"
                  aria-label="Close mobile menu"
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
                {user ? (
                  <>
                    <Link href="/account" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 hover:text-[#B91C1C]">
                      <User className="w-4 h-4" />
                      <span>My Account</span>
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 text-[#B91C1C] font-bold">
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowMobileMenu(false)
                        handleSignOut()
                      }}
                      className="flex items-center gap-2 hover:text-[#B91C1C] text-left w-full font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2 hover:text-[#B91C1C]">
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}

                <div className="border-t border-gray-100 my-1"></div>

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
    </>
  )
}

