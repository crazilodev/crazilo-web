'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Leaf, ShieldCheck, Package, Sparkles } from 'lucide-react'
import type { Banner, HomeHighlight } from '@/types'

interface HeroSliderProps {
  banners: Banner[]
  highlights: HomeHighlight[]
}

function getHeroIcon(iconKey: string) {
  if (iconKey.includes('100_natural')) return Leaf
  if (iconKey.includes('premium_quality')) return ShieldCheck
  if (iconKey.includes('freshly_packed')) return Package
  return Sparkles
}

export default function HeroSlider({ banners, highlights }: HeroSliderProps) {
  const banner = banners[0]
  const heroHighlights = highlights
    .filter((highlight) => highlight.icon_key.startsWith('hero_'))
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 4)

  if (!banner) return null

  return (
    <section
      className="relative bg-[#FFF5EA] overflow-hidden pt-6 pb-12 border-b border-[#EFE7DD]"
      style={{ backgroundColor: banner.bg_color }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[520px]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6 z-10 py-6"
            style={{ color: banner.text_color }}
          >
            <span className="inline-block text-xs font-black tracking-widest uppercase text-[#A65E2E]">
              {banner.badge_text}
            </span>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1A1A] leading-[1.05] tracking-tight">
              {banner.title}
            </h1>

            <p className="text-gray-700 text-sm sm:text-base max-w-md leading-relaxed font-medium">
              {banner.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={banner.cta_link}
                className="inline-flex items-center gap-2 bg-[#A61919] hover:bg-[#8B0000] text-white font-extrabold text-xs tracking-wider uppercase px-7 py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
              >
                <span>{banner.cta_text}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/category/spices"
                className="inline-flex items-center gap-2 bg-transparent hover:bg-[#FAF0E6] text-[#7F1D1D] border-2 border-[#7F1D1D] font-extrabold text-xs tracking-wider uppercase px-7 py-3.5 rounded-full transition-all duration-300"
              >
                <span>EXPLORE SPICES</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] rounded-full bg-[#8B0000] shadow-2xl z-0 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.15)_0%,_transparent_70%)]" />
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="absolute top-2 right-4 sm:top-6 sm:right-8 z-30 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FFF3E0] border-4 border-dashed border-[#A65E2E] flex flex-col items-center justify-center text-center p-2 shadow-xl"
            >
              <span className="font-heading font-black text-xl sm:text-2xl text-[#8B0000] leading-none">
                100%
              </span>
              <span className="text-[9px] font-extrabold text-[#7F1D1D] uppercase tracking-wider leading-tight mt-0.5">
                QUALITY
                <br />
                ASSURED
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative z-20 w-full h-[360px] sm:h-[460px] flex items-center justify-center"
            >
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>
          </div>
        </div>

        <div className="pt-10 border-t border-[#EFE7DD]/80 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {heroHighlights.map((highlight) => {
              const Icon = getHeroIcon(highlight.icon_key)
              return (
                <div key={highlight.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF0E5] border border-[#EFE7DD] flex items-center justify-center text-[#A61919]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1A1A1A] uppercase tracking-wider">
                      {highlight.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium">{highlight.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
