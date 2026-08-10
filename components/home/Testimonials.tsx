'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

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
    text: "I was skeptical at first but after one order I'm hooked! The makhana is so crispy and fresh. Great prices too. Highly recommend Crazilo to everyone.",
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

// 2 identical copies — shift -50% lands on copy 2 which looks like copy 1
const loopedTestimonials = [...testimonials, ...testimonials]

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false)

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

        {/* Marquee container */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          }}
        >
          <div className={`marquee-inner${isPaused ? ' paused' : ''}`}>
            {loopedTestimonials.map((review, i) => (
              <div
                key={i}
                style={{
                  width: 'var(--card-w)',
                  flexShrink: 0,
                  marginRight: 'var(--card-gap)',
                }}
                className="rounded-3xl p-5 sm:p-6 border bg-white/10 border-white/10 hover:bg-white/[0.18] hover:border-brand-gold/40 transition-all duration-300 cursor-default"
              >
                <TestimonialCard review={review} />
              </div>
            ))}
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-white/30 mt-6 tracking-wide select-none">
          {isPaused ? '⏸ Paused — move mouse away to resume' : 'Hover a card to pause'}
        </p>
      </div>
    </section>
  )
}

function TestimonialCard({ review }: { review: typeof testimonials[0] }) {
  return (
    <div className="flex flex-col h-full">
      <Quote className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4 text-brand-gold/60" />
      <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1 text-gray-300">
        &ldquo;{review.text}&rdquo;
      </p>
      <div>
        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-2.5 sm:mb-3 text-brand-gold/70">
          {review.product}
        </p>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 bg-brand-red/80">
            {review.avatar}
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm text-white">{review.name}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{review.location}</p>
          </div>
          <div className="ml-auto flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  i < review.rating
                    ? 'fill-brand-gold text-brand-gold'
                    : 'fill-gray-600 text-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
