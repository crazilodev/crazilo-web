'use client'

import { motion } from 'framer-motion'
import { Leaf, Award, Truck, RefreshCw, Shield, Star } from 'lucide-react'
import type { HomeHighlight } from '@/types'

interface WhyUsProps {
  highlights: HomeHighlight[]
}

function getHighlightIcon(iconKey: string) {
  if (iconKey.includes('natural')) return Leaf
  if (iconKey.includes('premium')) return Award
  if (iconKey.includes('delivery')) return Truck
  if (iconKey.includes('returns')) return RefreshCw
  if (iconKey.includes('safe')) return Shield
  return Star
}

function getWhyCardStyle(title: string) {
  if (title === '100% Natural') {
    return {
      bg: 'bg-emerald-50',
      color: 'from-emerald-500 to-teal-600',
    }
  }
  if (title === 'Premium Quality') {
    return {
      bg: 'bg-red-50',
      color: 'from-brand-red to-brand-red-dark',
    }
  }
  if (title === 'Fast Delivery') {
    return {
      bg: 'bg-blue-50',
      color: 'from-blue-500 to-indigo-600',
    }
  }
  if (title === 'Safe & Sealed') {
    return {
      bg: 'bg-purple-50',
      color: 'from-purple-500 to-purple-700',
    }
  }
  if (title === 'Easy Returns') {
    return {
      bg: 'bg-amber-50',
      color: 'from-brand-gold to-amber-600',
    }
  }
  return {
    bg: 'bg-rose-50',
    color: 'from-rose-500 to-pink-600',
  }
}

export default function WhyUs({ highlights }: WhyUsProps) {
  const cards = highlights
    .filter((highlight) => highlight.icon_key.startsWith('why_'))
    .sort((a, b) => a.display_order - b.display_order)

  if (cards.length === 0) return null

  return (
    <section className="py-20 bg-cream-pattern">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-brand-gold text-sm font-bold uppercase tracking-widest">
            Why Choose Crazilo
          </span>
          <h2 className="section-heading mt-2 mb-3">The Crazilo Difference</h2>
          <div className="divider-gold w-20 mx-auto" />
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            We&apos;re not just a store - we&apos;re your partner in healthy snacking. Here&apos;s what sets us apart.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((feature, index) => {
            const Icon = getHighlightIcon(feature.icon_key)
            const style = getWhyCardStyle(feature.title)
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${style.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
