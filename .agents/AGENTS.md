# 🚀 CRAZILO WEB — AI & DEVELOPER ARCHITECTURE RULES

> **MANDATORY INSTRUCTION FOR ALL AI AGENTS & DEVELOPERS**: Read this entire document BEFORE performing any research, code edits, or architectural changes on this codebase.

---

## 🎯 Project Core Mandate

- **Brand Name**: CRAZILO
- **Tagline**: Dryfruits and Spices
- **Primary Color**: `#B91C1C` (Deep Crimson Red)
- **Secondary Color**: `#7F1D1D` (Dark Red)
- **Accent Gold**: `#D97706` (Warm Amber)
- **Background**: `#FFFFFF` / `#FFF8F0` (Cream White) & `#0F0F0F` (Dark elements)
- **Typography Stack**:
  - Headings & Body: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Plus Jakarta Sans", "Inter", sans-serif`
  - High density, crisp letter-spacing (`-0.03em` for headings, `-0.015em` for body).

---

## 🛑 Strict Technical Rules & Standards

### 1. ZERO Mock Data & ZERO Placeholder Assets
- **Database**: All product items, categories, reviews, banners, coupons, and orders MUST come directly from Supabase DB tables (`products`, `categories`, `orders`, `banners`, `announcements`, `coupons`).
- **Images**: All production product/category images MUST be stored in and served from Supabase Storage buckets (`product-images`, `category-images`, `banner-images`, `avatars`).
- **No Unused Scratch Files**: Do not generate temporary mock JSON or unused scratch files in production directories.

### 2. High Contrast & Human UX/UI Standards
- **Navbar**: Must ALWAYS use a clean, high-contrast white backdrop (`bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100`) with legible dark text (`text-gray-800 font-semibold`). NEVER overlay dark text on dark backgrounds.
- **No Raw Emojis**: Do NOT use raw OS emojis (e.g. 🎉, 🌿, 💰, ⚡, 🍿). ALWAYS use SVG vector icons from `lucide-react` (`Flame`, `Leaf`, `Truck`, `Tag`, `CheckCircle2`, `ShoppingBag`, `Apple`, `Sprout`, `Sparkles`, `Gift`, `Globe`).

### 3. Component Reusability & DRY Architecture
- Re-use core UI building blocks from `@/components/ui/` (`Button`, `Input`, `Badge`, `Modal`, `Skeleton`).
- Use `@/lib/hooks/` (`useAuth`, `useCart`, `useWishlist`, `useProducts`) for centralized client state management via Zustand (`useCartStore`, `useWishlistStore`).

### 4. Supabase Client Usage Contract
- **Browser Client**: Always use `createClient()` from `@/lib/supabase/client` or `@/utils/supabase/client`.
- **Server Component / Route Handler**: Always use `createClient()` from `@/lib/supabase/server` or `@/utils/supabase/server`.
- **Middleware**: Use session updater from `@/middleware.ts` or `@/utils/supabase/middleware.ts`.
- **Admin Operations**: Use `supabaseAdmin` from `@/lib/supabase/admin`.

---

## 🗄️ Database Tables & Storage Buckets Schema

### Database Tables (`supabase/migrations/001_initial_schema.sql`)
1. `profiles`: User account roles (`customer`, `admin`).
2. `categories`: Category tree (`name`, `slug`, `image_url`, `display_order`).
3. `products`: Product master (`name`, `slug`, `price`, `compare_price`, `stock_quantity`, `is_active`, `category_id`).
4. `product_variants`: Size/pack variants (`name`, `sku`, `price`, `weight_grams`).
5. `orders`: Customer orders (`order_number`, `shipping_address`, `subtotal`, `shipping_amount`, `total_amount`, `status`, `payment_status`).
6. `order_items`: Order line items (`product_name`, `quantity`, `unit_price`, `total_price`).
7. `banners`: Hero slider slides (`title`, `subtitle`, `badge_text`, `image_url`, `display_order`).
8. `announcements`: Continuous ticker texts (`text`, `display_order`).
9. `coupons`: Discount codes (`code`, `discount_type`, `discount_value`, `minimum_order_amount`).
10. `reviews`: Customer ratings (`rating`, `title`, `body`, `is_verified_purchase`).
11. `wishlist`: Saved customer items.
12. `addresses`: Customer shipping addresses.

### Storage Buckets
- `product-images` (Public read, Admin upload/delete)
- `category-images` (Public read, Admin upload)
- `banner-images` (Public read, Admin upload)
- `avatars` (Public read, Authenticated user upload)

---

## 🚀 Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://fqsnwfuaorhvieobqggu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_MzOPFhW1X5hnRLCz5TvOtQ_hV5ugkn_
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_MzOPFhW1X5hnRLCz5TvOtQ_hV5ugkn_
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_MzOPFhW1X5hnRLCz5TvOtQ_hV5ugkn_

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Crazilo
NEXT_PUBLIC_CURRENCY=INR
NEXT_PUBLIC_CURRENCY_SYMBOL=₹
ADMIN_EMAIL=admin@crazilo.com
```
