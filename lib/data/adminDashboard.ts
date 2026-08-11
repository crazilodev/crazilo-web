import type { Database } from '@/lib/supabase/database.types'

export interface DashboardMetrics {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  pendingOrders: number
  lowStockProducts: number
  outOfStockProducts: number
  pendingReviewsCount: number
  recentOrders: any[]
  topProducts: any[]
  recentCustomers: any[]
  recentReviews: any[]
  statusBreakdown: { status: string; count: number }[]
}

export async function getAdminDashboardMetrics(supabase: any): Promise<DashboardMetrics> {
  const [
    { count: productsCount },
    { count: customersCount },
    { count: pendingOrdersCount },
    { data: allProducts },
    { data: allOrdersData },
    { data: recentOrdersData },
    { data: topProductsData },
    { data: recentCustomersData },
    { data: recentReviewsData },
    { count: pendingReviewsCount }
  ] = await Promise.all([
    // 1. Total Active Products count
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    // 2. Total Customers count
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    // 3. Pending Orders count
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    // 4. All active products for stock threshold mapping
    supabase.from('products').select('stock_quantity, low_stock_threshold, track_inventory').eq('is_active', true),
    // 5. All Orders (for Revenue & Status Breakdown calculation)
    supabase.from('orders').select('total_amount, status, payment_status'),
    // 6. Recent Orders
    supabase.from('orders').select('*, items:order_items(count)').order('created_at', { ascending: false }).limit(5),
    // 7. Top Products
    supabase.from('products').select('id, name, price, total_sold, thumbnail_url').order('total_sold', { ascending: false }).limit(5),
    // 8. Recent Customers
    supabase.from('profiles').select('id, email, full_name, created_at').eq('role', 'customer').order('created_at', { ascending: false }).limit(5),
    // 9. Recent Reviews
    supabase.from('reviews').select('id, rating, title, body, created_at, products(name), profiles(full_name)').order('created_at', { ascending: false }).limit(5),
    // 10. Pending/Unapproved reviews count
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false)
  ])

  // Low stock and Out of Stock calculations utilizing product-level dynamic thresholds
  let lowStockCount = 0
  let outOfStockCount = 0

  if (allProducts) {
    allProducts.forEach((p: any) => {
      if (p.track_inventory) {
        if (p.stock_quantity === 0) {
          outOfStockCount++
        } else if (p.stock_quantity <= p.low_stock_threshold) {
          lowStockCount++
        }
      }
    })
  }

  const ordersList = allOrdersData || []
  const totalOrdersCount = ordersList.length
  
  // Total Revenue (paid orders total)
  const paidRevenue = ordersList
    .filter((o: any) => o.payment_status === 'paid')
    .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0)

  // Status breakdown calculation
  const statusMap: Record<string, number> = {}
  ordersList.forEach((o: any) => {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1
  })
  
  const breakdown = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  })).sort((a, b) => b.count - a.count)

  return {
    totalProducts: productsCount || 0,
    totalOrders: totalOrdersCount,
    totalRevenue: paidRevenue,
    totalCustomers: customersCount || 0,
    pendingOrders: pendingOrdersCount || 0,
    lowStockProducts: lowStockCount,
    outOfStockProducts: outOfStockCount,
    pendingReviewsCount: pendingReviewsCount || 0,
    recentOrders: recentOrdersData || [],
    topProducts: topProductsData || [],
    recentCustomers: recentCustomersData || [],
    recentReviews: recentReviewsData || [],
    statusBreakdown: breakdown
  }
}
