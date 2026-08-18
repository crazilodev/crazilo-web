import React from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#B91C1C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to Crazilo. By accessing or using our website, products, and services, you agree to comply with the terms and conditions set forth below.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-8 text-gray-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">1. General Conditions</h2>
            <p>
              Crazilo reserves the right to refuse service, terminate accounts, or cancel orders at our sole discretion, including without limitation if customer conduct violates applicable laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">2. Product Pricing & Availability</h2>
            <p>
              Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue any product variant. All prices are inclusive of applicable taxes in India (GST).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">3. Intellectual Property</h2>
            <p>
              All content on this site, including logos, images, typography, copy, and product designs are the exclusive property of Crazilo and protected by trademark and copyright laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
