import Link from 'next/link'
import Image from 'next/image'
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ShieldCheck,
  Truck,
  RefreshCw,
  HeartHandshake,
} from 'lucide-react'
import type { Category, SiteSettings } from '@/types'

interface FooterProps {
  categories: Category[]
  siteSettings: SiteSettings | null
}

export default function Footer({ categories, siteSettings }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const shippingThreshold = siteSettings?.free_shipping_threshold ?? 599
  const footerCategories = categories.slice(0, 6)

  const supportLinks = [
    { label: 'Track Order', href: '/orders' },
    { label: 'Return Policy', href: siteSettings?.returns_policy_url || '#' },
    { label: 'Privacy Policy', href: siteSettings?.privacy_policy_url || '#' },
    { label: 'Terms of Service', href: siteSettings?.terms_url || '#' },
    { label: 'Contact Us', href: '#contact' },
  ]

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: `On orders above ₹${shippingThreshold}` },
    { icon: ShieldCheck, title: '100% Authentic', desc: 'Premium quality products' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: HeartHandshake, title: 'Secure Payment', desc: 'Safe & encrypted checkout' },
  ]

  const socialLinks = [
    { icon: Instagram, href: siteSettings?.instagram_url || '#', label: 'Instagram' },
    { icon: Facebook, href: siteSettings?.facebook_url || '#', label: 'Facebook' },
    { icon: Twitter, href: siteSettings?.twitter_url || '#', label: 'Twitter' },
    { icon: Youtube, href: siteSettings?.youtube_url || '#', label: 'YouTube' },
  ]

  return (
    <footer className="bg-[#0A0A0A] text-gray-300 border-t border-white/10">
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

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            <Image
              src="/logo/crazilo-logo.png"
              alt="Crazilo"
              width={160}
              height={56}
              className="h-12 w-auto object-contain bg-white/90 p-2 rounded-xl"
            />
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              {siteSettings?.footer_description ||
                'Premium quality dry fruits, nuts, and spices sourced directly from Kashmir and top Indian farms.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
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

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 text-brand-gold">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'All Products', href: '/products' },
                { label: 'Best Sellers', href: '/products?sort=popular' },
                { label: 'New Arrivals', href: '/products?filter=new' },
                { label: 'Offers & Deals', href: '/products?tag=sale' },
              ].map((link) => (
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

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 text-brand-gold">
              Categories
            </h4>
            <ul className="space-y-3">
              {footerCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 text-brand-gold">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-white">{siteSettings?.support_phone || '+91 98765 43210'}</p>
                  <p className="text-xs text-gray-400">{siteSettings?.support_hours || 'Mon-Sat, 9am-6pm IST'}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0 mt-1" />
                <a
                  href={`mailto:${siteSettings?.support_email || 'hello@crazilo.com'}`}
                  className="text-sm font-semibold text-white hover:text-brand-gold transition-colors"
                >
                  {siteSettings?.support_email || 'hello@crazilo.com'}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-400 leading-snug">
                  {siteSettings?.support_address || 'Mumbai, Maharashtra, India'}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© {currentYear} Crazilo Dryfruits and Spices. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {supportLinks.slice(1, 4).map((s) => (
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
