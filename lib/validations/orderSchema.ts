import { z } from 'zod'

export const addressSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode required'),
  country: z.string().default('India'),
})

export const orderSchema = z.object({
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
  same_as_shipping: z.boolean().default(true),
  customer_notes: z.string().optional(),
  coupon_code: z.string().optional(),
  payment_method: z.enum(['cod', 'online']).default('cod'),
})

export type OrderFormData = z.infer<typeof orderSchema>
export type AddressFormData = z.infer<typeof addressSchema>
