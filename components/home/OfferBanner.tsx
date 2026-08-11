'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { HomeFeatureCard } from '@/types'

interface OfferBannerProps {
  cards: HomeFeatureCard[]
}

function getOfferCardStyle(card: HomeFeatureCard) {
  if (card.title === 'Date Bites') {
    return {
      bgGradient: 'from-[#006064] via-[#004D40] to-[#002528]',
      accentText: 'text-[#80DEEA]',
    }
  }

  if (card.title === 'Dry Fruit Mixes') {
    return {
      bgGradient: 'from-[#880E4F] via-[#560631] to-[#31021A]',
      accentText: 'text-[#F48FB1]',
    }
  }

  if (card.title === 'Roasted Makhana') {
    return {
      bgGradient: 'from-[#4A148C] via-[#2E0B59] to-[#1A0536]',
      accentText: 'text-[#CE93D8]',
    }
  }

  return {
    bgGradient: 'from-[#1A237E] via-[#0F144D] to-[#070A2D]',
    accentText: 'text-[#9FA8DA]',
  }
}

export default function OfferBanner({ cards }: OfferBannerProps) {
  if (cards.length === 0) return null

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => {
            const style = getOfferCardStyle(card)

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.bgGradient} p-8 lg:p-10 flex flex-col justify-between min-h-[280px] sm:min-h-[320px] group shadow-card hover:shadow-card-hover transition-all duration-300`}
              >
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id={`card-pattern-${idx}`} width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 0 20 Q 10 0 20 20 T 40 20" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill={`url(#card-pattern-${idx})`} />
                  </svg>
                </div>

                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

                <div className="relative z-10 max-w-[60%] sm:max-w-[55%] space-y-3">
                  {card.eyebrow_text && (
                    <span className={`text-xs font-bold uppercase tracking-widest ${style.accentText}`}>
                      {card.eyebrow_text}
                    </span>
                  )}

                  <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                    {card.title}
                  </h3>

                  <p className="text-white/90 font-semibold text-base sm:text-lg">{card.subtitle}</p>

                  {card.description && (
                    <p className="text-white/70 text-xs leading-relaxed hidden sm:block">{card.description}</p>
                  )}
                </div>

                <div className="relative z-10 pt-6">
                  <Link
                    href={card.link_url || '/products'}
                    className="inline-flex items-center gap-2 text-white font-bold text-sm group-hover:text-brand-gold transition-colors hover:gap-3"
                  >
                    <span className="border-b-2 border-white group-hover:border-brand-gold pb-0.5">
                      Shop Now
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 z-10 w-[140px] sm:w-[190px] h-[160px] sm:h-[210px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500 bg-black/20 backdrop-blur-sm">
                  <Image src={card.image_url} alt={card.title} fill className="object-cover" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 text-[9px] font-bold text-white border border-white/20">
                    100% Natural
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
