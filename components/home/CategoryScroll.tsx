'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '@/types'

interface CategoryScrollProps {
  categories: Category[]
}

export default function CategoryScroll({ categories }: CategoryScrollProps) {
  if (categories.length === 0) return null

  return (
    <section className="py-6 sm:py-8 bg-white border-b border-gray-100 select-none overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Titled Section Header */}
        <div className="mb-4 sm:mb-6 text-left">
          <h2 className="text-sm sm:text-lg font-heading font-black uppercase text-gray-900 tracking-wider">
            Shop by Categories
          </h2>
        </div>

        {/* Horizontal Category Rail:
            - Mobile: justify-start (scrollable, elements clip on right to guide swipe)
            - Desktop: justify-center (centers the list if it fits the screen width)
        */}
        <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-6 overflow-x-auto scrollbar-none pb-3 scroll-smooth w-full">
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/category/${item.slug}`}
              className="flex-shrink-0 relative w-36 h-24 sm:w-56 sm:h-36 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group bg-gray-50 border border-gray-100/50"
            >
              {/* Category Background Image */}
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#B91C1C] to-[#7F1D1D] opacity-90" />
              )}

              {/* Dark Gradient Overlay for High Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black/90 transition-all duration-300" />

              {/* Text Label Overlay */}
              <div className="absolute inset-x-0 bottom-3 text-center px-2 z-10 flex items-center justify-center h-6">
                <span className="text-[10px] sm:text-xs font-black uppercase text-white tracking-widest leading-none drop-shadow-md group-hover:text-[#D97706] transition-colors whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
