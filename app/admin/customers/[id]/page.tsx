'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import StatusBadge from '@/components/admin/StatusBadge'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/formatPrice'
import { createClient } from '@/lib/supabase/client'
import { 
  getCustomerDetailAction, 
  updateCustomerProfileAction 
} from '../actions'
import { 
  User as UserIcon, 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  Shield, 
  ShoppingBag, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  params: {
    id: string
  }
}

interface AddressRecord {
  id: string
  full_name: string
  phone: string | null
  line1: string
  line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default_shipping: boolean
  is_default_billing: boolean
}

interface OrderRecord {
  id: string
  order_number: string
  status: string
  payment_status: string
  total_amount: number
  created_at: string
}

interface CustomerDetail {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
  orders: OrderRecord[]
  addresses: AddressRecord[]
}

export default function AdminCustomerDetailPage({ params }: Props) {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [currentAdminUser, setCurrentAdminUser] = useState<any>(null)

  // Edit form states
  const [fullNameInput, setFullNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [roleInput, setRoleInput] = useState<'customer' | 'admin'>('customer')
  const [isActiveInput, setIsActiveInput] = useState(true)

  // Status toggle confirmation
  const [confirmStatusToggle, setConfirmStatusToggle] = useState(false)

  const fetchCustomerDetail = useCallback(async () => {
    try {
      const res = await getCustomerDetailAction(params.id)
      if (res.success && res.data) {
        const data = res.data as any
        setCustomer(data)
        setFullNameInput(data.full_name || '')
        setPhoneInput(data.phone || '')
        setRoleInput(data.role)
        setIsActiveInput(data.is_active)
      } else {
        setCustomer(null)
      }
    } catch (err) {
      toast.error('Failed to load customer profile detail')
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchCustomerDetail()
    
    // Retrieve logged-in administrator to enforce self-protection UI blocks
    const supabase = createClient()
    supabase.auth.getUser().then((res: any) => {
      if (res.data?.user) {
        setCurrentAdminUser(res.data.user)
      }
    })
  }, [fetchCustomerDetail])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    if (!fullNameInput.trim()) {
      toast.error('Full name is required')
      return
    }

    setUpdating(true)
    try {
      const res = await updateCustomerProfileAction({
        id: customer.id,
        fullName: fullNameInput.trim(),
        phone: phoneInput.trim() || null,
        role: roleInput,
        isActive: isActiveInput
      })

      if (res.success) {
        toast.success('Customer profile updated successfully!')
        await fetchCustomerDetail()
      } else {
        toast.error(res.error || 'Failed to update profile')
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="max-w-md mx-auto py-16">
        <EmptyState
          icon={UserIcon}
          title="Customer Profile Not Found"
          description="The customer ID does not match any profile records in the database."
          action={
            <Link href="/admin/customers">
              <Button variant="primary">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Customers
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const isSelf = currentAdminUser && currentAdminUser.id === customer.id

  // Statistics calculation helpers
  const orders = customer.orders || []
  const totalOrdersCount = orders.length
  
  // Spend metric (Gross Placed Spend based on orders total_amount)
  const grossPlacedSpend = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  
  const completedOrders = orders.filter(o => o.status === 'delivered')
  const completedOrdersCount = completedOrders.length
  const completedSpend = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  
  const avgOrderValue = totalOrdersCount > 0 ? grossPlacedSpend / totalOrdersCount : 0

  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing' || o.status === 'shipped').length
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length
  const refundedOrdersCount = orders.filter(o => o.status === 'refunded').length

  const firstOrderDate = orders.length > 0
    ? new Date(Math.min(...orders.map(o => new Date(o.created_at).getTime()))).toLocaleDateString()
    : '—'
  const lastOrderDate = orders.length > 0
    ? new Date(Math.max(...orders.map(o => new Date(o.created_at).getTime()))).toLocaleDateString()
    : '—'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header section with back button links */}
      <div className="border-b border-gray-150 pb-5">
        <Link href="/admin/customers" className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-brand-red mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Customers List
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-lg shadow-sm border border-brand-red-dark">
              {customer.full_name ? customer.full_name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-gray-900">{customer.full_name || 'Anonymous Profile'}</h1>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{customer.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {customer.is_active ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 uppercase">
                <CheckCircle className="w-4 h-4" /> Active Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-150 uppercase">
                <XCircle className="w-4 h-4" /> Suspended Account
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main layout grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (Profile parameters editing details) */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-gray-400" /> Account Management
            </h2>

            {isSelf && (
              <div className="bg-amber-50 text-amber-800 border border-amber-100 p-3 rounded-xl text-xs flex gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Self-Access Lock Activated:</strong> You cannot deactivate or demote your own logged-in administrator account.
                </p>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              
              {/* Full Name input */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none input-brand font-medium text-gray-800"
                  required
                />
              </div>

              {/* Email Address Read-only field */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="email"
                    value={customer.email}
                    disabled
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 focus:outline-none font-medium cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              {/* Phone contact input */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    placeholder="e.g. +91 99999 99999"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none input-brand font-medium text-gray-800 text-sm"
                  />
                </div>
              </div>

              {/* Role Select input */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  User Role privileges
                </label>
                <select
                  value={roleInput}
                  disabled={isSelf}
                  onChange={(e) => setRoleInput(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-red/35 font-medium text-gray-800"
                >
                  <option value="customer">CUSTOMER</option>
                  <option value="admin">ADMINISTRATOR</option>
                </select>
              </div>

              {/* Active Toggle selector */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Login Access status
                </label>
                <select
                  value={isActiveInput ? 'active' : 'suspended'}
                  disabled={isSelf}
                  onChange={(e) => setIsActiveInput(e.target.value === 'active')}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-red/35 font-medium text-gray-800"
                >
                  <option value="active">ACTIVE (Allowed to login)</option>
                  <option value="suspended">SUSPENDED (Login locked)</option>
                </select>
              </div>

              {/* Metadata logging info */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[10px] text-gray-400 font-semibold space-y-1.5 uppercase">
                <p>Registered: {new Date(customer.created_at).toLocaleDateString()}</p>
                <p>Last Modified: {new Date(customer.updated_at).toLocaleDateString()}</p>
              </div>

              {/* Save changes button */}
              <Button
                type="submit"
                variant="primary"
                loading={updating}
                size="sm"
                className="w-full"
              >
                Save Profile Changes
              </Button>

            </form>
          </div>
        </div>

        {/* Right columns (Dashboard statistics metrics, recent orders listing, saved addresses) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: totalOrdersCount, icon: ShoppingBag, color: 'text-indigo-500 bg-indigo-50' },
              { label: 'Completed Orders', value: completedOrdersCount, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
              { label: 'Gross Placed Spend', value: formatPrice(grossPlacedSpend), icon: DollarSign, color: 'text-rose-500 bg-rose-50' },
              { label: 'Average Value', value: formatPrice(avgOrderValue), icon: TrendingUp, color: 'text-amber-500 bg-amber-50 font-sans' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-1.5 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-1 font-heading truncate">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Operational logs for detailed statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status counts detailed card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2.5">
                Fulfillment Stats Details
              </h3>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Pending / Active Orders</span>
                  <span className="font-semibold text-gray-800">{pendingOrdersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelled Placements</span>
                  <span className="font-semibold text-gray-800">{cancelledOrdersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refunded Placements</span>
                  <span className="font-semibold text-gray-800">{refundedOrdersCount}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-gray-150 pt-2 text-gray-900">
                  <span>Net Completed Revenue</span>
                  <span className="font-bold text-emerald-600">{formatPrice(completedSpend)}</span>
                </div>
              </div>
            </div>

            {/* Date ranges card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2.5">
                Account Milestones
              </h3>
              <div className="space-y-2.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>First Order Placed</span>
                  <span className="font-semibold text-gray-800">{firstOrderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Most Recent Placement</span>
                  <span className="font-semibold text-gray-800">{lastOrderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Setup</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders History List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-heading font-bold text-lg text-gray-900">Order History Logs</h3>
            </div>
            
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 italic p-6">No historical order placements found for this customer.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                      <th className="px-5 py-3">Order Number</th>
                      <th className="px-5 py-3">Placed Date</th>
                      <th className="px-5 py-3 text-center">Fulfillment</th>
                      <th className="px-5 py-3 text-center">Payment</th>
                      <th className="px-5 py-3 text-right">Total Amount</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/10">
                        <td className="px-5 py-3 font-mono font-bold text-gray-800">#{o.order_number}</td>
                        <td className="px-5 py-3 text-gray-400">
                          {new Date(o.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-block scale-90">
                            <StatusBadge status={o.status} type="order" />
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-block scale-90">
                            <StatusBadge status={o.payment_status} type="payment" />
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-gray-900">{formatPrice(o.total_amount)}</td>
                        <td className="px-5 py-3 text-right">
                          <Link href={`/admin/orders/${o.id}`} className="text-brand-red hover:text-brand-red-dark font-semibold">
                            View Order
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Saved Addresses list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" /> Saved Addresses ({customer.addresses ? customer.addresses.length : 0})
            </h3>

            {(!customer.addresses || customer.addresses.length === 0) ? (
              <p className="text-xs text-gray-400 italic">No saved addresses found for this profile.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="border border-gray-150/60 rounded-xl p-3.5 text-xs text-gray-600 space-y-1 relative">
                    <p className="font-bold text-gray-800">{addr.full_name}</p>
                    <p>{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.state} - {addr.postal_code}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{addr.country}</p>
                    {addr.phone && <p className="text-[10px] text-gray-400 mt-1">Phone: {addr.phone}</p>}
                    
                    <div className="flex gap-1.5 mt-2">
                      {addr.is_default_shipping && (
                        <span className="text-[8px] font-bold bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded border border-indigo-100 uppercase">
                          Default Shipping
                        </span>
                      )}
                      {addr.is_default_billing && (
                        <span className="text-[8px] font-bold bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-100 uppercase">
                          Default Billing
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
