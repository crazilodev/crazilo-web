'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package, ShoppingBag, TrendingUp, Users, AlertTriangle,
  ArrowRight, PlusCircle, Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils/formatPrice'
import Image from 'next/image'

interface Stats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  pendingOrders: number
  lowStockProducts: number
}

interface TopProduct {
  id: string
  name: string
  price: number
  total_sold: number
  thumbnail_url: string | null
}

interface StatusBreakdown {
  status: string
  count: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    const supabase = createClient()
    
    const [
      { count: productsCount },
      { count: customersCount },
      { count: pendingCount },
      { count: lowStockCount },
      { data: allOrdersData },
      { data: recentOrdersData },
      { data: topProductsData }
    ] = await Promise.all([
      // 1. Total Products
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      // 2. Total Customers
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      // 3. Pending Orders
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      // 4. Low Stock Products
      supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 10).eq('track_inventory', true),
      // 5. All Orders (for Revenue & Status Breakdown calculation)
      supabase.from('orders').select('total_amount, status, payment_status'),
      // 6. Recent Orders
      supabase.from('orders').select('*, items:order_items(count)').order('created_at', { ascending: false }).limit(5),
      // 7. Top Products
      supabase.from('products').select('id, name, price, total_sold, thumbnail_url').order('total_sold', { ascending: false }).limit(5)
    ])

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

    setStats({
      totalProducts: productsCount || 0,
      totalOrders: totalOrdersCount,
      totalRevenue: paidRevenue,
      totalCustomers: customersCount || 0,
      pendingOrders: pendingCount || 0,
      lowStockProducts: lowStockCount || 0,
    })

    setRecentOrders(recentOrdersData || [])
    setTopProducts((topProductsData as any[]) || [])
    setStatusBreakdown(breakdown)
    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/products',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/admin/orders',
    },
    {
      label: 'Net Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/admin/orders',
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-brand-red',
      bg: 'bg-red-50',
      href: '/admin/customers',
    },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    processing: 'bg-purple-500',
    shipped: 'bg-indigo-500',
    delivered: 'bg-emerald-500',
    cancelled: 'bg-red-500',
    refunded: 'bg-gray-400',
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-900 leading-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time shop operations & sales analytics center.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md hover:shadow-lg focus:outline-none"
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Alerts block */}
      {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.pendingOrders > 0 && (
            <div className="flex items-center gap-3.5 bg-amber-50 border border-amber-200/50 rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900">
                  {stats.pendingOrders} Pending Orders
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Awaiting review and confirmation.
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs text-amber-800 font-bold hover:underline flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
          {stats.lowStockProducts > 0 && (
            <div className="flex items-center gap-3.5 bg-red-50 border border-red-200/50 rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900">
                  {stats.lowStockProducts} Low Stock Items
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  Restock recommended to prevent out-of-stock.
                </p>
              </div>
              <Link
                href="/admin/inventory"
                className="text-xs text-red-800 font-bold hover:underline flex items-center gap-1"
              >
                Alerts <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={card.href}
                className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm font-medium">{card.label}</span>
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${loading ? 'skeleton h-7 w-20 rounded' : 'text-gray-900'}`}>
                  {loading ? '' : card.value}
                </p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Workspace Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2-Column: Recent orders registry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-heading font-bold text-lg text-gray-900">
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs text-brand-red font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
              >
                All Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-5 py-4">
                          <div className="skeleton h-4 rounded" />
                        </td>
                      </tr>
                    ))
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                        No orders registered yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-55/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-sm font-bold text-gray-900">
                          #{order.order_number}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-brand-red text-sm">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700'
                                : order.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700'
                                : order.status === 'cancelled'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              order.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1-Column: Top Products & Status breakdown analytics */}
        <div className="space-y-6">
          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <h2 className="font-heading font-bold text-base text-gray-900">
                Top Selling Products
              </h2>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 rounded-xl" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-4">
                No selling data registered.
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((prod, i) => (
                  <div key={prod.id} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-brand-red/10 text-brand-red text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg overflow-hidden relative bg-gray-50 flex-shrink-0">
                      {prod.thumbnail_url ? (
                        <Image
                          src={prod.thumbnail_url}
                          alt={prod.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate leading-snug">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {formatPrice(prod.price)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {prod.total_sold} sold
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Status Breakdown Analytics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-heading font-bold text-base text-gray-900 mb-4 pb-3 border-b border-gray-50">
              Orders Status Breakdown
            </h2>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-8 rounded-lg" />
                ))}
              </div>
            ) : statusBreakdown.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-4">
                No orders status data.
              </p>
            ) : (
              <div className="space-y-3.5">
                {statusBreakdown.map((item) => {
                  const percentage =
                    stats.totalOrders > 0
                      ? Math.round((item.count / stats.totalOrders) * 100)
                      : 0
                  const colorClass = statusColors[item.status] || 'bg-gray-500'

                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="capitalize text-gray-600">{item.status}</span>
                        <span className="text-gray-900">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorClass}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
