import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  Sparkles, Leaf, ShieldCheck, Heart, Award,
  ChevronRight, ArrowRight, Sun, CheckCircle2,
  Users, Sprout, Globe
} from 'lucide-react'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Our Story | Crazilo — Pure, Wholesome & Honest',
  description:
    'Discover the journey of Crazilo: from small-farm orchards in Kashmir and Kerala to your kitchen. Learn about our mission, vision, and uncompromising commitment to preservative-free dry fruits and spices.',
}

export default function OurStoryPage() {
  

  const milestones = [
    {
      step: '01',
      title: 'Handpicked Harvest',
      desc: 'Only mature, sun-ripened crop is gently plucked from traditional heritage trees at peak seasonal bounty.',
    },
    {
      step: '02',
      title: 'Natural Sun Curing',
      desc: 'Traditional solar drying preserves delicate enzymes, healthy essential fats, and unadulterated crunch.',
    },
    {
      step: '03',
      title: 'Triple-Tier Grading',
      desc: 'Rigorous manual inspection separates premium jumbo grades, removing broken or sub-standard pieces.',
    },
    {
      step: '04',
      title: 'Hygienic Direct Delivery',
      desc: 'Packaged in clean-room certified facilities and dispatched promptly straight to your doorstep across India.',
    },
  ]

  return (
    <div className="min-h-screen bg-white select-none">
   
      {/* Genesis / The Journey Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Collage */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-amber-50 border border-gray-200">
                <Image
                  src="/images/hero-cashews.png"
                  alt="Crazilo Harvest Cashews"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-150 flex items-center gap-4 max-w-[240px]">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-gray-900 font-heading">20,000+</p>
                  <p className="text-[11px] text-gray-500 font-semibold leading-tight">Families Nourished Daily</p>
                </div>
              </div>
            </div>

            {/* Story Prose */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block px-3 py-1 rounded-md bg-red-50 text-[#B91C1C] text-xs font-black uppercase tracking-wider">
                The Genesis
              </div>

              <h2 className="font-heading text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Born From A Simple Question: Why Is Pure Food So Difficult To Find?
              </h2>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                A few years ago, we walked through ordinary supermarkets looking for healthy snacks for our families.
                Instead of real, wholesome nuts, we found sulfur-bleached cashews, artificially colored raisins, and
                stale seeds coated in sodium and hydrogenated fats.
              </p>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                We knew India deserved better. Our subcontinent is home to some of the richest natural harvests on Earth —
                fragrant whole spices from Wayanad, organic Fox Nuts from Mithila, sweet figs from the valleys, and crisp
                almonds from Kashmir.
              </p>

              <p className="text-sm sm:text-base text-gray-700 font-semibold leading-relaxed">
                Crazilo was founded with one clear commitment: <span className="text-[#B91C1C]">Zero shortcuts. Zero chemical treatments.</span> Only
                authentic, nutrition-packed gifts from the soil, delivered with pride and complete transparency.
              </p>

            
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="bg-[#FFF8F0]/50 py-16 sm:py-24 border-y border-gray-150">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="font-heading text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Our Guiding Compass
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3">
              Every package of Crazilo dry fruits and spices is guided by our dual commitment to health and community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-150 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center mb-6">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-gray-900 mb-3">
                Our Mission
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                To make nutrient-dense, sustainably cultivated, and authentic dry fruits, nuts, and organic spices
                accessible to every health-conscious home in India — delivered with unmatched freshness, fair prices,
                and complete supply-chain integrity.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-150 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D97706] flex items-center justify-center mb-6">
                <Sun className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-gray-900 mb-3">
                Our Vision
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                To become India&apos;s most cherished natural food and wellness brand, inspiring millions to embrace
                mindful snacking and traditional whole-food nourishment while championing the livelihoods of Indian
                family farmers.
              </p>
            </div>
          </div>
        </div>
      </section>

   
     

      {/* Farm to Table Process Timeline */}
      <section className="bg-gray-50 py-16 sm:py-24 border-t border-gray-150">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="font-heading text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              The Farm-to-Kitchen Journey
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              How our handpicked harvest travels safely from lush orchards directly to your home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs relative space-y-3">
                <span className="text-4xl font-black text-amber-500/20 font-heading block">
                  {m.step}
                </span>
                <h4 className="font-heading font-black text-base text-gray-900">
                  {m.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-[#5C0A0A] text-white py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-3.5">
          <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Taste The Difference Pure Nature Makes
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto leading-relaxed">
            Ready to upgrade your daily snacks and festive gifts? Explore our fresh collection of premium cashews,
            mamra almonds, organic walnuts, and authentic spices.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link href="/products">
              <Button variant="gold" size="sm" className="rounded-full font-bold px-6 py-2.5 text-xs shadow-md">
                Explore The Collection <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="sm" className="rounded-full font-bold px-6 py-2.5 text-xs border-white/30 text-white hover:bg-white hover:text-gray-900">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
