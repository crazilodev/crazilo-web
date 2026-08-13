'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category, Product, SortOption } from '@/types'
import ProductGrid from '@/components/products/ProductGrid'
import { formatPrice } from '@/lib/utils/formatPrice'
import { getActiveProducts } from '@/lib/data/catalog'
import { getMainCategories, getSubcategories } from '@/lib/data/categories'
import { motion, AnimatePresence } from 'framer-motion'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
] as const

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const mainCategories = await getMainCategories(supabase)
      const nestedSubcategories = await Promise.all(
        mainCategories.map((category) => getSubcategories(supabase, category.id))
      )
      setCategories([...mainCategories, ...nestedSubcategories.flat()])
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const supabase = createClient()
      const sortParam = searchParams.get('sort') as SortOption
      const activeSort = sortParam || sort

      const filterNew = searchParams.get('filter') === 'new'
      const tag = searchParams.get('tag')

      const selected = selectedCategory ? categories.find((category) => category.id === selectedCategory) : null
      const categoryIds = selected
        ? selected.parent_id
          ? [selected.id]
          : [selected.id, ...categories.filter((child) => child.parent_id === selected.id).map((child) => child.id)]
        : undefined

      const data = await getActiveProducts(supabase, {
        categoryIds,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sort: activeSort,
        tags: tag ? [tag] : undefined,
      })

      const productsData = filterNew ? data.filter((product) => product.is_new) : data
      setProducts(productsData)
      setTotal(productsData.length)
      setLoading(false)
    }
    fetchProducts()
  }, [sort, selectedCategory, priceRange, searchParams, categories])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-1">All Products</h1>
          <p className="text-gray-500 text-sm">{total} products found</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter & Sort Bar */}
        <div className="flex items-center gap-3 mb-8 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilters
                ? 'bg-brand-red text-white border-brand-red'
                : 'border-gray-200 bg-white text-gray-700 hover:border-brand-red hover:text-brand-red'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Category Pills (horizontal scrollable to prevent wrapping on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar flex-nowrap flex-1 px-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                !selectedCategory
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'
              }`}
            >
              All
            </button>
            {categories.filter(c => c.slug !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative flex-shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium text-gray-750 focus:outline-none focus:border-brand-red cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Content area: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Column */}
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Mobile Drawer Overlay Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden fixed inset-0 z-40 bg-black"
                />

                {/* Mobile Drawer / Desktop Sidebar */}
                <motion.div
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed lg:relative inset-y-0 left-0 z-50 lg:z-0 w-full max-w-[280px] lg:max-w-none bg-white lg:bg-transparent shadow-2xl lg:shadow-none p-6 lg:p-0 overflow-y-auto lg:overflow-y-visible lg:col-span-1 space-y-6 flex flex-col"
                >
                  <div className="flex items-center justify-between lg:hidden border-b border-gray-100 pb-4 mb-4">
                    <h3 className="font-heading font-bold text-lg text-gray-900">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2 text-gray-500 hover:text-brand-red">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filter Content: Categories */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-450 uppercase tracking-widest">Categories</h4>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`text-left text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                          !selectedCategory ? 'bg-red-50 text-brand-red' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.filter(c => c.slug !== 'all').map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                          className={`text-left text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                            selectedCategory === cat.id ? 'bg-red-50 text-brand-red' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Content: Price range */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-450 uppercase tracking-widest">Price Range</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">₹{priceRange[0]}</span>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="50"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="flex-1 accent-brand-red h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-gray-900 font-bold">₹{priceRange[1]}</span>
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => setPriceRange([0, 5000])}
                          className="text-[10px] font-bold text-gray-400 hover:text-brand-red uppercase tracking-wider"
                        >
                          Reset Price
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className={showFilters ? 'lg:col-span-3 w-full' : 'lg:col-span-4 w-full'}>
            <ProductGrid products={products} loading={loading} skeletonCount={12} cols={showFilters ? 3 : 4} />
          </div>
        </div>
      </div>
    </div>
  )
}
