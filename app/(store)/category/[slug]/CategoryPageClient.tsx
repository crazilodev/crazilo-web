'use client'

import { useEffect, useState } from 'react'
import { Category, Product } from '@/types'
import { createClient } from '@/lib/supabase/client'
import ProductGrid from '@/components/products/ProductGrid'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Props { category: Category }

export default function CategoryPageClient({ category }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      let categoryIds = [category.id]

      if (!category.parent_id) {
        const { data: children } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', category.id)

        categoryIds = [category.id, ...(children?.map((child) => child.id) || [])]
      }

      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .in('category_id', categoryIds)
        .order('created_at', { ascending: false })
      setProducts(data || [])
      setLoading(false)
    }
    fetch()
  }, [category.id, category.parent_id])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/" className="hover:text-brand-red">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-brand-red">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold text-gray-900">{category.name}</h1>
          {category.description && <p className="text-gray-500 mt-1">{category.description}</p>}
          <p className="text-sm text-gray-400 mt-1">{products.length} products</p>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid products={products} loading={loading} skeletonCount={8} cols={4} />
      </div>
    </div>
  )
}
