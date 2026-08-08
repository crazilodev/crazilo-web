'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const BANNER_CARDS = [
  {
    id: 'card-1',
    category: 'Dry Fruits',
    title: 'Date Bites',
    subtitle: 'Chew Your Brew',
    description: '100% Natural Date & Nut Delights • No Added Sugar',
    bgGradient: 'from-[#006064] via-[#004D40] to-[#002528]',
    accentText: 'text-[#80DEEA]',
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=800&q=80',
    link: '/category/dry-fruits',
    floatingIcons: ['🌰', '✨', '🍃'],
  },
  {
    id: 'card-2',
    category: 'Trail Mixes',
    title: 'Dry Fruit Mixes',
    subtitle: 'Power Up Seeds & Berries',
    description: 'Original Trail Mix • Berry Delight • Power Seed Mix',
    bgGradient: 'from-[#880E4F] via-[#560631] to-[#31021A]',
    accentText: 'text-[#F48FB1]',
    image: 'https://images.unsplash.com/photo-1508061252227-142f1f5d6df4?auto=format&fit=crop&w=800&q=80',
    link: '/category/trail-mixes',
    floatingIcons: ['🍓', '🥜', '✨'],
  },
  {
    id: 'card-3',
    category: 'Makhana',
    title: 'Roasted Makhana',
    subtitle: 'Crunchy Salt & Peri Peri',
    description: 'Cream & Onion • Peri Peri • Himalayan Salt Roasted',
    bgGradient: 'from-[#4A148C] via-[#2E0B59] to-[#1A0536]',
    accentText: 'text-[#CE93D8]',
    image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=800&q=80',
    link: '/category/makhana',
    floatingIcons: ['🍿', '🌶️', '✨'],
  },
  {
    id: 'card-4',
    category: 'Seeds',
    title: 'Premium Seeds',
    subtitle: 'Sunflower, Pumpkin & Chia',
    description: 'Raw & Roasted Chia, Pumpkin, Flax & Sunflower Seeds',
    bgGradient: 'from-[#1A237E] via-[#0F144D] to-[#070A2D]',
    accentText: 'text-[#9FA8DA]',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    link: '/category/seeds',
    floatingIcons: ['🌱', '🌻', '✨'],
  },
]

export default function OfferBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-extrabold text-gray-900 tracking-tight">
              Featured Collections
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Handpicked 100% natural dry fruit mixes, roasted snacks, and superfood seeds
            </p>
          </div>
        </div>

        {/* 4-Card Visual Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BANNER_CARDS.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.bgGradient} p-8 lg:p-10 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] group shadow-card hover:shadow-card-hover transition-all duration-300`}
            >
              {/* Subtle line pattern overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <pattern id={`card-pattern-${idx}`} width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 0 20 Q 10 0 20 20 T 40 20" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill={`url(#card-pattern-${idx})`} />
                </svg>
              </div>

              {/* Floating ambient glow */}
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              {/* Card Content & Text */}
              <div className="relative z-10 max-w-[60%] sm:max-w-[55%] space-y-3">
                <span className={`text-xs font-bold uppercase tracking-widest ${card.accentText}`}>
                  {card.category}
                </span>

                <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                  {card.title}
                </h3>

                <p className="text-white/90 font-semibold text-base sm:text-lg">
                  {card.subtitle}
                </p>

                <p className="text-white/70 text-xs leading-relaxed hidden sm:block">
                  {card.description}
                </p>
              </div>

              {/* Shop Now CTA */}
              <div className="relative z-10 pt-6">
                <Link
                  href={card.link}
                  className="inline-flex items-center gap-2 text-white font-bold text-sm group-hover:text-brand-gold transition-colors hover:gap-3"
                >
                  <span className="border-b-2 border-white group-hover:border-brand-gold pb-0.5">
                    Shop Now
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Product Cutout & Floating Image on the Right */}
              <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 z-10 w-[140px] sm:w-[190px] h-[160px] sm:h-[210px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500 bg-black/20 backdrop-blur-sm">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                />
                {/* Overlay Badge */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 text-[9px] font-bold text-white border border-white/20">
                  100% Natural
                </div>
              </div>

              {/* Floating Emojis/Icons around the cutout */}
              {card.floatingIcons.map((icon, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-4, 6, -4],
                    rotate: [0, 8, -8, 0],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    position: 'absolute',
                    top: i === 0 ? '15%' : i === 1 ? '55%' : '75%',
                    right: i === 0 ? '45%' : i === 1 ? '48%' : '42%',
                  }}
                  className="z-20 text-xl sm:text-2xl pointer-events-none drop-shadow-md hidden sm:block"
                >
                  {icon}
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
