'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Loader2, CheckCircle, Sprout } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { subscribeToNewsletter } from '@/lib/data/newsletter'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      await subscribeToNewsletter(supabase, email)
      setSuccess(true)
      setEmail('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-12 bg-white select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Horizontal Promotion Box */}
        <div className="bg-[#FFF8F0] border border-[#EFE7DD] rounded-[32px] p-6 sm:p-10 lg:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Decorative leaves */}
          <div className="absolute left-4 bottom-4 opacity-15 pointer-events-none select-none hidden lg:block">
            <Sprout className="w-16 h-16 text-[#B91C1C]" />
          </div>
          <div className="absolute right-4 top-4 opacity-15 pointer-events-none select-none hidden lg:block rotate-180">
            <Sprout className="w-16 h-16 text-[#B91C1C]" />
          </div>

          {/* Left Content Column */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 z-10 text-center sm:text-left max-w-xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-[#EFE7DD] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-[#B91C1C]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-lg sm:text-xl font-black text-[#2B1B17] uppercase tracking-wider">
                Stay Updated
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4D4A] font-semibold leading-relaxed">
                Subscribe to get special offers, new arrivals and healthy snack ideas.
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="w-full lg:w-auto min-w-[280px] sm:min-w-[400px] z-10">
            {success ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-2 bg-[#E6F4EA] border border-[#A3CFBB] text-[#137333] rounded-full py-3 px-6 text-xs sm:text-sm font-bold"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>You&apos;re subscribed! Welcome to the family.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 p-1.5 bg-white rounded-2xl sm:rounded-full border border-[#EFE7DD] shadow-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 sm:px-6 py-3 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-xs sm:text-sm font-semibold"
                  id="newsletter-email"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#7F1D1D] hover:bg-[#B91C1C] text-white font-extrabold text-xs tracking-wider uppercase px-6 sm:px-8 py-3.5 rounded-xl sm:rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Subscribe</span>
                  )}
                </button>
              </form>
            )}

            {error && (
              <p className="mt-2 text-[#B91C1C] text-xs font-semibold text-center lg:text-left pl-4">{error}</p>
            )}
          </div>

        </div>

      </div>
    </section>
  )
}

