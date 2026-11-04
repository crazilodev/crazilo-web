'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Phone, Mail, Instagram, Facebook, Youtube, MessageSquare, ChevronDown
} from 'lucide-react'
import type { Category, SiteSettings } from '@/types'

interface FooterProps {
  categories: Category[]
  siteSettings: SiteSettings | null
}

export default function Footer({ categories, siteSettings }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const [openSection, setOpenSection] = useState<string | null>(null)
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  // Generate real social / contact links; omit unconfigured dummy '#' anchors
  const cleanPhone = (siteSettings?.support_phone || '+91 98765 43210').replace(/\D/g, '')
  const socialLinks = [
    siteSettings?.facebook_url && siteSettings.facebook_url !== '#'
      ? { icon: Facebook, href: siteSettings.facebook_url, label: 'Facebook' }
      : null,
    siteSettings?.instagram_url && siteSettings.instagram_url !== '#'
      ? { icon: Instagram, href: siteSettings.instagram_url, label: 'Instagram' }
      : null,
    cleanPhone
      ? { icon: MessageSquare, href: `https://wa.me/${cleanPhone}`, label: 'WhatsApp' }
      : null,
    siteSettings?.youtube_url && siteSettings.youtube_url !== '#'
      ? { icon: Youtube, href: siteSettings.youtube_url, label: 'YouTube' }
      : null,
  ].filter(Boolean) as { icon: any; href: string; label: string }[]

  // Verified categories that exist in the project
  const displayCategories =
    categories && categories.length > 0
      ? categories.filter((c) => !c.parent_id).slice(0, 6)
      : [
          { slug: 'nuts', name: 'Nuts & Seeds' },
          { slug: 'dry-fruits', name: 'Dry Fruits' },
          { slug: 'spices', name: 'Spices' },
          { slug: 'makhana', name: 'Makhana' },
          { slug: 'combos', name: 'Combos' },
          { slug: 'gift-boxes', name: 'Gift Packs' },
        ]

  return (
    <footer className="bg-[#5C0A0A] text-white select-none border-t border-white/5 pt-16 pb-8">
      {/* 5-Column Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 text-left">

          {/* Column 1: Logo & Branding (span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="inline-block bg-white px-3.5 py-1.5 rounded-2xl shadow-sm">
              <Image
                src="/logo/crazilo-logo.png"
                alt="Crazilo"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-white/80 leading-relaxed max-w-xs">
              Wholesome snacks made with love, inspired by nature.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-[#5C0A0A] flex items-center justify-center text-white transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: SHOP (span 2) */}
          <div className="lg:col-span-2 border-b border-white/10 sm:border-0 pb-1 sm:pb-0">
            <button
              onClick={() => toggleSection('shop')}
              className="w-full flex items-center justify-between sm:block text-left focus:outline-none"
            >
              <h4 className="text-xs font-black text-[#D97706] uppercase tracking-widest sm:mb-4 py-2 sm:py-0 w-full flex items-center justify-between">
                <span>Shop</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 sm:hidden ${
                    openSection === 'shop' ? 'rotate-180' : ''
                  }`}
                />
              </h4>
            </button>
            <ul className={`space-y-2 text-xs font-semibold text-white/80 mt-1 sm:mt-0 ${openSection === 'shop' ? 'block pb-4' : 'hidden'} sm:block`}>
              <li>
                <Link href="/products" className="block py-1 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              {displayCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="block py-1 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: EXPLORE & ABOUT (span 2) */}
          <div className="lg:col-span-2 border-b border-white/10 sm:border-0 pb-1 sm:pb-0">
            <button
              onClick={() => toggleSection('collections')}
              className="w-full flex items-center justify-between sm:block text-left focus:outline-none"
            >
              <h4 className="text-xs font-black text-[#D97706] uppercase tracking-widest sm:mb-4 py-2 sm:py-0 w-full flex items-center justify-between">
                <span>Explore</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 sm:hidden ${
                    openSection === 'collections' ? 'rotate-180' : ''
                  }`}
                />
              </h4>
            </button>
            <ul className={`space-y-2 text-xs font-semibold text-white/80 mt-1 sm:mt-0 ${openSection === 'collections' ? 'block pb-4' : 'hidden'} sm:block`}>
              <li>
                <Link href="/our-story" className="block py-1 hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/blog" className="block py-1 hover:text-white transition-colors">
                  Blog & Wellness
                </Link>
              </li>
              <li>
                <Link href="/products?sort=popular" className="block py-1 hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/products?filter=new" className="block py-1 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: HELP & POLICIES (span 2) */}
          <div className="lg:col-span-2 border-b border-white/10 sm:border-0 pb-1 sm:pb-0">
            <button
              onClick={() => toggleSection('help')}
              className="w-full flex items-center justify-between sm:block text-left focus:outline-none"
            >
              <h4 className="text-xs font-black text-[#D97706] uppercase tracking-widest sm:mb-4 py-2 sm:py-0 w-full flex items-center justify-between">
                <span>Help</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 sm:hidden ${
                    openSection === 'help' ? 'rotate-180' : ''
                  }`}
                />
              </h4>
            </button>
            <ul className={`space-y-2 text-xs font-semibold text-white/80 mt-1 sm:mt-0 ${openSection === 'help' ? 'block pb-4' : 'hidden'} sm:block`}>
              <li>
                <Link href="/orders" className="block py-1 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href={(siteSettings as any)?.shipping_policy_url || '/shipping-policy'} className="block py-1 hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href={siteSettings?.returns_policy_url || '/returns-policy'} className="block py-1 hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href={siteSettings?.privacy_policy_url || '/privacy-policy'} className="block py-1 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={siteSettings?.terms_url || '/terms-of-service'} className="block py-1 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href={siteSettings?.faqs_url || '/faqs'} className="block py-1 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="block py-1 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: GET IN TOUCH (span 3) */}
          <div className="lg:col-span-3 border-b border-white/10 sm:border-0 pb-1 sm:pb-0">
            <button
              onClick={() => toggleSection('get-in-touch')}
              className="w-full flex items-center justify-between sm:block text-left focus:outline-none"
            >
              <h4 className="text-xs font-black text-[#D97706] uppercase tracking-widest sm:mb-4 py-2 sm:py-0 w-full flex items-center justify-between">
                <span>Get In Touch</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 sm:hidden ${
                    openSection === 'get-in-touch' ? 'rotate-180' : ''
                  }`}
                />
              </h4>
            </button>
            <div className={`space-y-4 mt-2 sm:mt-0 ${openSection === 'get-in-touch' ? 'block pb-4' : 'hidden'} sm:block`}>
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

              {/* Payment Badges */}
              <div className="flex items-center gap-1.5 pt-2">
                <div className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#1A1F71] border border-white flex items-center justify-center h-6 w-11 shadow-sm select-none">VISA</div>
                <div className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#F79E1B] border border-white flex items-center justify-center h-6 w-11 shadow-sm select-none">MC</div>
                <div className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#097939] border border-white flex items-center justify-center h-6 w-11 shadow-sm select-none">UPI</div>
                <div className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#005B9E] border border-white flex items-center justify-center h-6 w-11 shadow-sm select-none">RUPAY</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer Credits */}
      <div className="mt-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center gap-1.5 text-xs font-semibold text-white/70">
          <p>© {currentYear} Crazilo. All rights reserved.</p>
          <p className="text-[11px] text-white/60">
            Crafted by{' '}
            <a
              href="https://www.ekodrix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D97706] hover:text-white font-bold transition-colors underline-offset-2 hover:underline"
            >
              Ekodrix
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
