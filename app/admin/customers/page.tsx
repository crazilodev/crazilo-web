'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Shield 
} from 'lucide-react'
import { getCustomersAction, setCustomerActiveStatusAction } from './actions'
import { formatPrice } from '@/lib/utils/formatPrice'
import toast from 'react-hot-toast'

interface CustomerRow {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  is_active: boolean
  created_at: string
  orders: {
    id: string
    total_amount: number
    status: string
    created_at: string
  }[]
}

const PAGE_SIZE = 15

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)

  // Confirm dialog state for toggling is_active inline
  const [statusToggleData, setStatusToggleData] = useState<{
    customerId: string
    name: string
    currentActive: boolean
  } | null>(null)
  const [toggling, setToggling] = useState(false)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCustomersAction({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status: statusFilter,
      })

      if (res.success && res.data) {
        setCustomers(res.data.profiles as any)
        setTotalCount(res.data.totalCount)
      } else {
        toast.error(res.error || 'Failed to fetch customer directory')
      }
    } catch (err) {
      toast.error('An error occurred while loading customers')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Reset to page 1 when search or status filters update
  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleStatusFilterChange = (val: 'all' | 'active' | 'inactive') => {
    setStatusFilter(val)
    setPage(1)
  }

  // Handle inline account active status toggles
  const handleToggleActiveClick = (customerId: string, name: string, active: boolean) => {
    setStatusToggleData({ customerId, name, currentActive: active })
  }

  const executeStatusToggle = async () => {
    if (!statusToggleData) return
    setToggling(true)
    try {
      const res = await setCustomerActiveStatusAction(
        statusToggleData.customerId,
        !statusToggleData.currentActive
      )

      if (res.success) {
        toast.success(`Account status updated for ${statusToggleData.name}`)
        await fetchCustomers()
      } else {
        toast.error(res.error || 'Failed to update account status')
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed')
    } finally {
      setToggling(false)
      setStatusToggleData(null)
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Monitor user authorization permissions, toggle active login states, and review client order histories."
      />

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none input-brand"
            id="customer-search-input"
          />
        </div>

        {/* Status Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-gray-400 hidden md:block" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as any)}
            className="w-full md:w-44 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red/35"
            id="customer-status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive / Suspended</option>
          </select>
        </div>

      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No customers found"
              description="Refine your filters or search keywords to view matching customer accounts."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4 text-right">Gross Spend</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150/40">
                {customers.map((c) => {
                  const ordersCount = c.orders ? c.orders.length : 0
                  const grossSpend = c.orders 
                    ? c.orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
                    : 0
                  
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 border border-gray-200">
                          {c.full_name ? c.full_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <span className="block font-bold">{c.full_name || 'Anonymous Client'}</span>
                          {c.role === 'admin' && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 px-1 py-0.2 rounded mt-0.5 border border-amber-100 uppercase">
                              <Shield className="w-2.5 h-2.5" /> Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{c.email}</td>
                      
                      {/* Active/Inactive Status Toggles */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActiveClick(c.id, c.full_name || c.email, c.is_active)}
                          className="focus:outline-none"
                        >
                          {c.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 cursor-pointer hover:bg-emerald-100 uppercase transition-all">
                              <CheckCircle className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-150 cursor-pointer hover:bg-red-100 uppercase transition-all">
                              <XCircle className="w-3.5 h-3.5" /> Suspended
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{ordersCount} orders</td>
                      
                      {/* Spend */}
                      <td className="px-6 py-4 text-right font-bold text-brand-red">
                        {formatPrice(grossSpend)}
                      </td>

                      <td className="px-6 py-4 text-gray-400">
                        {new Date(c.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Navigation Link */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
                        >
                          Manage Profile
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">
              Showing page {page} of {totalPages} ({totalCount} total customers)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-gray-250 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-gray-250 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline toggle confirm dialog */}
      {statusToggleData && (
        <ConfirmDialog
          isOpen={!!statusToggleData}
          onClose={() => setStatusToggleData(null)}
          onConfirm={executeStatusToggle}
          title="Toggle Account Status"
          message={
            statusToggleData.currentActive
              ? `Are you sure you want to deactivate and suspend ${statusToggleData.name}?\n\nThis will restrict the customer account from logging in or placing new checkouts.`
              : `Reactivate the account for ${statusToggleData.name}?`
          }
          variant={statusToggleData.currentActive ? 'danger' : 'primary'}
          confirmText={statusToggleData.currentActive ? 'Suspend User' : 'Activate User'}
          loading={toggling}
        />
      )}
    </div>
  )
}
