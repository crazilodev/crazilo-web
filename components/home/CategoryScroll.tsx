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
    <section className="py-8 bg-white border-b border-gray-50 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Horizontal Category Rail */}
        <div className="flex items-center justify-start lg:justify-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-2 scroll-smooth">
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/category/${item.slug}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group w-24 sm:w-28 text-center"
            >
              {/* Category Image Wrapper */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                {item.image_url ? (
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-full" />
                )}
              </div>

              {/* Title */}
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 group-hover:text-[#B91C1C] transition-colors leading-tight tracking-tight">
                {item.name}
              </span>
            </Link>
          ))}

        </div>

      </div>
    </section>
  )
}

