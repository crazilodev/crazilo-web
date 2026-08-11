'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import type { Testimonial } from '@/types'

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [current, setCurrent] = useState(0)

  if (testimonials.length === 0) return null

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  const visible = [
    testimonials[current],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ]

  return (
    <section className="py-20 bg-brand-dark overflow-hidden">
      <style>{`
        :root {
          --card-w: 280px;
          --card-gap: 16px;
          --copy-w: calc(5 * (var(--card-w) + var(--card-gap)));
        }
        @media (min-width: 640px) {
          :root {
            --card-w: 310px;
            --card-gap: 18px;
          }
        }
        @media (min-width: 1024px) {
          :root {
            --card-w: 360px;
            --card-gap: 20px;
          }
        }
        @keyframes marquee-seamless {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(calc(-1 * var(--copy-w))); }
        }
        .marquee-inner {
          display: flex;
          width: max-content;
          animation: marquee-seamless 20s linear infinite;
          will-change: transform;
        }
        .marquee-inner.paused {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-brand-gold text-sm font-bold uppercase tracking-widest">
            Customer Love
          </span>
          <h2 className="section-heading mt-2 text-white">What Our Customers Say</h2>
          <div className="divider-gold w-20 mx-auto mt-3" />
        </motion.div>

        <div className="lg:hidden">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-6"
          >
            <TestimonialCard review={testimonials[current]} />
          </motion.div>
        </div>

        <div className="hidden lg:grid grid-cols-3 gap-6">
          {visible.map((review, i) => (
            <motion.div
              key={`${review.id}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl p-6 border transition-all duration-300 ${
                i === 0
                  ? 'bg-white border-white/20 scale-105 shadow-2xl'
                  : 'bg-white/10 border-white/10'
              }`}
            >
              <TestimonialCard review={review} dark={i !== 0} />
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-brand-red hover:text-brand-red transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'bg-brand-red scale-125'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-brand-red hover:text-brand-red transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ review, dark = false }: { review: Testimonial; dark?: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <Quote className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4 text-brand-gold/60" />
      <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1 text-gray-300">
        &ldquo;{review.text}&rdquo;
      </p>
      <div>
        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-brand-gold/60' : 'text-brand-gold'}`}>
          {review.product_name}
        </p>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${dark ? 'bg-brand-red/80' : 'bg-brand-red'}`}>
            {review.avatar_initial}
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-white">{review.name}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{review.location}</p>
          </div>
          <div className="ml-auto flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < review.rating ? 'fill-brand-gold text-brand-gold' : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
