'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, CheckCircle2, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BannerSkeleton } from '@/components/ui/Skeleton'

const HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'Kashmiri Mamra',
    highlightTitle: 'Almonds',
    tagline: 'Chew The Pure Goodness',
    subtitle: '100% Raw, Organic & Oil-Rich Kashmiri Mamra Almonds. Sourced directly from valley orchards.',
    bgGradient: 'from-[#8B0000] via-[#5C0606] to-[#120202]',
    accentColor: '#D97706',
    productImage: 'https://images.unsplash.com/photo-1508061252227-142f1f5d6df4?auto=format&fit=crop&w=900&q=80',
    badgeText: 'DIRECT FROM KASHMIR',
    ctaText: 'Shop Almonds',
    ctaLink: '/products/premium-kashmiri-almonds',
    floatingElements: [
      { text: '🌰', top: '15%', left: '10%', delay: 0.2 },
      { text: '🍃', top: '25%', right: '12%', delay: 0.4 },
      { text: '✨', top: '70%', right: '25%', delay: 0.6 },
    ],
    features: [
      { label: 'NO ADDED SUGAR', desc: '100% Pure' },
      { label: 'ALL NATURAL', desc: 'No Preservatives' },
    ],
  },
  {
    id: 'slide-2',
    title: 'Authentic Hand-Picked',
    highlightTitle: 'Spices & Herbs',
    tagline: 'Aroma That Speaks Pure Tradition',
    subtitle: 'Stone-ground, sun-dried, and aromatic Indian spices packed in light-shielded canisters.',
    bgGradient: 'from-[#5C1605] via-[#380D03] to-[#0F0502]',
    accentColor: '#F59E0B',
    productImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80',
    badgeText: 'STONE GROUND',
    ctaText: 'Explore Spices',
    ctaLink: '/category/spices',
    floatingElements: [
      { text: '🌶️', top: '18%', left: '15%', delay: 0.3 },
      { text: '🌿', top: '65%', right: '15%', delay: 0.5 },
      { text: '✨', top: '30%', right: '20%', delay: 0.7 },
    ],
    features: [
      { label: 'ORGANIC CERTIFIED', desc: 'Lab Tested' },
      { label: 'MAX AROMA', desc: 'Vacuum Sealed' },
    ],
  },
  {
    id: 'slide-3',
    title: 'Crunchy Roasted',
    highlightTitle: 'Makhana & Seeds',
    tagline: 'Guilt-Free Daily Superfood',
    subtitle: 'Lightly roasted, sea-salt seasoned foxnuts and nutrient-dense seed blends for healthy snacking.',
    bgGradient: 'from-[#064E3B] via-[#022C22] to-[#01140E]',
    accentColor: '#10B981',
    productImage: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=900&q=80',
    badgeText: 'GUILT-FREE SNACKING',
    ctaText: 'Shop Makhana',
    ctaLink: '/category/makhana',
    floatingElements: [
      { text: '🌱', top: '20%', left: '12%', delay: 0.2 },
      { text: '🍿', top: '70%', right: '18%', delay: 0.4 },
      { text: '✨', top: '25%', right: '22%', delay: 0.6 },
    ],
    features: [
      { label: 'HIGH PROTEIN', desc: 'Zero Trans Fat' },
      { label: 'LOW CALORIE', desc: '100% Roasted' },
    ],
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [autoPlay, next])

  const slide = HERO_SLIDES[current]

  return (
    <section
      className="relative overflow-hidden bg-brand-dark min-h-[620px] lg:min-h-[680px]"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className={`relative w-full min-h-[620px] lg:min-h-[680px] bg-gradient-to-br ${slide.bgGradient} overflow-hidden`}
        >
          {/* Subtle Doodle/Line Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-doodle" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 10 10 Q 30 0 50 10 Q 60 30 50 50 Q 30 60 10 50 Q 0 30 10 10 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" />
                  <circle cx="30" cy="30" r="3" fill="#FFFFFF" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-doodle)" />
            </svg>
          </div>

          {/* Floating background ambient glow */}
          <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />

          {/* Main Hero Container */}
          <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 h-full flex flex-col justify-between min-h-[620px] lg:min-h-[680px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
              
              {/* Left Column: Text & Features */}
              <div className="lg:col-span-7 space-y-6 text-white">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                  <span className="text-brand-gold text-xs font-bold tracking-widest uppercase">
                    {slide.badgeText}
                  </span>
                </motion.div>

                {/* Main Headline */}
                <div className="space-y-1">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-brand-gold text-base lg:text-xl font-medium tracking-wide"
                  >
                    {slide.tagline}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight"
                  >
                    {slide.title}<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-300 to-white">
                      {slide.highlightTitle}
                    </span>
                  </motion.h1>
                </div>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-white/80 text-base sm:text-lg max-w-xl leading-relaxed font-body"
                >
                  {slide.subtitle}
                </motion.p>

                {/* Feature Circular Line-Art Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex flex-wrap gap-4 pt-2"
                >
                  {slide.features.map((feat) => (
                    <div key={feat.label} className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-md">
                      <div className="w-9 h-9 rounded-full border border-brand-gold/60 flex items-center justify-center text-brand-gold">
                        <CheckCircle2 className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-white">{feat.label}</p>
                        <p className="text-[10px] text-white/60">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex flex-wrap gap-4 pt-4"
                >
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-3 bg-brand-gold hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl shadow-brand-gold/20 hover:scale-105 btn-premium"
                  >
                    {slide.ctaText}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:border-white/70 hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 backdrop-blur-md"
                  >
                    Explore Range
                  </Link>
                </motion.div>
              </div>

              {/* Right Column: Animated Product Cutout with Drop Animation & Floating Nuts */}
              <div className="lg:col-span-5 relative flex items-center justify-center h-[340px] sm:h-[420px] lg:h-[480px]">
                
                {/* Floating Elements (Nuts / Leaves dropping softly) */}
                {slide.floatingElements.map((elem, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: -80, opacity: 0 }}
                    animate={{
                      y: [-8, 8, -8],
                      opacity: [0.7, 1, 0.7],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                      opacity: { duration: 0.8, delay: elem.delay },
                      rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{ position: 'absolute', top: elem.top, left: elem.left, right: elem.right }}
                    className="z-20 text-3xl sm:text-4xl pointer-events-none drop-shadow-2xl"
                  >
                    {elem.text}
                  </motion.div>
                ))}

                {/* Backlit Glow behind cutout */}
                <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full bg-gradient-to-tr from-brand-gold/40 to-white/20 blur-2xl pointer-events-none" />

                {/* Animated Drop-in Product Container */}
                <motion.div
                  initial={{ y: -160, opacity: 0, rotate: -8, scale: 0.85 }}
                  animate={{ y: 0, opacity: 1, rotate: 2, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 16,
                    delay: 0.2,
                  }}
                  className="relative z-10 w-[240px] sm:w-[320px] lg:w-[360px] h-[300px] sm:h-[380px] lg:h-[420px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black/20 backdrop-blur-sm group"
                >
                  <Image
                    src={slide.productImage}
                    alt={slide.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                  />
                  {/* Glass overlay badge on product image */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-gold font-bold uppercase tracking-wider">Crazilo Premium</p>
                      <p className="text-sm font-bold text-white truncate">{slide.title}</p>
                    </div>
                    <span className="text-xs bg-brand-gold text-white font-bold px-2.5 py-1 rounded-lg flex-shrink-0">
                      100% Organic
                    </span>
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Bottom Trust Bar (100% Vegetarian, FSSAI Certified, Ship Worldwide) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4"
            >
              {[
                { icon: CheckCircle2, title: '100% Vegetarian', desc: 'Pure plant ingredients' },
                { icon: ShieldCheck, title: 'FSSAI Certified', desc: 'Highest safety standards' },
                { icon: Globe, title: 'Pan-India Shipping', desc: 'Delivered to 25,000+ pincodes' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-white">{title}</p>
                    <p className="text-[10px] text-white/60">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Controls */}
      {HERO_SLIDES.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-brand-red transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-brand-red transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 right-8 z-30 flex items-center gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? 'w-8 h-2.5 bg-brand-gold'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
