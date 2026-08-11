import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and contain only alphanumeric characters and hyphens'),
  description: z.string().optional().nullable().or(z.literal('')),
  parent_id: z.string().uuid('Invalid parent category ID').nullable().optional().or(z.literal('')),
  sort_order: z.coerce.number().int().min(0, 'Sort order must be a non-negative integer'),
  is_active: z.boolean().default(true),
  image_url: z.string().url('Invalid image URL').nullable().optional().or(z.literal('')),
})

export type CategoryFormData = z.infer<typeof categorySchema>
