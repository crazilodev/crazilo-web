'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
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
    <section className="py-20 bg-gradient-to-br from-[#120202] via-[#7F1D1D] to-[#0F0F0F] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-brand-gold" />
          </div>
          <h2 className="font-heading text-4xl font-extrabold text-white mb-3 tracking-tight">
            Stay in the Loop
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg mx-auto">
            Subscribe for exclusive member offers, new harvest arrivals, and healthy recipes. No spam, ever.
          </p>

          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 bg-white/15 backdrop-blur-md rounded-full p-4 border border-white/30 max-w-md mx-auto"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <p className="text-white font-bold text-sm">
                You&apos;re subscribed! Welcome to the Crazilo family.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-full shadow-2xl border border-gray-100 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="flex-1 px-6 py-3.5 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm font-medium"
                id="newsletter-email"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-brand-gold hover:bg-amber-600 text-white font-bold text-sm rounded-full transition-all duration-200 flex items-center justify-center gap-2 flex-shrink-0 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </form>
          )}

          {error && (
            <p className="mt-3 text-red-300 text-sm font-medium">{error}</p>
          )}

          <p className="text-white/50 text-xs mt-5">
            By subscribing, you agree to receive promotional emails. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
