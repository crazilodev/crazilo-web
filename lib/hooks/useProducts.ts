'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, FilterState } from '@/types'

export function useProducts(filters?: Partial<FilterState>) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      let query = supabase
        .from('products')
        .select('*, category:categories(*)', { count: 'exact' })
        .eq('is_active', true)

      if (filters?.category && filters.category !== 'all') {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .single()
        if (cat) query = query.eq('category_id', cat.id)
      }

      if (filters?.minPrice != null) {
        query = query.gte('price', filters.minPrice)
      }
      if (filters?.maxPrice != null) {
        query = query.lte('price', filters.maxPrice)
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      const sort = filters?.sort || 'newest'
      if (sort === 'price_asc') query = query.order('price', { ascending: true })
      else if (sort === 'price_desc') query = query.order('price', { ascending: false })
      else if (sort === 'popular') query = query.order('total_sold', { ascending: false })
      else if (sort === 'rating') query = query.order('average_rating', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data, error: err, count } = await query
      if (err) throw err
      setProducts(data || [])
      setTotal(count || 0)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return { products, loading, error, total, refetch: fetchProducts }
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8)
      setProducts(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { products, loading }
}

export function useBestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .eq('is_bestseller', true)
        .order('total_sold', { ascending: false })
        .limit(8)
      setProducts(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { products, loading }
}
