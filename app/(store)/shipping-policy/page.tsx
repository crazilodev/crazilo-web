import React from 'react'
import Link from 'next/link'
import { Truck, Clock, ShieldCheck, MapPin, ArrowLeft } from 'lucide-react'

export default function ShippingPolicyPage() {
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
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Shipping & Delivery Policy
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            We take pride in packaging fresh dry fruits, premium nuts, and organic spices to deliver them right to your doorstep safely and swiftly across India.
          </p>
        </div>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Free Shipping</h4>
              <p className="text-xs text-gray-500 mt-1">Enjoy free delivery on all orders above ₹599 across India.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Fast Dispatch</h4>
              <p className="text-xs text-gray-500 mt-1">Orders dispatched within 24–48 working hours.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Tamper-Proof Pack</h4>
              <p className="text-xs text-gray-500 mt-1">Sealed vacuum nitrogen-flushed packaging for maximum freshness.</p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-8 text-gray-700 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">1. Shipping Charges & Free Delivery Threshold</h2>
            <p>
              We strive to keep shipping transparent and affordable:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li><strong>Orders Above ₹599:</strong> Standard Shipping is completely <strong>FREE</strong>.</li>
              <li><strong>Orders Below ₹599:</strong> A nominal standard shipping fee of ₹49 is applied at checkout.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">2. Delivery Timeframes</h2>
            <p>
              Estimated delivery times depend on your location:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Metro Cities</h4>
                <p className="text-xs text-gray-600">2 to 4 business days</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Rest of India & Tier 2/3</h4>
                <p className="text-xs text-gray-600">4 to 7 business days</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">3. Order Tracking</h2>
            <p>
              Once your package is shipped, you will receive an SMS and email notification containing your tracking URL and AWB consignment number. You can also track your live shipment anytime on our <Link href="/orders" className="text-[#B91C1C] font-bold hover:underline">Track Order page</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">4. Address Changes & Support</h2>
            <p>
              Need to update your delivery address? Please contact us immediately within 2 hours of placing your order at <strong>hello@crazilo.com</strong> or call <strong>+91 98765 43210</strong>.
            </p>
          </section>
        </div>

        {/* Support Help Banner */}
        <div className="bg-[#5C0A0A] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-extrabold text-base font-heading">Questions about shipment?</h3>
            <p className="text-xs text-white/80">Track your order online or contact support for live assistance.</p>
          </div>
          <Link
            href="/orders"
            className="px-6 py-3 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold transition-colors flex-shrink-0"
          >
            Track My Order
          </Link>
        </div>

      </div>
    </div>
  )
}
