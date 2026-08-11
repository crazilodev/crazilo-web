'use server'

import { requireAdmin } from '@/app/admin/actions'
import { productSchema, ProductFormData } from '@/lib/validations/productSchema'
import { revalidatePath } from 'next/cache'

interface VariantPayload {
  id?: string
  name: string
  sku?: string | null
  price: number
  compare_price?: number | null
  stock_quantity: number
  weight_grams?: number | null
  display_order: number
  is_active: boolean
}

function normalizeProduct(data: ProductFormData) {
  return {
    ...data,
    compare_price: data.compare_price || null,
    cost_price: data.cost_price || null,
    sku: data.sku || null,
    weight_grams: data.weight_grams || null,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    category_id: data.category_id || null,
  }
}

export async function createProductAction(data: ProductFormData, variants: VariantPayload[]) {
  try {
    const { supabase } = await requireAdmin()

    // 1. Validate product schema
    const parsedProduct = productSchema.safeParse(data)
    if (!parsedProduct.success) {
      return { success: false, error: parsedProduct.error.issues[0].message }
    }

    const productPayload = normalizeProduct(parsedProduct.data)

    // Check slug uniqueness
    const { data: existingSlug } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productPayload.slug)
      .maybeSingle()

    if (existingSlug) {
      return { success: false, error: 'A product with this URL slug already exists.' }
    }

    // Check SKU uniqueness if provided
    if (productPayload.sku) {
      const { data: existingSku } = await supabase
        .from('products')
        .select('id')
        .eq('sku', productPayload.sku)
        .maybeSingle()

      if (existingSku) {
        return { success: false, error: 'A product with this SKU already exists.' }
      }
    }

    // 2. Validate variants
    for (const v of variants) {
      if (!v.name.trim()) {
        return { success: false, error: 'All variants must have a name.' }
      }
      if (Number(v.price) <= 0) {
        return { success: false, error: `Variant price for "${v.name}" must be greater than zero.` }
      }
      if (Number(v.stock_quantity) < 0) {
        return { success: false, error: `Variant stock for "${v.name}" must be non-negative.` }
      }
    }

    // 3. Insert Product
    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .insert(productPayload)
      .select('id')
      .single()

    if (productError) {
      return { success: false, error: productError.message }
    }

    const productId = insertedProduct.id

    // 4. Insert Variants
    if (variants.length > 0) {
      const variantsPayload = variants.map((v) => ({
        product_id: productId,
        name: v.name,
        sku: v.sku || null,
        price: Number(v.price),
        compare_price: v.compare_price ? Number(v.compare_price) : null,
        stock_quantity: Math.floor(Number(v.stock_quantity)),
        weight_grams: v.weight_grams ? Math.floor(Number(v.weight_grams)) : null,
        display_order: Math.floor(Number(v.display_order)) || 0,
        is_active: v.is_active,
      }))

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsPayload)

      if (variantsError) {
        // Rollback product insertion if variants fail (though no transactions, we clean it up)
        await supabase.from('products').delete().eq('id', productId)
        return { success: false, error: `Failed to insert product variants: ${variantsError.message}` }
      }
    }

    revalidatePath('/admin/products')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function updateProductAction(
  productId: string,
  data: ProductFormData,
  variants: VariantPayload[]
) {
  try {
    const { supabase } = await requireAdmin()

    if (!productId) {
      return { success: false, error: 'Product ID is required' }
    }

    // 1. Validate product schema
    const parsedProduct = productSchema.safeParse(data)
    if (!parsedProduct.success) {
      return { success: false, error: parsedProduct.error.issues[0].message }
    }

    const productPayload = normalizeProduct(parsedProduct.data)

    // Check slug uniqueness
    const { data: existingSlug } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productPayload.slug)
      .neq('id', productId)
      .maybeSingle()

    if (existingSlug) {
      return { success: false, error: 'Another product with this URL slug already exists.' }
    }

    // Check SKU uniqueness
    if (productPayload.sku) {
      const { data: existingSku } = await supabase
        .from('products')
        .select('id')
        .eq('sku', productPayload.sku)
        .neq('id', productId)
        .maybeSingle()

      if (existingSku) {
        return { success: false, error: 'Another product with this SKU already exists.' }
      }
    }

    // 2. Validate variants data
    for (const v of variants) {
      if (!v.name.trim()) {
        return { success: false, error: 'All variants must have a name.' }
      }
      if (Number(v.price) <= 0) {
        return { success: false, error: `Variant price for "${v.name}" must be greater than zero.` }
      }
      if (Number(v.stock_quantity) < 0) {
        return { success: false, error: `Variant stock for "${v.name}" must be non-negative.` }
      }
    }

    // 3. Update Product
    // Delete stock_quantity from payload to prevent manual overwrites of existing stock
    delete (productPayload as any).stock_quantity

    const { error: productUpdateError } = await supabase
      .from('products')
      .update(productPayload)
      .eq('id', productId)

    if (productUpdateError) {
      return { success: false, error: productUpdateError.message }
    }

    // 4. Sync Variants (Insert new, update edited, delete removed)
    const { data: dbVariants, error: fetchError } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', productId)

    if (fetchError) {
      return { success: false, error: `Failed to sync variants: ${fetchError.message}` }
    }

    const dbVariantIds = (dbVariants || []).map((v: any) => v.id)
    const incomingVariantIds = variants.filter((v) => v.id).map((v) => v.id!)

    // Deleted variants (exist in DB but not in incoming list)
    const deletedVariantIds = dbVariantIds.filter((id: string) => !incomingVariantIds.includes(id))

    for (const dId of deletedVariantIds) {
      const { error: deleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', dId)

      if (deleteError) {
        if (deleteError.code === '23503') {
          const { data: vInfo } = await supabase
            .from('product_variants')
            .select('name')
            .eq('id', dId)
            .single()

          return {
            success: false,
            error: `Cannot delete variant "${vInfo?.name || 'Unknown'}" because customer orders reference it. Please set its status to inactive instead.`,
          }
        }
        return { success: false, error: `Failed to delete old variant: ${deleteError.message}` }
      }
    }

    // Save and Update variants
    for (const v of variants) {
      const vPayload: any = {
        product_id: productId,
        name: v.name,
        sku: v.sku || null,
        price: Number(v.price),
        compare_price: v.compare_price ? Number(v.compare_price) : null,
        weight_grams: v.weight_grams ? Math.floor(Number(v.weight_grams)) : null,
        display_order: Math.floor(Number(v.display_order)) || 0,
        is_active: v.is_active,
      }

      if (!v.id) {
        // Stock quantity is only set during initial variant creation
        vPayload.stock_quantity = Math.floor(Number(v.stock_quantity))
      }

      if (v.id) {
        // Update
        const { error: updateError } = await supabase
          .from('product_variants')
          .update(vPayload)
          .eq('id', v.id)

        if (updateError) {
          return { success: false, error: `Failed to update variant "${v.name}": ${updateError.message}` }
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('product_variants')
          .insert(vPayload)

        if (insertError) {
          return { success: false, error: `Failed to create new variant "${v.name}": ${insertError.message}` }
        }
      }
    }

    revalidatePath('/admin/products')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!productId) {
      return { success: false, error: 'Product ID is required' }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      if (error.code === '23503') {
        return {
          success: false,
          error: 'Cannot delete this product because it is referenced in past customer orders or reviews. Set its status to inactive to hide it from the storefront instead.',
          code: '23503'
        }
      }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
