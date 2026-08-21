import React from 'react'
import Link from 'next/link'
import { HelpCircle, ArrowLeft, ChevronDown } from 'lucide-react'

export default function FAQsPage() {
  const faqs = [
    {
      q: 'Are Crazilo products 100% natural and organic?',
      a: 'Yes! All our dry fruits, nuts, and spices are ethically sourced from premium certified farms without artificial additives, chemical preservatives, or synthetic food colors.'
    },
    {
      q: 'How long does shipping take?',
      a: 'Metro cities typically receive orders within 2 to 4 business days. Other regions across India take between 4 to 7 business days.'
    },
    {
      q: 'How can I track my order status?',
      a: 'You can track your live shipment anytime by visiting our Track Order page with your Order ID or phone number.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, MasterCard, RuPay), Net Banking, and Cash on Delivery (COD).'
    },
    {
      q: 'What is your return and refund policy?',
      a: 'We accept return requests within 7 days of delivery for damaged, defective, or incorrect items. Please refer to our Returns Policy page for complete details.'
    }
  ]

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
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Find quick answers to common questions about our dry fruits, shipping, packaging, and order tracking.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-2">
              <h3 className="text-base font-extrabold text-gray-900 font-heading flex items-center justify-between">
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
