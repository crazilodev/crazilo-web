import Link from 'next/link'
import { Truck, Leaf, Award, Package, MapPin, HelpCircle, Compass } from 'lucide-react'
import type { Announcement, HomeHighlight, SiteSettings } from '@/types'

interface AnnouncementBarProps {
  announcements: Announcement[]
  highlights: HomeHighlight[]
  siteSettings: SiteSettings | null
}

function getHighlightIcon(iconKey: string) {
  if (iconKey.includes('natural')) return Leaf
  if (iconKey.includes('premium')) return Award
  if (iconKey.includes('packed')) return Package
  return Truck
}

export default function AnnouncementBar({
  announcements,
  highlights,
  siteSettings,
}: AnnouncementBarProps) {
  const announcement = announcements[0]
  const heroHighlights = highlights
    .filter((highlight) => highlight.icon_key.startsWith('hero_'))
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 3)

  const shippingThreshold = siteSettings?.free_shipping_threshold ?? 599
  const storeLocatorHref = siteSettings?.store_locator_url || '/store-locator'
  const faqsHref = siteSettings?.faqs_url || '/faqs'

  return (
    <div className="bg-[#8B0000] text-white text-xs font-semibold py-2 px-4 border-b border-white/10 z-50 relative">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-white/90">
          <Truck className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
          <span>
            {announcement?.text || (
              <>
                Free shipping on orders above <strong className="text-white">₹{shippingThreshold}</strong>
              </>
            )}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-white/90">
          {heroHighlights.map((highlight, index) => {
            const Icon = getHighlightIcon(highlight.icon_key)
            return (
              <div key={highlight.id} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-brand-gold" />
                <span>{highlight.title}</span>
                {index < heroHighlights.length - 1 && <span className="opacity-30">•</span>}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 text-white/80 text-[11px]">
          <Link href="/orders" className="hover:text-white transition-colors flex items-center gap-1">
            <Compass className="w-3 h-3 text-white/70" />
            <span>Track Order</span>
          </Link>
          <span className="opacity-30">|</span>
          <Link href={storeLocatorHref} className="hover:text-white transition-colors flex items-center gap-1">
            <MapPin className="w-3 h-3 text-white/70" />
            <span>Store Locator</span>
          </Link>
          <span className="opacity-30">|</span>
          <Link href={faqsHref} className="hover:text-white transition-colors flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-white/70" />
            <span>FAQs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
