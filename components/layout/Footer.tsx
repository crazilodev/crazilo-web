'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Phone, Mail, MapPin, Instagram, Facebook, Twitter,
  Youtube, ShieldCheck, Truck, RefreshCw, HeartHandshake,
  ChevronDown
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const [quickLinksOpen, setQuickLinksOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [contactUsOpen, setContactUsOpen] = useState(false)

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Products', href: '/products' },
    { label: 'Best Sellers', href: '/products?sort=popular' },
    { label: 'New Arrivals', href: '/products?filter=new' },
    { label: 'Offers & Deals', href: '/products?tag=sale' },
  ]

  const categories = [
    { label: 'Dry Fruits', href: '/category/dry-fruits' },
    { label: 'Nuts', href: '/category/nuts' },
    { label: 'Spices', href: '/category/spices' },
    { label: 'Seeds', href: '/category/seeds' },
    { label: 'Makhana', href: '/category/makhana' },
    { label: 'Gift Boxes', href: '/category/gift-boxes' },
  ]

  const support = [
    { label: 'Track Order', href: '/orders' },
    { label: 'Return Policy', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact Us', href: '#contact' },
  ]

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹599' },
    { icon: ShieldCheck, title: '100% Authentic', desc: 'Premium quality products' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: HeartHandshake, title: 'Secure Payment', desc: 'Safe & encrypted checkout' },
  ]

  return (
    <footer className="bg-[#0A0A0A] text-gray-300 border-t border-white/10">
      {/* Top Feature Bar */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Image
              src="/logo/crazilo-logo.png"
              alt="Crazilo"
              width={160}
              height={56}
              className="h-12 w-auto object-contain bg-white/90 p-2 rounded-xl"
            />
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Premium quality dry fruits, nuts, and spices sourced directly from Kashmir and top Indian farms. Bringing nature&apos;s finest harvests to your doorstep since 2020.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 hover:bg-brand-red hover:border-brand-red flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-b border-white/10 pb-4 lg:border-none lg:pb-0">
            <button
              onClick={() => setQuickLinksOpen(!quickLinksOpen)}
              className="w-full flex items-center justify-between lg:block text-left focus:outline-none"
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-widest text-brand-gold lg:mb-4">
                Quick Links
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-brand-gold transition-transform duration-200 lg:hidden ${
                  quickLinksOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <ul className={`${quickLinksOpen ? 'block' : 'hidden'} lg:block space-y-3 mt-4 lg:mt-0`}>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="border-b border-white/10 pb-4 lg:border-none lg:pb-0">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="w-full flex items-center justify-between lg:block text-left focus:outline-none"
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-widest text-brand-gold lg:mb-4">
                Categories
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-brand-gold transition-transform duration-200 lg:hidden ${
                  categoriesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <ul className={`${categoriesOpen ? 'block' : 'hidden'} lg:block space-y-3 mt-4 lg:mt-0`}>
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="border-b border-white/10 pb-4 lg:border-none lg:pb-0">
            <button
              onClick={() => setContactUsOpen(!contactUsOpen)}
              className="w-full flex items-center justify-between lg:block text-left focus:outline-none"
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-widest text-brand-gold lg:mb-4">
                Contact Us
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-brand-gold transition-transform duration-200 lg:hidden ${
                  contactUsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <ul className={`${contactUsOpen ? 'block' : 'hidden'} lg:block space-y-4 mt-4 lg:mt-0`}>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-white">+91 98765 43210</p>
                  <p className="text-xs text-gray-400">Mon–Sat, 9am–6pm IST</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0 mt-1" />
                <a href="mailto:hello@crazilo.com" className="text-sm font-semibold text-white hover:text-brand-gold transition-colors">
                  hello@crazilo.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-400 leading-snug">Mumbai, Maharashtra, India</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            © {currentYear} Crazilo Dryfruits and Spices. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {support.slice(1, 4).map((s) => (
              <Link key={s.label} href={s.href} className="text-xs text-gray-400 hover:text-white transition-colors">
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
