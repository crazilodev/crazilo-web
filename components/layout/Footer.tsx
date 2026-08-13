'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Phone, Mail, MapPin, Instagram, Facebook, Youtube, Heart, MessageSquare
} from 'lucide-react'
import type { Category, SiteSettings } from '@/types'

interface FooterProps {
  categories: Category[]
  siteSettings: SiteSettings | null
}

export default function Footer({ categories, siteSettings }: FooterProps) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const storeLocatorHref = siteSettings?.store_locator_url || '/store-locator'

  const socialLinks = [
    { icon: Facebook, href: siteSettings?.facebook_url || '#', label: 'Facebook' },
    { icon: Instagram, href: siteSettings?.instagram_url || '#', label: 'Instagram' },
    { icon: MessageSquare, href: '#', label: 'WhatsApp' }, // WhatsApp if supported
    { icon: Youtube, href: siteSettings?.youtube_url || '#', label: 'YouTube' },
  ]

  return (
    <footer className="bg-[#5C0A0A] text-white select-none border-t border-white/5 pt-16 pb-8">
      {/* 5-Column Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 text-left">
          
          {/* Column 1: Logo & Branding (span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <Image
              src="/logo/crazilo-logo.png"
              alt="Crazilo"
              width={160}
              height={56}
              className="h-12 w-auto object-contain bg-white/90 p-2 rounded-xl"
            />
            <p className="text-xs text-white/80 leading-relaxed max-w-xs">
              Wholesome snacks made with love, inspired by nature.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-[#5C0A0A] flex items-center justify-center text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: SHOP (span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-[#D97706] uppercase tracking-widest mb-4">
              Shop
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-white/80">
              <li>
                <Link href="/products" className="block py-1.5 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/category/nuts" className="block py-1.5 hover:text-white transition-colors">
                  Nuts & Seeds
                </Link>
              </li>
              <li>
                <Link href="/category/dry-fruits" className="block py-1.5 hover:text-white transition-colors">
                  Dry Fruits
                </Link>
              </li>
              <li>
                <Link href="/category/makhana" className="block py-1.5 hover:text-white transition-colors">
                  Makhana
                </Link>
              </li>
              <li>
                <Link href="/category/trail-mixes" className="block py-1.5 hover:text-white transition-colors">
                  Trail Mix
                </Link>
              </li>
              <li>
                <Link href="/category/combos" className="block py-1.5 hover:text-white transition-colors">
                  Combos
                </Link>
              </li>
              <li>
                <Link href="/category/gift-boxes" className="block py-1.5 hover:text-white transition-colors">
                  Gift Packs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: COLLECTIONS (span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-[#D97706] uppercase tracking-widest mb-4">
              Collections
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-white/80">
              <li>
                <Link href="/products?sort=popular" className="block py-1.5 hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/products?filter=new" className="block py-1.5 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products" className="block py-1.5 hover:text-white transition-colors">
                  Healthy Picks
                </Link>
              </li>
              <li>
                <Link href="/category/nuts" className="block py-1.5 hover:text-white transition-colors">
                  Premium Nuts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: HELP (span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black text-[#D97706] uppercase tracking-widest mb-4">
              Help
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-white/80">
              <li>
                <Link href="/orders" className="block py-1.5 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href={siteSettings?.returns_policy_url || '#'} className="block py-1.5 hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href={siteSettings?.returns_policy_url || '#'} className="block py-1.5 hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href={siteSettings?.faqs_url || '/faqs'} className="block py-1.5 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#contact" className="block py-1.5 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: GET IN TOUCH & STORE LOCATOR (span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black text-[#D97706] uppercase tracking-widest mb-4">
              Get In Touch
            </h4>
            <ul className="space-y-3 text-xs font-semibold text-white/80">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                <a href={`mailto:${siteSettings?.support_email || 'hello@crazilo.com'}`} className="hover:text-white transition-colors py-1">
                  {siteSettings?.support_email || 'hello@crazilo.com'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                <a href={`tel:${siteSettings?.support_phone || '+919876543210'}`} className="hover:text-white transition-colors py-1">
                  {siteSettings?.support_phone || '+91 98765 43210'}
                </a>
              </li>
            </ul>

            {/* Store Locator Search Field */}
            <div className="pt-2">
              <div className="relative w-full max-w-[280px] sm:max-w-[200px] cursor-pointer" onClick={() => router.push(storeLocatorHref)}>
                <input
                  type="text"
                  placeholder="Store Locator"
                  readOnly
                  className="w-full bg-white text-gray-800 text-xs font-bold placeholder:text-gray-500 rounded-lg py-2.5 pl-4 pr-10 focus:outline-none cursor-pointer shadow-inner"
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B91C1C]" />
              </div>
            </div>

            {/* Payment Icons */}
            <div className="flex items-center gap-1.5 pt-2">
              <div className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#1A1F71] border border-white flex items-center justify-center h-6 w-11 shadow-sm select-none">VISA</div>
              <div className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#F79E1B] border border-white flex items-center justify-center h-6 w-11 shadow-sm select-none">MC</div>
              <div className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#097939] border border-white flex items-center justify-center h-6 w-11 shadow-sm select-none">UPI</div>
              <div className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#005B9E] border border-white flex items-center justify-center h-6 w-11 shadow-sm select-none">RUPAY</div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer Credits */}
      <div className="border-t border-white/10 pt-6 mt-6 bg-black/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/70">
          <p>© {currentYear} Crazilo. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <Link href={siteSettings?.privacy_policy_url || '#'} className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href={siteSettings?.terms_url || '#'} className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

          <p className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
            <span>in India</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

