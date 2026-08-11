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
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-brand-red hover:text-brand-red transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                !selectedCategory
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red'
              }`}
            >
              All
            </button>
            {categories.filter(c => c.slug !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="ml-auto relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none pl-4 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:border-brand-red cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} loading={loading} skeletonCount={12} cols={4} />
      </div>
    </div>
  )
}
