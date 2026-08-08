'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import ProductGrid from '@/components/products/ProductGrid'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) { setLoading(false); return }
    const fetch = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .order('created_at', { ascending: false })
      setProducts(data || [])
      setLoading(false)
    }
    fetch()
  }, [query])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-1">
            <Search className="w-5 h-5 text-gray-400" />
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              Search: &ldquo;{query}&rdquo;
            </h1>
          </div>
          <p className="text-gray-500 text-sm">{products.length} results found</p>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!query ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">Enter a search term above to find products</p>
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} skeletonCount={8} cols={4} />
        )}
      </div>
    </div>
  )
}
