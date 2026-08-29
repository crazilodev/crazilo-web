'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
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

  const bgColors = (activeBanner.bg_color || '').split(';')
  const slideBgColor = bgColors[0] || '#FFF8F5'
  const btnBgColor = bgColors[1] || '#7F1D1D'

  const textColors = (activeBanner.text_color || '').split(';')
  const textColor = textColors[0] || '#2B1B17'
  const btnTextColor = textColors[1] || '#FFFFFF'

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

  const hasMobileImage = mounted && isMobile && !!activeBanner?.mobile_image_url

  return (
    <section className="relative w-full overflow-hidden select-none border-b border-gray-100">
      {/* 
        Hero Banner Container: Full-bleed 100% width edge-to-edge
        - Mobile: taller aspect ratio for high visibility
        - Desktop: expanded height ratios for a bolder, more spacious presentation
      */}
      <div className={`relative w-full ${hasMobileImage ? 'aspect-[4/5]' : 'aspect-[16/10]'} sm:aspect-[1.9/1] md:aspect-[2.1/1] lg:aspect-[2.4/1] xl:aspect-[2.5/1] min-h-[260px] sm:min-h-[380px] md:min-h-[440px] lg:min-h-[500px] xl:min-h-[540px] overflow-hidden`}>
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
            drag={isMobile ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              const swipeThreshold = 50
              if (info.offset.x < -swipeThreshold) {
                handleNext()
              } else if (info.offset.x > swipeThreshold) {
                handlePrev()
              }
            }}
            className="w-full h-full absolute inset-0 flex items-center"
          >
            {/* Full Bleed Banner Image View */}
            <Link
              href={activeBanner.cta_link || '/products'}
              className="absolute inset-0 w-full h-full block z-0 group cursor-pointer"
            >
              <Image
                src={hasMobileImage ? activeBanner.mobile_image_url! : activeBanner.image_url}
                alt={activeBanner.title || 'Hero Banner'}
                fill
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                priority
                sizes="100vw"
              />
            </Link>

            {/* Optional Overlay Content (Rendered only when title or subtitle is explicitly present and not is_full_width) */}
            {!activeBanner.is_full_width && (activeBanner.title || activeBanner.subtitle) && (
              <div className="relative z-10 w-full h-full flex items-center px-6 sm:px-12 lg:px-20 pointer-events-none">
                <div className="max-w-xl flex flex-col space-y-2 sm:space-y-4 text-left pointer-events-auto">
                  {activeBanner.badge_text && (
                    <span
                      className="inline-block text-[9px] sm:text-[11px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full w-max shadow-sm"
                      style={{
                        backgroundColor: btnBgColor,
                        color: btnTextColor,
                      }}
                    >
                      {activeBanner.badge_text}
                    </span>
                  )}

                  {activeBanner.title && (
                    <h2
                      className="font-heading text-lg sm:text-3xl lg:text-5xl font-black leading-[1.1] tracking-tight uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                      style={{ color: textColor || '#FFFFFF' }}
                    >
                      {activeBanner.title}
                    </h2>
                  )}

                  {activeBanner.subtitle && (
                    <p
                      className="text-xs sm:text-sm lg:text-base leading-relaxed font-semibold line-clamp-2 sm:line-clamp-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
                      style={{ color: textColor ? `${textColor}EE` : '#FFFFFF' }}
                    >
                      {activeBanner.subtitle}
                    </p>
                  )}

                  {activeBanner.cta_text && (
                    <div className="pt-2">
                      <Link
                        href={activeBanner.cta_link || '/products'}
                        className="inline-flex items-center gap-2 font-extrabold text-[10px] sm:text-xs tracking-wider uppercase px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95"
                        style={{
                          backgroundColor: btnBgColor,
                          color: btnTextColor,
                        }}
                      >
                        <span>{activeBanner.cta_text}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Desktop Unified Controls Console Pill (Hidden on mobile) */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 right-4 md:right-6 lg:right-8 z-20 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md border border-gray-150/70 py-1.5 px-2.5 rounded-full shadow-sm hover:shadow-md transition-all">
            <button
              onClick={handlePrev}
              className="text-gray-500 hover:text-[#B91C1C] hover:bg-gray-100/70 p-1.5 rounded-full transition-colors flex items-center justify-center active:scale-95"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 px-2.5 border-l border-r border-gray-150">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > activeIndex ? 1 : -1)
                    setActiveIndex(index)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? 'bg-[#B91C1C] w-3.5'
                      : 'bg-gray-300 hover:bg-gray-400 w-1.5'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="text-gray-500 hover:text-[#B91C1C] hover:bg-gray-100/70 p-1.5 rounded-full transition-colors flex items-center justify-center active:scale-95"
              aria-label="Next banner"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Centered Dots Indicators (Mobile only, rendered below card slider) */}
      {banners.length > 1 && (
        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1)
                setActiveIndex(index)
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? 'bg-[#B91C1C] w-4'
                  : 'bg-gray-250 hover:bg-gray-355 w-1.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
