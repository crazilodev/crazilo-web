'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { HomeFeatureCard } from '@/types'

interface CollectionGridProps {
  collections: HomeFeatureCard[]
}

export default function CollectionGrid({ collections }: CollectionGridProps) {
  // Show up to 4 active collection cards
  const displayCards = collections.slice(0, 4)

  if (displayCards.length === 0) return null

  return (
    <section className="py-12 bg-white select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2x2 Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {displayCards.map((col) => (
            <Link
              key={col.id}
              href={col.link_url || '/products'}
              className="group rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[220px] sm:min-h-[260px] md:min-h-[280px] relative block"
            >
              {/* Full Bleed Background Image */}
              <Image
                src={col.image_url}
                alt={col.title || 'Collection Banner'}
                fill
                className="object-cover group-hover:scale-102 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Gradient Bottom Overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none" />

              {/* Action Button Layout (Bottom-Left Overlay) */}
              <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-20">
                <span className="inline-flex items-center gap-1.5 text-white text-xs sm:text-sm font-extrabold border-b-2 border-white/70 group-hover:border-white pb-0.5 transition-all">
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
