import React from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, ArrowLeft } from 'lucide-react'

export default function StoreLocatorPage() {
  const stores = [
    {
      name: 'Crazilo Flagship Experience Store',
      city: 'Mumbai',
      address: 'Shop No. 12, Ground Floor, Link Road, Bandra West, Mumbai, Maharashtra 400050',
      phone: '+91 98765 43210',
      hours: 'Mon–Sun: 10:00 AM – 9:00 PM',
    },
    {
      name: 'Crazilo Gourmet & Spices Outlets',
      city: 'Delhi NCR',
      address: 'Plot 45, Sector 18 Market, Cyber City Zone, Gurugram, Haryana 122002',
      phone: '+91 98765 43211',
      hours: 'Mon–Sun: 10:00 AM – 9:00 PM',
    },
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
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Store Locator
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Visit our physical experience stores to sample fresh dry fruits, premium nuts, and organic spice blends.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stores.map((st, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#B91C1C]">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-full">{st.city}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 font-heading">{st.name}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{st.address}</p>
              <div className="pt-2 border-t border-gray-50 space-y-1.5 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>{st.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>{st.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
