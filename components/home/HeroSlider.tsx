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
  const slideBgColor = bgColors[0] || '#0F0F0F'
  const btnBgColor = bgColors[1] || '#B91C1C'

  const textColors = (activeBanner.text_color || '').split(';')
  const textColor = textColors[0] || '#FFFFFF'
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
    <section className="relative w-full select-none bg-white sm:border-b sm:border-gray-100 px-3 pt-2 pb-1 sm:px-0 sm:pt-0 sm:pb-0">
      {/* 
        Hero Banner Container:
        - Mobile: exact 358x200px rounded card presentation
        - Desktop: full-bleed high-definition presentation
      */}
      <div className="relative w-full max-w-[358px] h-[200px] sm:h-auto sm:max-w-none sm:aspect-[1.9/1] md:aspect-[2.1/1] lg:aspect-[2.4/1] xl:aspect-[2.5/1] sm:min-h-[380px] md:min-h-[440px] lg:min-h-[500px] xl:min-h-[540px] mx-auto rounded-2xl sm:rounded-none overflow-hidden shadow-sm sm:shadow-none bg-[#121212] sm:bg-transparent">
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
            {/* Banner Background Image */}
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

            {/* Shopping CTA Button positioned lower on the banner */}
            <div className="absolute bottom-3.5 left-4 sm:bottom-8 sm:left-12 z-20">
              <Link
                href={activeBanner.cta_link || '/products'}
                className="inline-flex items-center gap-1 sm:gap-2 font-black text-[8.5px] sm:text-xs tracking-wider uppercase px-3.5 py-1.5 sm:px-7 sm:py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:brightness-110 active:scale-95 whitespace-nowrap"
                style={{
                  backgroundColor: btnBgColor || '#B91C1C',
                  color: btnTextColor || '#FFFFFF',
                }}
              >
                <span>{activeBanner.cta_text || 'SHOP NOW'}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              </Link>
            </div>
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

      {/* Centered Dots Indicators (Mobile only, rendered below card) */}
      {banners.length > 1 && (
        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1)
                setActiveIndex(index)
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? 'bg-[#B91C1C] w-4'
                  : 'bg-gray-300 hover:bg-gray-400 w-1'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
