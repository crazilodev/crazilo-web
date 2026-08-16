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

  const hasMobileImage = mounted && isMobile && !!activeBanner?.mobile_image_url

  return (
    <section
      className="relative w-full overflow-hidden select-none border-b border-gray-100 bg-white sm:bg-transparent px-3 pt-2 sm:px-0 sm:pt-0 transition-colors duration-500"
      style={{ backgroundColor: isMobile ? '#FFFFFF' : slideBgColor }}
    >
      {/* 
        Hero Container:
        - Mobile: aspect-[4/5] if mobile image is present (large & legible), else aspect-[16/9.5] rounded card layout
        - Desktop: full-bleed original aspect ratio boundaries
      */}
      <div className={`relative w-full ${hasMobileImage ? 'aspect-[4/5]' : 'aspect-[16/9.5]'} sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[16/6] max-w-[1440px] mx-auto overflow-hidden rounded-2xl sm:rounded-none border border-gray-100/50 sm:border-0 shadow-sm sm:shadow-none`}>
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
            {/* Background Layer */}
            <div className="absolute inset-0 w-full h-full z-0">
              {activeBanner.is_full_width || hasMobileImage ? (
                <Image
                  src={hasMobileImage ? activeBanner.mobile_image_url! : activeBanner.image_url}
                  alt={activeBanner.title}
                  fill
                  className="object-cover object-center"
                  priority
                />
              ) : (
                <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: slideBgColor }} />
              )}
            </div>

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full flex items-center px-4 sm:px-6 lg:px-8">
              {!activeBanner.is_full_width && !hasMobileImage ? (
                <div className="w-full grid grid-cols-12 gap-2 sm:gap-6 lg:gap-8 items-center h-full pt-3 pb-8 sm:pt-8 sm:pb-24 lg:pt-8 lg:pb-28">
                  {/* Left Column (Content) */}
                  <div className="col-span-7 sm:col-span-6 flex flex-col justify-center space-y-1.5 sm:space-y-5 text-left pl-1 sm:pl-4 lg:pl-6">
                    {activeBanner.badge_text && (
                      <span
                        className="inline-block text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full w-max transition-colors"
                        style={{
                          color: textColor,
                          backgroundColor: textColor ? `${textColor}1A` : 'rgba(185, 28, 28, 0.05)'
                        }}
                      >
                        {activeBanner.badge_text}
                      </span>
                    )}

                    <h2
                      className="font-heading text-sm sm:text-4xl lg:text-6xl font-black leading-[1.1] sm:leading-[1.08] tracking-tight uppercase"
                      style={{ color: textColor }}
                    >
                      {activeBanner.title}
                    </h2>

                    <p
                      className="text-[9px] sm:text-sm lg:text-base max-w-md leading-relaxed font-semibold sm:font-medium line-clamp-2 sm:line-clamp-none"
                      style={{ color: textColor ? `${textColor}D9` : '#5C4D4A' }}
                    >
                      {activeBanner.subtitle}
                    </p>

                    {/* Action CTA */}
                    <div className="pt-1.5 sm:pt-4">
                      <Link
                        href={activeBanner.cta_link}
                        className="inline-flex items-center gap-1.5 sm:gap-2 font-extrabold text-[9px] sm:text-xs tracking-wider uppercase px-4 py-2 sm:px-8 sm:py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:brightness-110 active:brightness-95"
                        style={{
                          backgroundColor: btnBgColor,
                          color: btnTextColor
                        }}
                      >
                        <span>{activeBanner.cta_text || 'SHOP NOW'}</span>
                        <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column (Product Image) */}
                  <div className="col-span-5 sm:col-span-6 flex items-center justify-center h-full pr-1 sm:pr-4 lg:pr-6 py-2 sm:py-6">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full blur-xl sm:blur-3xl z-0 transition-colors duration-500 scale-90"
                        style={{
                          backgroundColor: textColor ? `${textColor}1A` : 'rgba(239, 231, 221, 0.3)'
                        }}
                      />
                      <div className="relative z-10 w-full h-full max-h-[120px] sm:max-h-[320px] lg:max-h-[460px] transform hover:scale-102 transition-transform duration-500">
                        <Image
                          src={activeBanner.image_url}
                          alt={activeBanner.title}
                          fill
                          className="object-contain drop-shadow-2xl"
                          priority
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link href={activeBanner.cta_link} className="absolute inset-0 w-full h-full cursor-pointer z-10" />
                  {/* Shop Now overlay button for mobile viewport when mobile background image is showing */}
                  {hasMobileImage && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 sm:hidden">
                      <Link
                        href={activeBanner.cta_link}
                        className="inline-flex items-center gap-1.5 font-extrabold text-[10px] tracking-wider uppercase px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:brightness-110 active:scale-95"
                        style={{
                          backgroundColor: btnBgColor,
                          color: btnTextColor
                        }}
                      >
                        <span>{activeBanner.cta_text || 'SHOP NOW'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 3 Trust Indicators (Desktop bottom-left align) */}
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
