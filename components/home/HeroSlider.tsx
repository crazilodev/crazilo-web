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
      className="relative overflow-hidden select-none py-6 sm:py-12 border-b border-gray-100 transition-colors duration-500"
      style={{ backgroundColor: activeBanner.bg_color || '#FFF8F5' }}
    >
      <div className="relative min-h-[460px] sm:min-h-[500px] lg:min-h-[550px] overflow-hidden max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
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
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-left">
              {activeBanner.badge_text && (
                <span
                  className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-max transition-colors duration-500"
                  style={{
                    color: activeBanner.text_color || '#B91C1C',
                    backgroundColor: activeBanner.text_color ? `${activeBanner.text_color}1A` : 'rgba(185, 28, 28, 0.05)'
                  }}
                >
                  {activeBanner.badge_text}
                </span>
              )}

              <h1
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight uppercase transition-colors duration-500"
                style={{ color: activeBanner.text_color || '#2B1B17' }}
              >
                {activeBanner.title}
              </h1>

              <p
                className="text-sm sm:text-base max-w-md leading-relaxed font-medium transition-colors duration-500"
                style={{ color: activeBanner.text_color ? `${activeBanner.text_color}D9` : '#5C4D4A' }}
              >
                {activeBanner.subtitle}
              </p>

              {/* Action CTA */}
              <div className="pt-2">
                <Link
                  href={activeBanner.cta_link}
                  className="inline-flex items-center gap-2 bg-[#7F1D1D] hover:bg-[#B91C1C] text-white font-extrabold text-xs tracking-wider uppercase px-8 py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  <span>{activeBanner.cta_text || 'SHOP NOW'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 3 Trust Indicators Below CTA */}
              <div
                className="pt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t mt-6 transition-colors duration-500"
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

            {/* Right Image Column */}
            <div className="lg:col-span-6 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
              <div className="relative w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[420px] aspect-square flex items-center justify-center">
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
          </motion.div>
        </AnimatePresence>



        {/* Carousel Arrow Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow border border-gray-150 transition-all hidden md:block"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow border border-gray-150 transition-all hidden md:block"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
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
                      : 'bg-gray-350 hover:bg-gray-400'
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

