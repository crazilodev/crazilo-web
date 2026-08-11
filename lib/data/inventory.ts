import { createClient } from '@/lib/supabase/server'

export async function getInventoryOverview() {
  const supabase = createClient()

  // Fetch all products with categories and variants
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*, categories(name), product_variants(*)')
    .order('name')

  if (productsError) throw productsError

  // Fetch the last movement for each product/variant to map "Last Movement"
  const { data: movements, error: movementsError } = await supabase
    .from('inventory_movements')
    .select('product_id, variant_id, created_at, movement_type')
    .order('created_at', { ascending: false })

  if (movementsError) throw movementsError

  // Build a map of item last movements:
  // Key: `prod_${id}` or `var_${id}`
  const lastMovementMap: Record<string, { created_at: string; movement_type: string }> = {}
  for (const m of movements || []) {
    if (m.variant_id) {
      const key = `var_${m.variant_id}`
      if (!lastMovementMap[key]) {
        lastMovementMap[key] = { created_at: m.created_at, movement_type: m.movement_type }
      }
    } else if (m.product_id) {
      const key = `prod_${m.product_id}`
      if (!lastMovementMap[key]) {
        lastMovementMap[key] = { created_at: m.created_at, movement_type: m.movement_type }
      }
    }
  }

  return {
    products: products || [],
    lastMovementMap,
  }
}

export async function getInventoryMovements(limit = 100) {
  const supabase = createClient()

  // Fetch recent movements with product details, variant details, and performing profiles
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*, products(name), product_variants(name), profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
