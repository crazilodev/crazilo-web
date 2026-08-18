import React from 'react'
import Link from 'next/link'
import { RotateCcw, ShieldCheck, Truck, Clock, HelpCircle, ArrowLeft } from 'lucide-react'

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#B91C1C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Returns & Refund Policy
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            At Crazilo, customer satisfaction and product quality are our highest priorities. Learn about our simple, hassle-free return and refund guidelines.
          </p>
        </div>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">7-Day Return Window</h4>
              <p className="text-xs text-gray-500 mt-1">Request returns within 7 days of delivery for eligible items.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Quality Guarantee</h4>
              <p className="text-xs text-gray-500 mt-1">Full refund or replacement for damaged or incorrect packages.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Easy Pickup</h4>
              <p className="text-xs text-gray-500 mt-1">Doorstep return pickup arranged seamlessly by our logistics team.</p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-8 text-gray-700 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">1. Eligibility for Returns</h2>
            <p>
              Due to the perishable nature of food products, dry fruits, and spices, returns are accepted strictly under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Item received is damaged during transit, tampered, or spoiled.</li>
              <li>Incorrect product or variant delivered.</li>
              <li>Product delivered past its specified shelf-life or expiry date.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">2. Return Process</h2>
            <p>
              To initiate a return or replacement, please notify our support team within <strong>7 days</strong> of delivery:
            </p>
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#B91C1C]">Support Email: hello@crazilo.com</p>
              <p className="text-xs font-bold text-[#B91C1C]">Support Phone / WhatsApp: +91 98765 43210</p>
              <p className="text-xs text-gray-600">
                Please attach clear photos or unboxing video of the affected package along with your Order ID.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">3. Refund Processing</h2>
            <p>
              Once your return request is approved:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Prepaid orders will be refunded directly to your original payment method within 5–7 business days.</li>
              <li>COD orders will be refunded via UPI transfer or direct bank transfer upon verification.</li>
              <li>You may also choose instant Crazilo store credits for immediate store purchases.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">4. Cancellation Policy</h2>
            <p>
              Orders can be canceled free of charge before they are dispatched. Once dispatched, cancellation is subject to courier handling fees.
            </p>
          </section>
        </div>

        {/* Support Help Banner */}
        <div className="bg-[#5C0A0A] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-extrabold text-base font-heading">Need help with an order?</h3>
            <p className="text-xs text-white/80">Our support team is available Mon–Sat, 9am–6pm IST.</p>
          </div>
          <Link
            href="mailto:hello@crazilo.com"
            className="px-6 py-3 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-colors flex-shrink-0"
          >
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  )
}
