import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import CartDrawer from '@/components/cart/CartDrawer'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Crazilo — Premium Dryfruits & Spices',
    template: '%s | Crazilo',
  },
  description:
    'Shop premium quality dry fruits, nuts, and spices at Crazilo. 100% natural, no preservatives. Free shipping above ₹599.',
  keywords: ['dry fruits', 'spices', 'nuts', 'makhana', 'premium', 'natural', 'India'],
  openGraph: {
    title: 'Crazilo — Premium Dryfruits & Spices',
    description: 'Premium quality dry fruits, nuts, and spices sourced from the finest farms.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Crazilo',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo/crazilo-logo.png" />
        <meta name="theme-color" content="#B91C1C" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-body antialiased">
        {children}
        <CartDrawer />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A1A',
              color: '#fff',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            },
            success: {
              iconTheme: { primary: '#D97706', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#B91C1C', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
