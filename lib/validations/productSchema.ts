import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  category_id: z.string().uuid('Invalid category').optional().nullable(),
  price: z.coerce.number().positive('Price must be positive'),
  compare_price: z.coerce.number().optional().nullable(),
  cost_price: z.coerce.number().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  low_stock_threshold: z.coerce.number().int().min(0).default(10),
  track_inventory: z.boolean().default(true),
  weight_grams: z.coerce.number().int().optional().nullable(),
  unit: z.enum(['g', 'kg', 'ml', 'l', 'pcs', 'pack']).default('g'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_organic: z.boolean().default(false),
  no_added_sugar: z.boolean().default(false),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
})

export type ProductFormData = z.infer<typeof productSchema>
