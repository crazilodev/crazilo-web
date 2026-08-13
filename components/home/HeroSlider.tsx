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

  return (
    <section
      className="relative w-full overflow-hidden select-none border-b border-gray-100 transition-colors duration-500"
      style={{ backgroundColor: slideBgColor }}
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
                <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: slideBgColor }} />
              )}
            </div>

            {/* Content Layer (Overlayed above background) */}
            <div className="relative z-10 w-full h-full flex items-center px-4 sm:px-6 lg:px-8">
              {!activeBanner.is_full_width ? (
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center h-full pt-4 pb-20 sm:pt-8 sm:pb-24 lg:pt-8 lg:pb-28">
                  {/* Left Content Column */}
                  <div className="lg:col-span-6 flex flex-col justify-center space-y-3 sm:space-y-5 text-left">
                    {activeBanner.badge_text && (
                      <span
                        className="inline-block text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full w-max transition-colors"
                        style={{
                          color: textColor,
                          backgroundColor: textColor ? `${textColor}1A` : 'rgba(185, 28, 28, 0.05)'
                        }}
                      >
                        {activeBanner.badge_text}
                      </span>
                    )}

                    <h2
                      className="font-heading text-2xl sm:text-4xl lg:text-6xl font-black leading-[1.08] tracking-tight uppercase"
                      style={{ color: textColor }}
                    >
                      {activeBanner.title}
                    </h2>

                    <p
                      className="text-[11px] sm:text-sm lg:text-base max-w-md leading-relaxed font-medium line-clamp-3 sm:line-clamp-none"
                      style={{ color: textColor ? `${textColor}D9` : '#5C4D4A' }}
                    >
                      {activeBanner.subtitle}
                    </p>

                    {/* Action CTA */}
                    <div className="pt-2 sm:pt-4">
                      <Link
                        href={activeBanner.cta_link}
                        className="inline-flex items-center gap-2 font-extrabold text-[10px] sm:text-xs tracking-wider uppercase px-6 py-3.5 sm:px-8 sm:py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:brightness-110 active:brightness-95"
                        style={{
                          backgroundColor: btnBgColor,
                          color: btnTextColor
                        }}
                      >
                        <span>{activeBanner.cta_text || 'SHOP NOW'}</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Image Column (Fitted absolutely/aspect to prevent layout blowing up) */}
                  <div className="lg:col-span-6 flex items-center justify-center min-h-[140px] sm:min-h-[220px] lg:min-h-[350px]">
                    <div className="relative w-full max-w-[130px] sm:max-w-[220px] lg:max-w-[380px] aspect-square flex items-center justify-center">
                      {/* Soft round background glow */}
                      <div
                        className="absolute inset-0 rounded-full blur-2xl z-0 transition-colors duration-500"
                        style={{
                          backgroundColor: textColor ? `${textColor}1A` : 'rgba(239, 231, 221, 0.3)'
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

            {/* 3 Trust Indicators (Hidden on mobile for visual density) positioned absolutely at bottom left */}
            {!activeBanner.is_full_width && (
              <div
                className="absolute bottom-6 left-4 sm:left-6 lg:left-8 z-20 hidden sm:flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 transition-colors duration-500 w-[calc(100%-2rem)] sm:max-w-[480px] md:max-w-[550px] lg:max-w-[650px]"
                style={{ borderColor: textColor ? `${textColor}26` : '#EFE7DD' }}
              >
                <div
                  className="flex items-center gap-2 text-xs font-bold transition-colors duration-500"
                  style={{ color: textColor || '#5C4D4A' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-500"
                    style={{
                      borderColor: textColor ? `${textColor}33` : '#EFE7DD',
                      backgroundColor: textColor ? `${textColor}1A` : 'rgba(239, 231, 221, 0.4)'
                    }}
                  >
                    <Award className="w-3.5 h-3.5" style={{ color: textColor || '#B91C1C' }} />
                  </div>
                  <span>No Added Sugar</span>
                </div>

                <div
                  className="flex items-center gap-2 text-xs font-bold transition-colors duration-500"
                  style={{ color: textColor || '#5C4D4A' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-500"
                    style={{
                      borderColor: textColor ? `${textColor}33` : '#EFE7DD',
                      backgroundColor: textColor ? `${textColor}1A` : 'rgba(239, 231, 221, 0.4)'
                    }}
                  >
                    <Leaf className="w-3.5 h-3.5" style={{ color: textColor || '#B91C1C' }} />
                  </div>
                  <span>All Natural Ingredients</span>
                </div>

                <div
                  className="flex items-center gap-2 text-xs font-bold transition-colors duration-500"
                  style={{ color: textColor || '#5C4D4A' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-500"
                    style={{
                      borderColor: textColor ? `${textColor}33` : '#EFE7DD',
                      backgroundColor: textColor ? `${textColor}1A` : 'rgba(239, 231, 221, 0.4)'
                    }}
                  >
                    <Shield className="w-3.5 h-3.5" style={{ color: textColor || '#B91C1C' }} />
                  </div>
                  <span>No Preservatives</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Unified Controls Console Pill */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 md:right-6 lg:right-8 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-gray-150/70 py-1.5 px-2.5 rounded-full shadow-sm hover:shadow-md transition-all">
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
                  className={`h-1.5 rounded-full transition-all ${
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
    </section>
  )
}
