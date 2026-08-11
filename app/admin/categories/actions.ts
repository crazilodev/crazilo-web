'use server'

import { requireAdmin } from '@/app/admin/actions'
import { categorySchema, CategoryFormData } from '@/lib/validations/categorySchema'
import { revalidatePath } from 'next/cache'

/**
 * Normalizes empty strings to null for database compatibility
 */
function normalizePayload(data: CategoryFormData) {
  return {
    ...data,
    parent_id: data.parent_id || null,
    image_url: data.image_url || null,
    description: data.description || null,
  }
}

export async function createCategoryAction(data: CategoryFormData) {
  try {
    const { supabase } = await requireAdmin()
    
    // Server-side Zod validation
    const parsed = categorySchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const payload = normalizePayload(parsed.data)

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', payload.slug)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'A category with this URL slug already exists.' }
    }

    // Verify parent category is a main category if specified
    if (payload.parent_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('parent_id')
        .eq('id', payload.parent_id)
        .maybeSingle()

      if (!parent) {
        return { success: false, error: 'Selected parent category does not exist.' }
      }
      if (parent.parent_id !== null) {
        return { success: false, error: 'Selected parent category is a subcategory. Subcategories cannot have child categories.' }
      }
    }

    const { error } = await supabase
      .from('categories')
      .insert(payload)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function updateCategoryAction(id: string, data: CategoryFormData) {
  try {
    const { supabase } = await requireAdmin()

    if (!id) {
      return { success: false, error: 'Category ID is required' }
    }

    // Server-side Zod validation
    const parsed = categorySchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const payload = normalizePayload(parsed.data)

    // Check circular reference
    if (payload.parent_id === id) {
      return { success: false, error: 'A category cannot reference itself as its parent.' }
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', payload.slug)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'Another category with this URL slug already exists.' }
    }

    // Retrieve current category state to check for children
    const { data: currentCat } = await supabase
      .from('categories')
      .select('parent_id')
      .eq('id', id)
      .single()

    if (currentCat) {
      // If category is currently a Main Category (parent_id is null)
      // and we are trying to make it a Subcategory (setting parent_id to non-null)
      if (currentCat.parent_id === null && payload.parent_id !== null) {
        // Check if it has subcategories (children)
        const { count } = await supabase
          .from('categories')
          .select('id', { count: 'exact', head: true })
          .eq('parent_id', id)

        if (count && count > 0) {
          return {
            success: false,
            error: 'A main category that currently has subcategories cannot become a subcategory.',
          }
        }
      }
    }

    // Verify parent category is a main category if specified
    if (payload.parent_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('parent_id')
        .eq('id', payload.parent_id)
        .maybeSingle()

      if (!parent) {
        return { success: false, error: 'Selected parent category does not exist.' }
      }
      if (parent.parent_id !== null) {
        return { success: false, error: 'Selected parent category is a subcategory. Subcategories cannot have child categories.' }
      }
    }

    const { error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!id) {
      return { success: false, error: 'Category ID is required' }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === '23503') {
        return {
          success: false,
          error: 'Cannot delete this category because products or subcategories are still assigned to it. Reassign or delete those first.',
          code: '23503'
        }
      }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
