'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '@/types'

interface CategoryScrollProps {
  categories: Category[]
}

export default function CategoryScroll({ categories }: CategoryScrollProps) {
  const categoryConfigs = [
    { name: 'Nuts & Seeds', slug: 'nuts', fallbackImage: '/images/cat-nuts.png' },
    { name: 'Dry Fruits', slug: 'dry-fruits', fallbackImage: '/images/cat-dryfruits.png' },
    { name: 'Makhana', slug: 'makhana', fallbackImage: '/images/cat-makhana.png' },
    { name: 'Trail Mix', slug: 'trail-mixes', fallbackImage: '/images/cat-combos.png' },
    { name: 'Combos', slug: 'combos', fallbackImage: '/images/cat-combos.png' },
    { name: 'Gift Packs', slug: 'gift-boxes', fallbackImage: '/images/cat-gifts.png' },
  ]

  const items = categoryConfigs.map((config) => {
    const dbCat = categories.find((c) => c.slug === config.slug)
    return {
      id: dbCat?.id || config.slug,
      name: config.name,
      slug: dbCat?.slug || config.slug,
      image_url: dbCat?.image_url || config.fallbackImage,
    }
  })

  return (
    <section className="py-8 bg-white border-b border-gray-50 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Horizontal Category Rail */}
        <div className="flex items-center justify-start lg:justify-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-2 scroll-smooth">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/category/${item.slug}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group w-24 sm:w-28 text-center"
            >
              {/* Category Image Wrapper */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#FFF8F0] border border-[#EFE7DD] flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                {item.image_url ? (
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-full" />
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

