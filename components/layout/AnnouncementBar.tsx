import Link from 'next/link'
import { Truck, Leaf, Shield, Heart, MapPin, Compass } from 'lucide-react'
import type { Announcement, HomeHighlight, SiteSettings } from '@/types'

interface AnnouncementBarProps {
  announcements: Announcement[]
  highlights: HomeHighlight[]
  siteSettings: SiteSettings | null
}

export default function AnnouncementBar({
  announcements,
  highlights,
  siteSettings,
}: AnnouncementBarProps) {
  const shippingThreshold = siteSettings?.free_shipping_threshold ?? 699
  const storeLocatorHref = siteSettings?.store_locator_url || '/store-locator'

  return (
    <div className="bg-[#7F1D1D] text-white text-[11px] py-2 border-b border-white/5 z-50 relative select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left Side: Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-white/90">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
            <span>Free shipping on orders above ₹{shippingThreshold}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
            <span>100% Natural Ingredients</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
            <span>No Preservatives</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
            <span>Made in India</span>
          </div>
        </div>

        {/* Right Side: Quick Links */}
        <div className="flex items-center gap-4 text-white/80">
          <Link href="/orders" className="hover:text-white transition-colors flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-white/70" />
            <span>Track Order</span>
          </Link>
          <span className="opacity-20">|</span>
          <Link href={storeLocatorHref} className="hover:text-white transition-colors flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-white/70" />
            <span>Store Locator</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

