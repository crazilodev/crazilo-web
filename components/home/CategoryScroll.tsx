'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryScrollProps {
  categories: Category[]
}

export default function CategoryScroll({ categories }: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (categories.length === 0) return null

  return (
    <section className="py-10 bg-[#FFFDF9] border-b border-[#EFE7DD]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-black text-[#A65E2E] uppercase tracking-widest block mb-1">
              EXPLORE OUR RANGE
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              Shop by Category
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full bg-white border border-[#EFE7DD] hover:border-[#A61919] hover:bg-[#FAF4ED] text-gray-700 flex items-center justify-center transition-all shadow-sm"
              aria-label="Previous Category"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full bg-white border border-[#EFE7DD] hover:border-[#A61919] hover:bg-[#FAF4ED] text-gray-700 flex items-center justify-center transition-all shadow-sm"
              aria-label="Next Category"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-2 scroll-smooth"
        >
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/category/${item.slug}`}
              className="flex-shrink-0 flex items-center gap-3 bg-[#FAF4ED] hover:bg-[#FFF0E2] border border-[#EFE5D8] hover:border-[#A61919] px-5 py-3.5 rounded-2xl transition-all duration-300 group shadow-sm min-w-[200px]"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/80 p-1 flex-shrink-0 group-hover:scale-110 transition-transform">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-contain" />
                ) : (
                  <div className="w-full h-full bg-white/80" />
                )}
              </div>

              <span className="font-heading text-xs font-black text-[#1A1A1A] group-hover:text-[#A61919] tracking-wider uppercase">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
