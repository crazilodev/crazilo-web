'use server'

import { requireAdmin } from '@/app/admin/actions'
import { 
  getAdminCustomersList, 
  getAdminCustomerDetail, 
  CustomerListOptions 
} from '@/lib/data/profiles'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1, 'Full name is required').trim(),
  phone: z.string().nullable().optional(),
  role: z.enum(['customer', 'admin']),
  isActive: z.boolean()
})

/**
 * Server action to retrieve customer listings with search, status filtering, and pagination.
 */
export async function getCustomersAction(options: CustomerListOptions) {
  try {
    const { supabase } = await requireAdmin()
    const result = await getAdminCustomersList(supabase, options)
    return { success: true, data: result }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch customer list' }
  }
}

/**
 * Server action to retrieve details, addresses, and order history for a single customer.
 */
export async function getCustomerDetailAction(customerId: string) {
  try {
    const { supabase } = await requireAdmin()
    const result = await getAdminCustomerDetail(supabase, customerId)
    if (!result) {
      return { success: false, error: 'Customer profile not found' }
    }
    return { success: true, data: result }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch customer details' }
  }
}

/**
 * Server action to update customer contact info, active status, and role privileges.
 * Enforces strict self-protection limits to prevent admins from locking themselves out.
 */
export async function updateCustomerProfileAction(payload: any) {
  try {
    const { supabase, user } = await requireAdmin()

    // Validate inputs
    const parsed = profileUpdateSchema.parse(payload)

    // Self-Protection check: A logged-in admin cannot demote or deactivate themselves
    if (user.id === parsed.id) {
      if (!parsed.isActive) {
        return { success: false, error: 'Operation rejected: You cannot deactivate your own administrator account.' }
      }
      if (parsed.role !== 'admin') {
        return { success: false, error: 'Operation rejected: You cannot demote your own administrator account to customer.' }
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: parsed.fullName,
        phone: parsed.phone || null,
        role: parsed.role,
        is_active: parsed.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', parsed.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${parsed.id}`)
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid form input' }
    }
    return { success: false, error: err.message || 'Failed to update customer profile' }
  }
}

/**
 * Server action specifically to toggle account active status.
 * Enforces self-protection limits as well.
 */
export async function setCustomerActiveStatusAction(customerId: string, isActive: boolean) {
  try {
    const { supabase, user } = await requireAdmin()

    if (!customerId) {
      return { success: false, error: 'Customer ID is required' }
    }

    // Self-Protection: Block self-deactivation
    if (user.id === customerId && !isActive) {
      return { success: false, error: 'Operation rejected: You cannot deactivate your own administrator account.' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${customerId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to change active status' }
  }
}
