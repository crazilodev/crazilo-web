# 🛒 Crazilo — Premium Dryfruits & Spices E-Commerce Website

A production-ready, full-stack e-commerce web application built for **Crazilo Dryfruits and Spices**. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, and real Supabase backend.

> **AI AGENT & DEVELOPER MANDATE**: Refer to [`.agents/AGENTS.md`](file:///d:/WORKS/crazilo/.agents/AGENTS.md) for strict architectural rules, Supabase contracts, zero-mock-data policies, and Apple SF Pro typography guidelines.

---

## 🎨 Brand Design & Features

- **Brand Palette**:
  - Primary: Crimson Red (`#B91C1C`)
  - Secondary: Dark Crimson (`#7F1D1D`)
  - Accent: Warm Amber Gold (`#D97706`)
  - Background: Cream White (`#FFF8F0`) & Near Black (`#0F0F0F`)
- **Typography**: Apple SF Pro Display / Plus Jakarta Sans (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", sans-serif`)
- **Store Features**:
  - Ticker Announcement Bar with continuous smooth marquee animation.
  - Multi-banner Hero Slider with Framer Motion 3D product drop animation & floating ingredient cutouts.
  - "Find Your Snack!" 4-Podium visual category cards section.
  - 4-Card Visual Banner Grid (`Date Bites`, `Dry Fruit Mixes`, `Roasted Makhana`, `Premium Seeds`).
  - Product Cards with discount calculation, stock status badges (Organic, Best Seller, New), quick add to cart, and wishlist toggle.
  - Product Detail Page with image gallery, size variant selector, quantity controls, nutritional table, customer reviews, and related products.
  - Slide-in Cart Drawer & Full Cart Page with free shipping progress bar.
  - Checkout page with Cash on Delivery (COD) order placement.
  - Orders Page with status tracking badges (Pending, Confirmed, Shipped, Delivered).
  - Account Settings & Profile management.
- **Admin Panel (`/admin`)**:
  - Analytics & Revenue Dashboard (Real sales totals, top-selling products, status breakdown).
  - Complete Product Management (Add, Edit, Delete, Hide/Show, Image Uploader to Supabase Storage, Stock & Price management, Tagging, SEO fields).
  - Category Management (Inline creation, display order, image upload).
  - Order Processing & Status Updates.
  - Hero Banner & Ticker Announcement Managers.
  - Coupon Code Management (Percentage & Fixed discounts).

---

## 🚀 How to Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase Environment Variables
Create or update `.env.local` in the project root:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://fqsnwfuaorhvieobqggu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_MzOPFhW1X5hnRLCz5TvOtQ_hV5ugkn_
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_MzOPFhW1X5hnRLCz5TvOtQ_hV5ugkn_
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_MzOPFhW1X5hnRLCz5TvOtQ_hV5ugkn_

# Application Settings
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Crazilo
NEXT_PUBLIC_CURRENCY=INR
NEXT_PUBLIC_CURRENCY_SYMBOL=₹

# Admin Account Email
ADMIN_EMAIL=admin@crazilo.com
```

### 3. Setup Supabase Database & Storage
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/fqsnwfuaorhvieobqggu).
2. Open **SQL Editor**.
3. Copy all contents from [`supabase/migrations/001_initial_schema.sql`](file:///d:/WORKS/crazilo/supabase/migrations/001_initial_schema.sql) and click **Run**.
4. This will automatically create:
   - All SQL tables (`profiles`, `categories`, `products`, `product_variants`, `orders`, `order_items`, `banners`, `announcements`, `coupons`, `reviews`, `wishlist`, `newsletter_subscribers`).
   - Storage Buckets (`product-images`, `category-images`, `banner-images`, `avatars`).
   - Row Level Security (RLS) policies and triggers.

### 4. Create an Admin Account
1. In Supabase Dashboard, go to **Authentication > Users** and click **Add User > Create User**.
2. Create user with Email: `admin@crazilo.com` (or your configured `ADMIN_EMAIL`).
3. Set a secure password.
4. Go to **Table Editor > profiles** table and set `role` = `'admin'` for this user.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Store**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin) (Log in with admin account)

---

## 🛠️ Project Structure

```
crazilo/
├── .agents/                     # AI & Developer Rules (AGENTS.md)
├── app/
│   ├── (store)/                 # Customer Store Pages
│   │   ├── page.tsx             # Homepage
│   │   ├── products/            # Product Listing & Detail pages
│   │   ├── category/[slug]/     # Category Filtered pages
│   │   ├── cart/                # Shopping Cart page
│   │   ├── checkout/            # Checkout & Order Placement
│   │   ├── orders/              # Customer Orders & Tracking
│   │   └── account/             # Account Settings
│   ├── admin/                   # Admin Panel Pages
│   │   ├── page.tsx             # Dashboard & Analytics
│   │   ├── products/            # Products CRUD & Image Uploader
│   │   ├── categories/          # Category Manager
│   │   ├── orders/              # Order Processing
│   │   ├── banners/             # Hero Slider Manager
│   │   ├── announcements/       # Ticker Manager
│   │   ├── coupons/             # Coupon Manager
│   │   └── analytics/           # Detailed Sales Reports
│   ├── api/                     # API Endpoints (orders, webhooks)
│   └── auth/                    # Login, Register & Auth Callbacks
├── components/
│   ├── layout/                  # Navbar, Footer, AnnouncementBar
│   ├── home/                    # HeroSlider, CategoryScroll, FindYourSnack, OfferBanner, BestSellers
│   ├── products/                # ProductCard, ProductGrid
│   ├── cart/                    # CartDrawer
│   ├── admin/                   # AdminSidebar, ImageUploader, ProductForm
│   └── ui/                      # Button, Input, Badge, Modal, Skeleton
├── lib/
│   ├── supabase/                # Client, Server, Admin Supabase Clients
│   ├── store/                   # Zustand Cart & Wishlist persistence stores
│   ├── hooks/                   # useAuth, useCart, useWishlist, useProducts
│   └── utils/                   # formatPrice, imageHelpers, slugify
├── styles/                      # globals.css (Design tokens, keyframes, Apple SF Pro font stack)
└── supabase/                    # 001_initial_schema.sql (Complete SQL setup with Buckets)
```
