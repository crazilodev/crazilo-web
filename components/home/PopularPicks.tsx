'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Leaf } from 'lucide-react'
import { useBestSellers } from '@/lib/hooks/useProducts'
import ProductCard from '@/components/products/ProductCard'
import { Skeleton } from '@/components/ui/Skeleton'

export default function PopularPicks() {
  const { products, loading } = useBestSellers()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = 280 // Estimated card width + gap
      const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!loading && products.length === 0) return null

  return (
    <section className="py-12 bg-[#FFFDF9] select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#B91C1C]" />
            <h2 className="font-heading text-xl sm:text-2xl font-black text-[#2B1B17] tracking-tight uppercase">
              Popular Picks
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="text-xs font-bold text-[#B91C1C] hover:text-[#7F1D1D] transition-colors flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Slider controls */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full bg-white border border-[#EFE7DD] hover:border-[#B91C1C] hover:bg-[#FFF8F0] text-gray-700 flex items-center justify-center transition-all shadow-sm"
                aria-label="Previous Products"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full bg-white border border-[#EFE7DD] hover:border-[#B91C1C] hover:bg-[#FFF8F0] text-gray-700 flex items-center justify-center transition-all shadow-sm"
                aria-label="Next Products"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-6 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory"
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[260px] sm:w-[280px] bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
                <Skeleton className="w-full h-48 rounded-xl" />
                <Skeleton className="w-2/3 h-4 rounded" />
                <Skeleton className="w-1/2 h-4 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="w-3/4 h-10 rounded-xl" />
                  <Skeleton className="w-1/4 h-10 rounded-xl" />
                </div>
              </div>
            ))
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px] snap-start"
              >
                <ProductCard product={product} index={index} />
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  )
}
