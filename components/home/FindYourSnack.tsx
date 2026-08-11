'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Leaf, Sparkles, Zap, Heart } from 'lucide-react'
import type { HomeFeatureCard } from '@/types'

interface FindYourSnackProps {
  cards: HomeFeatureCard[]
}

function getBadgeIcon(eyebrowText: string | null) {
  const label = eyebrowText || ''
  if (label.includes('Natural')) return Leaf
  if (label.includes('Festive') || label.includes('Heart')) return Heart
  if (label.includes('Protein')) return Zap
  return Sparkles
}

function getSnackCardStyle(title: string) {
  if (title === 'Daily Wellness') {
    return {
      bgGradient: 'from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0]',
      cardBorder: 'border-emerald-200/60',
      titleColor: 'text-[#166534]',
      subtitleColor: 'text-[#15803D]/80',
      btnTextColor: 'text-[#166534]',
      podiumGradient: 'from-[#A7F3D0] to-[#6EE7B7]',
      floatingDecoration: '🍃',
    }
  }

  if (title === 'Gifting? Easy!') {
    return {
      bgGradient: 'from-[#FDF2F8] via-[#FCE7F3] to-[#FBCFE8]',
      cardBorder: 'border-pink-200/60',
      titleColor: 'text-[#9D174D]',
      subtitleColor: 'text-[#BE185D]/80',
      btnTextColor: 'text-[#9D174D]',
      podiumGradient: 'from-[#F9A8D4] to-[#F472B6]',
      floatingDecoration: '✨',
    }
  }

  if (title === 'Protein Power') {
    return {
      bgGradient: 'from-[#FEFCE8] via-[#FEF08A] to-[#FDE047]/60',
      cardBorder: 'border-amber-200/60',
      titleColor: 'text-[#854D0E]',
      subtitleColor: 'text-[#A16207]/80',
      btnTextColor: 'text-[#854D0E]',
      podiumGradient: 'from-[#FACC15] to-[#EAB308]',
      floatingDecoration: '⚡',
    }
  }

  return {
    bgGradient: 'from-[#ECFEFF] via-[#CFFAFE] to-[#A5F3FC]/70',
    cardBorder: 'border-cyan-200/60',
    titleColor: 'text-[#155E75]',
    subtitleColor: 'text-[#0E7490]/80',
    btnTextColor: 'text-[#155E75]',
    podiumGradient: 'from-[#67E8F9] to-[#22D3EE]',
    floatingDecoration: '🌱',
  }
}

export default function FindYourSnack({ cards }: FindYourSnackProps) {
  if (cards.length === 0) return null

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Find Your Snack!
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Curated categories tailored for daily wellness, gifting, energy boost & healthy cravings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => {
            const BadgeIcon = getBadgeIcon(card.eyebrow_text)
            const style = getSnackCardStyle(card.title)

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-b ${style.bgGradient} border ${style.cardBorder} p-6 flex flex-col justify-between min-h-[360px] sm:min-h-[400px] group shadow-card hover:shadow-card-hover transition-all duration-300`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-15 pointer-events-none">
                  <svg className="w-full h-full text-current" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M 10 30 Q 30 10 60 30 T 90 60 Q 60 90 30 60 Z" opacity="0.5" />
                  </svg>
                </div>

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-heading text-2xl font-extrabold tracking-tight ${style.titleColor}`}>
                      {card.title}
                    </h3>
                    <span className="text-lg pointer-events-none">{style.floatingDecoration}</span>
                  </div>

                  <p className={`text-xs leading-relaxed ${style.subtitleColor}`}>{card.subtitle}</p>

                  <div className="pt-2">
                    <Link
                      href={card.link_url || '/products'}
                      className={`inline-flex items-center gap-1.5 bg-white ${style.btnTextColor} font-bold text-xs px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105`}
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex items-end justify-center h-[180px] sm:h-[210px]">
                  <div className={`absolute bottom-0 w-[80%] h-[36px] sm:h-[42px] rounded-full bg-gradient-to-r ${style.podiumGradient} shadow-md border border-white/40 transform scale-y-75`} />
                  <div className="absolute bottom-2 w-[70%] h-[28px] sm:h-[34px] rounded-full bg-white/40 blur-sm transform scale-y-75" />

                  <motion.div
                    whileHover={{ y: -6, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-20 w-[140px] sm:w-[160px] h-[150px] sm:h-[180px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/60 mb-3 bg-white"
                  >
                    <Image src={card.image_url} alt={card.title} fill className="object-cover" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                      <BadgeIcon className="w-2.5 h-2.5 text-brand-gold" />
                      {card.eyebrow_text}
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
