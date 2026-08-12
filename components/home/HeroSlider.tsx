'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Leaf, ShieldCheck, Package, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right

  const heroHighlights = highlights
    .filter((highlight) => highlight.icon_key.startsWith('hero_'))
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 4)

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setDirection(1)
      setActiveIndex((prev) => (prev + 1) % banners.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [banners.length])

  if (banners.length === 0) return null

  const handlePrev = () => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleNext = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % banners.length)
  }

  const activeBanner = banners[activeIndex]

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  }

  return (
    <section className="relative overflow-hidden border-b border-[#EFE7DD] select-none">
      <div className="relative min-h-[520px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 220, damping: 26 },
              opacity: { duration: 0.35 },
            }}
            className="absolute inset-0 pt-6 pb-12 w-full h-full flex items-center"
            style={{ backgroundColor: activeBanner.bg_color || '#FFF5EA' }}
          >
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[460px]">
                <div
                  className="lg:col-span-6 space-y-6 z-10 py-6"
                  style={{ color: activeBanner.text_color || '#1A1A1A' }}
                >
                  {activeBanner.badge_text && (
                    <span className="inline-block text-xs font-black tracking-widest uppercase text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full">
                      {activeBanner.badge_text}
                    </span>
                  )}

                  <h1 
                    className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight"
                    style={{ color: activeBanner.text_color || '#1A1A1A' }}
                  >
                    {activeBanner.title}
                  </h1>

                  <p 
                    className="text-sm sm:text-base max-w-md leading-relaxed font-medium"
                    style={{ color: activeBanner.text_color ? `${activeBanner.text_color}cc` : '#4A4A4A' }} // opacity 80% for subtitle
                  >
                    {activeBanner.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href={activeBanner.cta_link}
                      className="inline-flex items-center gap-2 bg-[#A61919] hover:bg-[#8B0000] text-white font-extrabold text-xs tracking-wider uppercase px-7 py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                    >
                      <span>{activeBanner.cta_text}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/category/spices"
                      className="inline-flex items-center gap-2 bg-transparent font-extrabold text-xs tracking-wider uppercase px-7 py-3.5 rounded-full transition-all duration-300 border-2 hover:bg-white/10"
                      style={{ 
                        color: activeBanner.text_color || '#7F1D1D',
                        borderColor: activeBanner.text_color || '#7F1D1D'
                      }}
                    >
                      <span>EXPLORE SPICES</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 relative flex items-center justify-center min-h-[360px] sm:min-h-[420px]">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-full bg-brand-red/10 shadow-inner z-0 overflow-hidden" />

                  <div className="absolute top-2 right-4 sm:top-6 sm:right-8 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFF3E0] border-4 border-dashed border-[#A65E2E] flex flex-col items-center justify-center text-center p-2 shadow-lg">
                    <span className="font-heading font-black text-lg sm:text-xl text-[#8B0000] leading-none">
                      100%
                    </span>
                    <span className="text-[8px] font-extrabold text-[#7F1D1D] uppercase tracking-wider leading-tight mt-0.5">
                      QUALITY
                      <br />
                      ASSURED
                    </span>
                  </div>

                  <div className="relative z-20 w-full h-[320px] sm:h-[400px]">
                    <Image
                      src={activeBanner.image_url}
                      alt={activeBanner.title}
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg border border-gray-150 transition-all focus:outline-none"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg border border-gray-150 transition-all focus:outline-none"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > activeIndex ? 1 : -1)
                    setActiveIndex(index)
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeIndex === index
                      ? 'bg-brand-red w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-white py-8 border-t border-[#EFE7DD]/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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
