'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Apple, Flame, Sprout, Sparkles, Gift, ShoppingBag, Layers, Leaf } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'

const CATEGORY_ICONS: Record<string, any> = {
  'dry-fruits': Apple,
  'nuts': Sprout,
  'spices': Flame,
  'seeds': Leaf,
  'makhana': Sparkles,
  'trail-mixes': Layers,
  'gift-boxes': Gift,
  'combos': Sparkles,
  'all': ShoppingBag,
}

export default function CategoryScroll() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      if (data) setCategories(data)
      setLoading(false)
    }
    fetch()
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 240 : -240, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <section className="py-10 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 h-28 rounded-2xl skeleton" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-gray-900">Shop by Category</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-brand-red to-brand-gold rounded-full mt-2" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
        >
          {categories.map((cat, index) => {
            const IconComponent = CATEGORY_ICONS[cat.slug] || Leaf
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0"
              >
                <Link
                  href={cat.slug === 'all' ? '/products' : `/category/${cat.slug}`}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-brand-red transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-cream to-amber-50 flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-brand-red" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-red transition-colors text-center whitespace-nowrap">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
