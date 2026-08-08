'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils/formatPrice'
import { TrendingUp, Package, ShoppingBag, Users } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0,
    revenueByMonth: [] as { month: string; total: number }[],
    topProducts: [] as { name: string; total_sold: number; price: number }[],
    ordersByStatus: [] as { status: string; count: number }[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const [
        { data: orders },
        { count: products },
        { count: customers },
        { data: topProds },
      ] = await Promise.all([
        supabase.from('orders').select('total_amount, status, created_at').eq('payment_status', 'paid'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('products').select('name, total_sold, price').order('total_sold', { ascending: false }).limit(5),
      ])

      const totalRevenue = (orders || []).reduce((s: number, o: any) => s + o.total_amount, 0)
      const totalOrders = orders?.length || 0

      // Revenue by month (last 6 months)
      const monthlyMap: Record<string, number> = {}
      ;(orders || []).forEach((o: any) => {
        const month = new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        monthlyMap[month] = (monthlyMap[month] || 0) + o.total_amount
      })
      const revenueByMonth = Object.entries(monthlyMap).slice(-6).map(([month, total]) => ({ month, total }))

      // Status breakdown
      const statusMap: Record<string, number> = {}
      ;(orders || []).forEach((o: any) => { statusMap[o.status] = (statusMap[o.status] || 0) + 1 })
      const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }))

      setStats({
        totalRevenue, totalOrders,
        totalProducts: products || 0,
        totalCustomers: customers || 0,
        revenueByMonth,
        topProducts: topProds || [],
        ordersByStatus,
      })
      setLoading(false)
    }
    fetch()
  }, [])

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-brand-red', bg: 'bg-red-50' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">Analytics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-card">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <p className="text-gray-500 text-sm">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${loading ? 'skeleton h-7 w-24 rounded block' : 'text-gray-900'}`}>
                {!loading && card.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Top Selling Products</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
          ) : stats.topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((prod, i) => (
                <div key={prod.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-red/10 text-brand-red text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prod.name}</p>
                    <p className="text-xs text-gray-400">{formatPrice(prod.price)}</p>
                  </div>
                  <span className="text-sm font-bold text-brand-red flex-shrink-0">{prod.total_sold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Orders by Status</h2>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
          ) : stats.ordersByStatus.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.ordersByStatus.map(item => {
                const percent = stats.totalOrders > 0 ? (item.count / stats.totalOrders) * 100 : 0
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium text-gray-700">{item.status}</span>
                      <span className="font-bold text-gray-900">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-red rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
