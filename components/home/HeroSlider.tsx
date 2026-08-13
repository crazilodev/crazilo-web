'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Shield, Award } from 'lucide-react'
import type { Banner, HomeHighlight } from '@/types'

interface HeroSliderProps {
  banners: Banner[]
  highlights: HomeHighlight[]
}

export default function HeroSlider({ banners, highlights }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsMobile(window.innerWidth < 640)
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    <section
      className="relative w-full overflow-hidden select-none border-b border-gray-100 transition-colors duration-500"
      style={{ backgroundColor: activeBanner.bg_color || '#FFF8F5' }}
    >
      {/* 
        Hero Container with controlled responsive aspect ratio strategy:
        - Mobile: aspect-[4/5.2] (gives enough vertical space for text + small image, preventing overflow)
        - Small devices: sm:aspect-[16/10]
        - Tablet viewports: md:aspect-[16/9]
        - Desktop viewports: lg:aspect-[16/6]
        This enforces a strictly predictable container height across all screens.
      */}
      <div className="relative w-full aspect-[4/5.2] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[16/6] max-w-[1440px] mx-auto overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 220, damping: 28 },
              opacity: { duration: 0.3 },
            }}
            className="w-full h-full absolute inset-0 flex items-center"
          >
            {/* Background / Image Layer */}
            <div className="absolute inset-0 w-full h-full z-0">
              {activeBanner.is_full_width ? (
                <Image
                  src={mounted && isMobile && activeBanner.mobile_image_url ? activeBanner.mobile_image_url : activeBanner.image_url}
                  alt={activeBanner.title}
                  fill
                  className="object-cover object-center"
                  priority
                />
              ) : (
                <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: activeBanner.bg_color || '#FFF8F5' }} />
              )}
            </div>

            {/* Content Layer (Overlayed above background) */}
            <div className="relative z-10 w-full h-full flex items-center px-4 sm:px-6 lg:px-8">
              {!activeBanner.is_full_width ? (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center h-full py-4 sm:py-8">
                  {/* Left Content Column */}
                  <div className="lg:col-span-6 flex flex-col justify-center space-y-2 sm:space-y-4 text-left">
                    {activeBanner.badge_text && (
                      <span
                        className="inline-block text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full w-max transition-colors"
                        style={{
                          color: activeBanner.text_color || '#B91C1C',
                          backgroundColor: activeBanner.text_color ? `${activeBanner.text_color}1A` : 'rgba(185, 28, 28, 0.05)'
                        }}
                      >
                        {activeBanner.badge_text}
                      </span>
                    )}

                    <h2
                      className="font-heading text-2xl sm:text-4xl lg:text-6xl font-black leading-[1.08] tracking-tight uppercase"
                      style={{ color: activeBanner.text_color || '#2B1B17' }}
                    >
                      {activeBanner.title}
                    </h2>

                    <p
                      className="text-[11px] sm:text-sm lg:text-base max-w-md leading-relaxed font-medium line-clamp-3 sm:line-clamp-none"
                      style={{ color: activeBanner.text_color ? `${activeBanner.text_color}D9` : '#5C4D4A' }}
                    >
                      {activeBanner.subtitle}
                    </p>

                    {/* Action CTA */}
                    <div className="pt-1.5">
                      <Link
                        href={activeBanner.cta_link}
                        className="inline-flex items-center gap-2 bg-[#7F1D1D] hover:bg-[#B91C1C] text-white font-extrabold text-[10px] sm:text-xs tracking-wider uppercase px-6 py-3.5 sm:px-8 sm:py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-xl"
                      >
                        <span>{activeBanner.cta_text || 'SHOP NOW'}</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                    </div>

                    {/* 3 Trust Indicators Below CTA (Hidden on mobile for visual density) */}
                    <div
                      className="pt-4 hidden sm:flex flex-wrap items-center gap-x-5 gap-y-2 border-t mt-6 transition-colors duration-500"
                      style={{ borderColor: activeBanner.text_color ? `${activeBanner.text_color}26` : '#EFE7DD' }}
                    >
                      <div
                        className="flex items-center gap-2 text-xs font-bold transition-colors duration-500"
                        style={{ color: activeBanner.text_color || '#5C4D4A' }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-500"
                          style={{
                            borderColor: activeBanner.text_color ? `${activeBanner.text_color}33` : '#EFE7DD',
                            backgroundColor: activeBanner.text_color ? `${activeBanner.text_color}1A` : 'rgba(239, 231, 221, 0.4)'
                          }}
                        >
                          <Award className="w-3.5 h-3.5" style={{ color: activeBanner.text_color || '#B91C1C' }} />
                        </div>
                        <span>No Added Sugar</span>
                      </div>
                      
                      <div
                        className="flex items-center gap-2 text-xs font-bold transition-colors duration-500"
                        style={{ color: activeBanner.text_color || '#5C4D4A' }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-500"
                          style={{
                            borderColor: activeBanner.text_color ? `${activeBanner.text_color}33` : '#EFE7DD',
                            backgroundColor: activeBanner.text_color ? `${activeBanner.text_color}1A` : 'rgba(239, 231, 221, 0.4)'
                          }}
                        >
                          <Leaf className="w-3.5 h-3.5" style={{ color: activeBanner.text_color || '#B91C1C' }} />
                        </div>
                        <span>All Natural Ingredients</span>
                      </div>

                      <div
                        className="flex items-center gap-2 text-xs font-bold transition-colors duration-500"
                        style={{ color: activeBanner.text_color || '#5C4D4A' }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-500"
                          style={{
                            borderColor: activeBanner.text_color ? `${activeBanner.text_color}33` : '#EFE7DD',
                            backgroundColor: activeBanner.text_color ? `${activeBanner.text_color}1A` : 'rgba(239, 231, 221, 0.4)'
                          }}
                        >
                          <Shield className="w-3.5 h-3.5" style={{ color: activeBanner.text_color || '#B91C1C' }} />
                        </div>
                        <span>No Preservatives</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Image Column (Fitted absolutely/aspect to prevent layout blowing up) */}
                  <div className="lg:col-span-6 flex items-center justify-center min-h-[140px] sm:min-h-[220px] lg:min-h-[350px]">
                    <div className="relative w-full max-w-[130px] sm:max-w-[220px] lg:max-w-[380px] aspect-square flex items-center justify-center">
                      {/* Soft round background glow */}
                      <div
                        className="absolute inset-0 rounded-full blur-2xl z-0 transition-colors duration-500"
                        style={{
                          backgroundColor: activeBanner.text_color ? `${activeBanner.text_color}1A` : 'rgba(239, 231, 221, 0.3)'
                        }}
                      />
                      
                      <div className="relative z-10 w-full h-full transform hover:scale-102 transition-transform duration-500">
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
              ) : (
                /* Full-Width layout - clickable hot link */
                <Link href={activeBanner.cta_link} className="absolute inset-0 w-full h-full cursor-pointer z-10" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Arrow Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-700 p-2.5 rounded-full shadow border border-gray-150 transition-all hidden md:block hover:scale-105"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-700 p-2.5 rounded-full shadow border border-gray-150 transition-all hidden md:block hover:scale-105"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > activeIndex ? 1 : -1)
                    setActiveIndex(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeIndex === index
                      ? 'bg-[#B91C1C] w-4'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

