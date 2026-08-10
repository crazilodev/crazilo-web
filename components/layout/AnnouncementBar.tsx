'use client'

import Link from 'next/link'
import { Truck, Leaf, Award, Package, MapPin, HelpCircle, Compass } from 'lucide-react'

export default function AnnouncementBar() {
  return (
    <div className="bg-[#8B0000] text-white text-xs font-semibold py-2 px-4 border-b border-white/10 z-50 relative">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Left: Free Shipping */}
        <div className="flex items-center gap-2 text-white/90">
          <Truck className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
          <span>Free shipping on orders above <strong className="text-white">₹999</strong></span>
        </div>

        {/* Center Features */}
        <div className="hidden md:flex items-center gap-6 text-white/90">
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Natural</span>
          </div>
          <span className="opacity-30">•</span>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-brand-gold" />
            <span>Premium Quality</span>
          </div>
          <span className="opacity-30">•</span>
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-amber-300" />
            <span>Freshly Packed</span>
          </div>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4 text-white/80 text-[11px]">
          <Link href="/orders" className="hover:text-white transition-colors flex items-center gap-1">
            <Compass className="w-3 h-3 text-white/70" />
            <span>Track Order</span>
          </Link>
          <span className="opacity-30">|</span>
          <Link href="/store-locator" className="hover:text-white transition-colors flex items-center gap-1">
            <MapPin className="w-3 h-3 text-white/70" />
            <span>Store Locator</span>
          </Link>
          <span className="opacity-30">|</span>
          <Link href="/faqs" className="hover:text-white transition-colors flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-white/70" />
            <span>FAQs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
