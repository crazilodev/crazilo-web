/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#B91C1C',
          'red-dark': '#7F1D1D',
          'red-light': '#DC2626',
          gold: '#D97706',
          'gold-light': '#F59E0B',
          cream: '#FFF8F0',
          dark: '#0F0F0F',
        },
      },
      fontFamily: {
        heading: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Plus Jakarta Sans',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        body: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'SF Pro Display',
          'Plus Jakarta Sans',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        premium: '0 25px 50px -12px rgba(185, 28, 28, 0.25)',
        card: '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.16)',
        'glow-red': '0 0 30px rgba(185, 28, 28, 0.4)',
        'glow-gold': '0 0 20px rgba(217, 119, 6, 0.3)',
      },
    },
  },
  plugins: [],
}
