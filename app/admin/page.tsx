'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Sparkles,
  MessageSquare,
  Eye,
  EyeOff,
  User,
  Clock,
  ArrowUpRight,
  XCircle,
  Star,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils/formatPrice'
import Image from 'next/image'
import { getAdminDashboardMetrics, DashboardMetrics } from '@/lib/data/adminDashboard'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const data = await getAdminDashboardMetrics(supabase)
      setStats(data)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-72 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-32 animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Net Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-emerald-600 border-emerald-100',
      bg: 'bg-emerald-50',
      href: '/admin/orders',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-purple-600 border-purple-100',
      bg: 'bg-purple-50',
      href: '/admin/orders',
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-brand-red border-red-100',
      bg: 'bg-red-50',
      href: '/admin/customers',
    },
    {
      label: 'Active Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600 border-blue-100',
      bg: 'bg-blue-50',
      href: '/admin/products',
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
          <h1 className="font-heading text-3xl font-extrabold text-gray-900 leading-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time shop operations & sales analytics center.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#991B1B] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md hover:shadow-lg focus:outline-none"
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Operational Alerts / Needs Attention area */}
      {(stats.pendingOrders > 0 || stats.lowStockProducts > 0 || stats.outOfStockProducts > 0 || stats.pendingReviewsCount > 0) && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Needs Attention</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.pendingOrders > 0 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/50 rounded-2xl p-4 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-900">{stats.pendingOrders} Pending Orders</p>
                  <p className="text-[10px] text-amber-600 truncate mt-0.5">Awaiting review confirmation</p>
                </div>
                <Link href="/admin/orders?status=pending" aria-label="Manage pending orders" className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
            
            {stats.lowStockProducts > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200/50 rounded-2xl p-4 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-700 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-red-900">{stats.lowStockProducts} Low Stock Items</p>
                  <p className="text-[10px] text-red-600 truncate mt-0.5">Restock recommended</p>
                </div>
                <Link href="/admin/inventory" aria-label="Manage inventory alerts" className="p-1 rounded-lg text-red-700 hover:bg-red-100 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {stats.outOfStockProducts > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-2xl p-4 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white flex-shrink-0">
                  <XCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-red-900">{stats.outOfStockProducts} Out of Stock</p>
                  <p className="text-[10px] text-red-600 truncate mt-0.5">Currently unavailable</p>
                </div>
                <Link href="/admin/inventory" aria-label="Manage out of stock items" className="p-1 rounded-lg text-red-700 hover:bg-red-100 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {stats.pendingReviewsCount > 0 && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200/50 rounded-2xl p-4 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-900">{stats.pendingReviewsCount} Pending Reviews</p>
                  <p className="text-[10px] text-blue-600 truncate mt-0.5">Awaiting moderation</p>
                </div>
                <Link href="/admin/reviews" aria-label="Manage reviews moderation" className="p-1 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 text-sm font-semibold">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {card.value}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Workspace Split layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Recent Orders) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-heading font-black text-base text-gray-900">
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs text-brand-red font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
              >
                All Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Fulfillment</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No orders registered yet</td>
                    </tr>
                  ) : (
                    stats.recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-gray-900">
                          <Link href={`/admin/orders/${order.id}`} className="hover:underline text-brand-red">
                            #{order.order_number}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900 text-xs">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                : order.status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              order.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
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

            {/* Mobile Stacked Card View */}
            <div className="md:hidden p-4 divide-y divide-gray-100 space-y-3">
              {stats.recentOrders.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-xs">No orders registered yet</p>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-gray-900">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline text-brand-red">
                          #{order.order_number}
                        </Link>
                      </span>
                      <span className="text-[10px] text-gray-400 font-sans">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-brand-red">{formatPrice(order.total_amount)}</span>
                      <div className="flex gap-1.5">
                        <span
                          className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : order.status === 'cancelled'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-105 text-gray-600'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Feeds: Recent customers & reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Registrations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h3 className="font-heading font-black text-sm text-gray-900 pb-3 border-b border-gray-50 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-red" />
                Recent Customers
              </h3>
              <div className="space-y-3">
                {stats.recentCustomers.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No recent customers</p>
                ) : (
                  stats.recentCustomers.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs border-b border-gray-50/50 pb-2 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{c.full_name || 'Anonymous customer'}</p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">{c.email}</p>
                      </div>
                      <span className="text-[9px] text-gray-400 font-medium">
                        {new Date(c.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h3 className="font-heading font-black text-sm text-gray-900 pb-3 border-b border-gray-50 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand-gold" />
                Recent Reviews
              </h3>
              <div className="space-y-3">
                {stats.recentReviews.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No recent reviews</p>
                ) : (
                  stats.recentReviews.map((r) => (
                    <div key={r.id} className="text-xs border-b border-gray-50/50 pb-2 last:border-0 last:pb-0 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 truncate max-w-[120px]">
                          {r.profiles?.full_name || 'Customer'}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {r.rating}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold truncate">
                        On: {r.products?.name}
                      </p>
                      <p className="text-[10px] text-gray-500 line-clamp-1 italic">
                        &ldquo;{r.body || r.title || 'No comment'}&rdquo;
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns (Breakdowns & Tops) */}
        <div className="space-y-6">
          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <h2 className="font-heading font-bold text-base text-gray-900">
                Top Selling Products
              </h2>
            </div>
            
            <div className="space-y-4">
              {stats.topProducts.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs font-medium">
                  No products sold yet
                </div>
              ) : (
                stats.topProducts.map((prod, i) => (
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
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate leading-snug">
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
                ))
              )}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-heading font-bold text-base text-gray-900 mb-4 pb-3 border-b border-gray-50">
              Orders Status Breakdown
            </h2>

            <div className="space-y-3.5">
              {stats.statusBreakdown.map((item) => {
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
          </div>
        </div>
      </div>
    </div>
  )
}
