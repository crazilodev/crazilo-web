'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package, ShoppingBag, TrendingUp, Users, AlertTriangle,
  ArrowRight, PlusCircle, Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils/formatPrice'

interface Stats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  pendingOrders: number
  lowStockProducts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0, totalOrders: 0, totalRevenue: 0,
    totalCustomers: 0, pendingOrders: 0, lowStockProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const [
        { count: products },
        { count: orders },
        { data: revenue },
        { count: customers },
        { count: pending },
        { count: lowStock },
        { data: recent },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 10).eq('track_inventory', true),
        supabase.from('orders').select('*, items:order_items(count)').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        totalProducts: products || 0,
        totalOrders: orders || 0,
        totalRevenue: (revenue || []).reduce((sum: number, o: any) => sum + o.total_amount, 0),
        totalCustomers: customers || 0,
        pendingOrders: pending || 0,
        lowStockProducts: lowStock || 0,
      })
      setRecentOrders(recent || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/products' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/orders' },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/analytics' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-brand-red', bg: 'bg-red-50', href: '#' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Admin!</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md">
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Alerts */}
      {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {stats.pendingOrders > 0 && (
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800">{stats.pendingOrders} Pending Orders</p>
                <p className="text-xs text-yellow-600">Need your attention</p>
              </div>
              <Link href="/admin/orders" className="text-xs text-yellow-700 font-semibold hover:underline flex items-center gap-1">
                View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
          {stats.lowStockProducts > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{stats.lowStockProducts} Low Stock Items</p>
                <p className="text-xs text-red-600">Restock soon</p>
              </div>
              <Link href="/admin/products" className="text-xs text-red-700 font-semibold hover:underline flex items-center gap-1">
                View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={card.href} className="block bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${loading ? 'skeleton h-7 w-20 rounded' : 'text-gray-900'}`}>
                  {loading ? '' : card.value}
                </p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-heading font-bold text-xl text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-red font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Order #</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Payment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-3"><div className="skeleton h-4 rounded" /></td></tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No orders yet</td></tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-t border-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">#{order.order_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 font-semibold text-brand-red">{formatPrice(order.total_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                        order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>{order.payment_status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
