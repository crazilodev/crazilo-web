import React from 'react'
import Link from 'next/link'
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your privacy matters to us. Learn how Crazilo collects, protects, and uses your personal information when using our website and services.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-8 text-gray-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">1. Information We Collect</h2>
            <p>
              We collect information to fulfill your orders, provide customer support, and improve your shopping experience. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Contact details: Name, email address, mobile number, shipping & billing address.</li>
              <li>Order details: Purchased items, order history, and payment status.</li>
              <li>Technical data: IP address, browser type, and device information for security & analytics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">2. How We Use Your Data</h2>
            <p>
              Your data is used strictly for operational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Processing and delivering your orders safely.</li>
              <li>Sending order updates, shipping details, and digital invoices.</li>
              <li>Customer service notifications and promotional updates (only if opted in).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">3. Data Security & Protection</h2>
            <p>
              We use SSL encryption and secure Supabase database infrastructure to ensure your data remains protected against unauthorized access. We do NOT store full credit card numbers or sensitive banking credentials on our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-gray-900 font-heading">4. Contact Privacy Officer</h2>
            <p>
              For privacy queries or to request deletion of your account data, write to us at <strong>privacy@crazilo.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
