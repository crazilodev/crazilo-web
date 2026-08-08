'use client'

import { motion } from 'framer-motion'
import { Leaf, Award, Truck, RefreshCw, Shield, Star } from 'lucide-react'

const features = [
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'No artificial colors, flavors, or preservatives. Pure nature in every bite.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Carefully sourced from the best farms and orchards across India.',
    color: 'from-brand-red to-brand-red-dark',
    bg: 'bg-red-50',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Free shipping above ₹599. Same-day dispatch on orders before 2 PM.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Safe & Sealed',
    description: 'Hygienic vacuum-sealed packaging to preserve freshness and nutrition.',
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: 'Not happy? Return within 7 days for a full refund, no questions asked.',
    color: 'from-brand-gold to-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Star,
    title: 'Customer First',
    description: 'Rated 4.9★ by over 50,000 happy customers across India.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
  },
]

export default function WhyUs() {
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
            We&apos;re not just a store — we&apos;re your partner in healthy snacking. Here&apos;s what sets us apart.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
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
