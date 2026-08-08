'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The quality of almonds and cashews from Crazilo is absolutely amazing! Fresh, crunchy and so tasty. My family has made this our go-to brand for all dry fruits.',
    product: 'Premium Almonds',
    avatar: 'P',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    location: 'Delhi',
    rating: 5,
    text: 'Ordered the spice combo and it arrived fresh and beautifully packaged. The smell alone tells you these are genuine quality spices. Will order again!',
    product: 'Spice Combo Pack',
    avatar: 'R',
  },
  {
    id: 3,
    name: 'Anita Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'I was skeptical at first but after one order I\'m hooked! The makhana is so crispy and fresh. Great prices too. Highly recommend Crazilo to everyone.',
    product: 'Premium Makhana',
    avatar: 'A',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    location: 'Bangalore',
    rating: 5,
    text: 'Fast delivery and amazing packaging. The gift box I ordered for Diwali was a huge hit with everyone. Crazilo has become my default gifting choice!',
    product: 'Premium Gift Box',
    avatar: 'V',
  },
  {
    id: 5,
    name: 'Meera Krishnan',
    location: 'Chennai',
    rating: 4,
    text: 'Love the variety and quality. The trail mix is perfect for my morning snack. Customer service was very responsive when I had a query. Great brand!',
    product: 'Trail Mix Combo',
    avatar: 'M',
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  const visible = [
    testimonials[current],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ]

  return (
    <section className="py-20 bg-brand-dark overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Mobile: Single card */}
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

        {/* Desktop: Three cards */}
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

        {/* Navigation */}
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
                className={`transition-all rounded-full ${
                  i === current ? 'w-6 h-2.5 bg-brand-gold' : 'w-2.5 h-2.5 bg-white/30'
                }`}
                aria-label={`Go to ${i + 1}`}
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

function TestimonialCard({ review, dark = false }: { review: typeof testimonials[0]; dark?: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <Quote className={`w-8 h-8 mb-4 ${dark ? 'text-brand-gold/40' : 'text-brand-gold'}`} />
      <p className={`text-sm leading-relaxed mb-6 flex-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
        &ldquo;{review.text}&rdquo;
      </p>
      <div>
        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-brand-gold/60' : 'text-brand-gold'}`}>
          {review.product}
        </p>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${dark ? 'bg-brand-red/80' : 'bg-brand-red'}`}>
            {review.avatar}
          </div>
          <div>
            <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{review.name}</p>
            <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{review.location}</p>
          </div>
          <div className="ml-auto flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-brand-gold text-brand-gold' : 'fill-gray-200 text-gray-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
