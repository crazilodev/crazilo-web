'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Leaf, Sparkles, Zap, Heart } from 'lucide-react'

const SNACK_CARDS = [
  {
    id: 'snack-1',
    title: 'Daily Wellness',
    subtitle: 'Wholesome snacks for everyday nourishment...',
    badge: '100% Natural',
    badgeIcon: Leaf,
    bgGradient: 'from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0]',
    cardBorder: 'border-emerald-200/60',
    titleColor: 'text-[#166534]',
    subtitleColor: 'text-[#15803D]/80',
    btnTextColor: 'text-[#166534]',
    podiumGradient: 'from-[#A7F3D0] to-[#6EE7B7]',
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=600&q=80',
    link: '/category/dry-fruits',
    floatingDecoration: '🍃',
  },
  {
    id: 'snack-2',
    title: 'Gifting? Easy!',
    subtitle: 'Bundles, combos and a lot more for your loved ones...',
    badge: 'Festive Pack',
    badgeIcon: Heart,
    bgGradient: 'from-[#FDF2F8] via-[#FCE7F3] to-[#FBCFE8]',
    cardBorder: 'border-pink-200/60',
    titleColor: 'text-[#9D174D]',
    subtitleColor: 'text-[#BE185D]/80',
    btnTextColor: 'text-[#9D174D]',
    podiumGradient: 'from-[#F9A8D4] to-[#F472B6]',
    image: 'https://images.unsplash.com/photo-1508061252227-142f1f5d6df4?auto=format&fit=crop&w=600&q=80',
    link: '/category/gift-boxes',
    floatingDecoration: '✨',
  },
  {
    id: 'snack-3',
    title: 'Protein Power',
    subtitle: 'High protein snacks and super foods for the energy.',
    badge: 'High Protein',
    badgeIcon: Zap,
    bgGradient: 'from-[#FEFCE8] via-[#FEF08A] to-[#FDE047]/60',
    cardBorder: 'border-amber-200/60',
    titleColor: 'text-[#854D0E]',
    subtitleColor: 'text-[#A16207]/80',
    btnTextColor: 'text-[#854D0E]',
    podiumGradient: 'from-[#FACC15] to-[#EAB308]',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    link: '/category/trail-mixes',
    floatingDecoration: '⚡',
  },
  {
    id: 'snack-4',
    title: 'Guilt-free Snacks',
    subtitle: 'Low calorie snacks to beat the cravings.',
    badge: 'Low Calorie',
    badgeIcon: Sparkles,
    bgGradient: 'from-[#ECFEFF] via-[#CFFAFE] to-[#A5F3FC]/70',
    cardBorder: 'border-cyan-200/60',
    titleColor: 'text-[#155E75]',
    subtitleColor: 'text-[#0E7490]/80',
    btnTextColor: 'text-[#155E75]',
    podiumGradient: 'from-[#67E8F9] to-[#22D3EE]',
    image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80',
    link: '/category/makhana',
    floatingDecoration: '🌱',
  },
]

export default function FindYourSnack() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Find Your Snack!
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Curated categories tailored for daily wellness, gifting, energy boost & healthy cravings
          </p>
        </div>

        {/* 4 Horizontal Podium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SNACK_CARDS.map((card, idx) => {
            const BadgeIcon = card.badgeIcon
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-b ${card.bgGradient} border ${card.cardBorder} p-6 flex flex-col justify-between min-h-[360px] sm:min-h-[400px] group shadow-card hover:shadow-card-hover transition-all duration-300`}
              >
                {/* Subtle Leaf/Wave Watermark Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-15 pointer-events-none">
                  <svg className="w-full h-full text-current" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M 10 30 Q 30 10 60 30 T 90 60 Q 60 90 30 60 Z" opacity="0.5" />
                  </svg>
                </div>

                {/* Top Text Content */}
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-heading text-2xl font-extrabold tracking-tight ${card.titleColor}`}>
                      {card.title}
                    </h3>
                    <span className="text-lg pointer-events-none">
                      {card.floatingDecoration}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed ${card.subtitleColor}`}>
                    {card.subtitle}
                  </p>

                  {/* Explore Pill Button */}
                  <div className="pt-2">
                    <Link
                      href={card.link}
                      className={`inline-flex items-center gap-1.5 bg-white ${card.btnTextColor} font-bold text-xs px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105`}
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>

                {/* 3D Round Podium & Product Render */}
                <div className="relative z-10 mt-6 flex items-end justify-center h-[180px] sm:h-[210px]">
                  
                  {/* 3D Podium Base Cylinder */}
                  <div className="absolute bottom-0 w-[80%] h-[36px] sm:h-[42px] rounded-full bg-gradient-to-r ${card.podiumGradient} shadow-md border border-white/40 transform scale-y-75" />
                  <div className="absolute bottom-2 w-[70%] h-[28px] sm:h-[34px] rounded-full bg-white/40 blur-sm transform scale-y-75" />

                  {/* Product Pack Cutout Sitting on Podium */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-20 w-[140px] sm:w-[160px] h-[150px] sm:h-[180px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/60 mb-3 bg-white"
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                    {/* Badge Pill on Product Image */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                      <BadgeIcon className="w-2.5 h-2.5 text-brand-gold" />
                      {card.badge}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
