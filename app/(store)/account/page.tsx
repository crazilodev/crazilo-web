'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Profile, Address, Order } from '@/types'
import {
  User, Mail, Phone, Save, Shield, Plus, MapPin,
  Trash2, Edit2, Check, X, LogOut, Package, Clock,
  CheckCircle, AlertCircle, Truck, XCircle, ChevronRight,
  ShoppingBag, CreditCard, ChevronDown
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { getProfileById, updateProfileContactInfo } from '@/lib/data/profiles'
import { getUserOrders } from '@/lib/data/orders'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useAuthModalStore } from '@/lib/store/authModalStore'

interface AddressFormFields {
  full_name: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  pincode: string
  country: string
  is_default: boolean
}

const initialAddressState: AddressFormFields = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  is_default: false,
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: AlertCircle },
  shipped: { label: 'Shipped', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
  refunded: { label: 'Refunded', color: 'text-gray-700 bg-gray-100 border-gray-200', icon: XCircle },
}

function AccountClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as 'orders' | 'addresses' | 'profile') || 'orders'

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>(initialTab)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState<AddressFormFields>(initialAddressState)
  const [addressFormErrors, setAddressFormErrors] = useState<Partial<Record<keyof AddressFormFields, string>>>({})
  const [addressSubmitLoading, setAddressSubmitLoading] = useState(false)

  const { register, handleSubmit, reset } = useForm<Partial<Profile>>()

  const fetchAccountData = useCallback(async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      // 1. Fetch Profile
      const profileData = await getProfileById(supabase, user.id)
      if (profileData) {
        setProfile(profileData)
        reset({
          full_name: profileData.full_name || user.user_metadata?.full_name || '',
          phone: profileData.phone || user.user_metadata?.phone || '',
        })
      }

      // 2. Fetch Customer Orders (Filtered strictly by logged-in customer's user.id)
      try {
        const userOrders = await getUserOrders(supabase, user.id)
        setOrders(userOrders || [])
      } catch (orderErr) {
        console.error('Error fetching orders:', orderErr)
      } finally {
        setOrdersLoading(false)
      }

      // 3. Fetch Customer Addresses
      try {
        const { data: addrData, error: addrError } = await supabase
          .from('addresses')
          .select('*')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })

        if (addrError) throw addrError
        setAddresses(addrData || [])
      } catch (addrErr) {
        console.error('Error fetching addresses:', addrErr)
      } finally {
        setAddressesLoading(false)
      }
    } catch (err: any) {
      console.error('Error fetching account data:', err)
      toast.error('Failed to load account details')
    }
  }, [reset, router])

  useEffect(() => {
    fetchAccountData()
  }, [fetchAccountData])

  const onProfileSubmit = async (data: Partial<Profile>) => {
    setProfileLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await updateProfileContactInfo(supabase, user.id, data.full_name || null, data.phone || null)

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: data.full_name || null,
              phone: data.phone || null,
            }
          : null
      )
      toast.success('Profile contact info updated!')
    } catch (err: any) {
      toast.error(err.message || 'Profile update failed')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      toast.error('Sign out failed')
    }
  }

  // Address validation
  const validateAddressForm = (): boolean => {
    const errors: Partial<Record<keyof AddressFormFields, string>> = {}
    if (!addressForm.full_name.trim()) errors.full_name = 'Full name is required'
    if (!addressForm.phone.trim()) errors.phone = 'Phone number is required'
    if (!addressForm.address_line1.trim()) errors.address_line1 = 'Address line 1 is required'
    if (!addressForm.city.trim()) errors.city = 'City is required'
    if (!addressForm.state.trim()) errors.state = 'State is required'

    if (!addressForm.pincode.trim()) {
      errors.pincode = 'Pincode is required'
    } else if (!/^[0-9]{6}$/.test(addressForm.pincode.trim())) {
      errors.pincode = 'Pincode must be exactly 6 digits'
    }

    setAddressFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAddressForm()) return

    setAddressSubmitLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (editingAddressId) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            full_name: addressForm.full_name.trim(),
            phone: addressForm.phone.trim(),
            address_line1: addressForm.address_line1.trim(),
            address_line2: addressForm.address_line2.trim() || null,
            city: addressForm.city.trim(),
            state: addressForm.state.trim(),
            pincode: addressForm.pincode.trim(),
            country: addressForm.country || 'India',
            is_default: addressForm.is_default,
          })
          .eq('id', editingAddressId)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Address updated successfully!')
      } else {
        // Insert new address
        if (addressForm.is_default) {
          await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
        }

        const { error } = await supabase.from('addresses').insert({
          user_id: user.id,
          full_name: addressForm.full_name.trim(),
          phone: addressForm.phone.trim(),
          address_line1: addressForm.address_line1.trim(),
          address_line2: addressForm.address_line2.trim() || null,
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pincode: addressForm.pincode.trim(),
          country: addressForm.country || 'India',
          is_default: addresses.length === 0 ? true : addressForm.is_default,
        })

        if (error) throw error
        toast.success('Address added!')
      }

      // Refresh list
      const { data: updatedAddrs } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      setAddresses(updatedAddrs || [])
      setIsAddressFormOpen(false)
      setEditingAddressId(null)
      setAddressForm(initialAddressState)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address')
    } finally {
      setAddressSubmitLoading(false)
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id)
    setAddressForm({
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      is_default: address.is_default,
    })
    setIsAddressFormOpen(true)
    setAddressFormErrors({})
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('addresses').delete().eq('id', addressId)
      if (error) throw error
      toast.success('Address deleted!')
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId))
    } catch (err: any) {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefaultAddress = async (address: Address) => {
    try {
      const supabase = createClient()
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', address.user_id)
      const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', address.id)
      if (error) throw error
      toast.success('Default address updated')
      setAddresses((prev) =>
        prev
          .map((addr) =>
            addr.id === address.id ? { ...addr, is_default: true } : { ...addr, is_default: false }
          )
          .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
      )
    } catch (err: any) {
      toast.error('Failed to update default address')
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 py-8 sm:py-12 select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7F1D1D] text-white flex items-center justify-center font-black text-xl shadow-md">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {profile?.full_name ? `Welcome back, ${profile.full_name}` : 'My Account'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">{profile?.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {profile?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-red-200 text-[#B91C1C]">
                  <Shield className="w-3.5 h-3.5 mr-1.5" /> Admin Panel
                </Button>
              </Link>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto hide-scrollbar pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#B91C1C] text-[#B91C1C]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History</span>
            {orders.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-red-100 text-[#B91C1C]">
                {orders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'border-[#B91C1C] text-[#B91C1C]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
            {addresses.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-gray-100 text-gray-600">
                {addresses.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#B91C1C] text-[#B91C1C]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
        </div>

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 h-40 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-gray-900 mb-2">No orders placed yet</h3>
                <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed">
                  You haven&apos;t placed any orders with this account yet. Browse our selection of gourmet nuts, fresh dry fruits, and aromatic spices!
                </p>
                <Link href="/products">
                  <Button variant="primary" size="md" className="rounded-xl font-bold">
                    Start Shopping <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                  const StatusIcon = statusCfg.icon
                  const itemsCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
                  const isOnline = order.payment_method === 'online'

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-150 hover:border-gray-300 hover:shadow-md transition-all space-y-4 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Top Header: Order ID, Date & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-black text-gray-900 text-sm sm:text-base">
                              Order #{order.order_number}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                            Placed on{' '}
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        {/* Total Amount */}
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-medium">Total Amount</p>
                          <p className="font-heading font-black text-base sm:text-lg text-[#B91C1C]">
                            {formatPrice(order.total_amount)}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Items List preview */}
                      <div className="space-y-2 py-1">
                        {order.items?.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-gray-500 shrink-0">{item.quantity}x</span>
                              <span className="font-medium text-gray-800 truncate">{item.product_name}</span>
                              {item.variant_name && (
                                <span className="text-xs text-gray-400 shrink-0">({item.variant_name})</span>
                              )}
                            </div>
                            <span className="font-semibold text-gray-700 shrink-0 ml-4">
                              {formatPrice(item.total_price)}
                            </span>
                          </div>
                        ))}
                        {order.items && order.items.length > 3 && (
                          <p className="text-xs text-[#B91C1C] font-semibold pt-1">
                            + {order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}
                          </p>
                        )}
                      </div>

                      {/* Bottom Footer: Payment Method, Payment Status & Details Trigger */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-600 font-medium">
                          {/* Payment method */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-700">
                            <CreditCard className="w-3 h-3 text-gray-500" />
                            {isOnline ? 'Online (PayU)' : 'Cash on Delivery'}
                          </span>

                          {/* Payment status */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              order.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.payment_status === 'failed'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            Payment: {order.payment_status?.toUpperCase()}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#B91C1C] hover:text-[#991B1B] hover:underline"
                        >
                          <span>View Complete Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h2 className="font-heading font-bold text-gray-900 text-lg">Shipping Addresses</h2>
                  <p className="text-xs text-gray-400">Manage where your Crazilo snacks and spices are delivered</p>
                </div>

                {!isAddressFormOpen && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingAddressId(null)
                      setAddressForm(initialAddressState)
                      setIsAddressFormOpen(true)
                      setAddressFormErrors({})
                    }}
                    className="rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Address
                  </Button>
                )}
              </div>

              {/* Form to Add / Edit Address */}
              {isAddressFormOpen && (
                <form onSubmit={handleAddressSubmit} className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/60 mb-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-2">
                    <h3 className="font-heading font-bold text-gray-900 text-sm">
                      {editingAddressId ? 'Edit Address' : 'Add New Shipping Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressFormOpen(false)
                        setEditingAddressId(null)
                        setAddressForm(initialAddressState)
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Name"
                      value={addressForm.full_name}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, full_name: e.target.value }))}
                      error={addressFormErrors.full_name}
                      placeholder="e.g. John Doe"
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                      error={addressFormErrors.phone}
                      placeholder="10-digit mobile number"
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Address Line 1"
                        value={addressForm.address_line1}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, address_line1: e.target.value }))}
                        error={addressFormErrors.address_line1}
                        placeholder="Flat / House No., Building Name, Street"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Address Line 2 (Optional)"
                        value={addressForm.address_line2}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, address_line2: e.target.value }))}
                        placeholder="Landmark, Area, Sector"
                      />
                    </div>
                    <Input
                      label="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                      error={addressFormErrors.city}
                      placeholder="e.g. Mumbai"
                    />
                    <Input
                      label="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                      error={addressFormErrors.state}
                      placeholder="e.g. Maharashtra"
                    />
                    <Input
                      label="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, pincode: e.target.value }))}
                      error={addressFormErrors.pincode}
                      placeholder="6-digit pincode"
                    />
                    <Input
                      label="Country"
                      value={addressForm.country}
                      disabled
                      placeholder="India"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_default_checkbox"
                      checked={addressForm.is_default}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, is_default: e.target.checked }))}
                      className="rounded accent-[#B91C1C] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="is_default_checkbox" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Make this my default shipping address
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAddressFormOpen(false)
                        setEditingAddressId(null)
                        setAddressForm(initialAddressState)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" loading={addressSubmitLoading} className="rounded-xl font-bold">
                      {editingAddressId ? 'Save Changes' : 'Add Address'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Address Cards Grid */}
              {addressesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-5 h-36 animate-pulse" />
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-600">No saved addresses yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add a shipping address for faster one-click checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-2xl p-5 border transition-all ${
                        addr.is_default
                          ? 'border-[#B91C1C]/40 bg-red-50/20 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {addr.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-[#B91C1C] mb-2">
                          <Check className="w-3 h-3" /> Default Address
                        </span>
                      )}

                      <h4 className="font-heading font-bold text-gray-900 text-sm">{addr.full_name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>
                      <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                        {addr.address_line1}
                        {addr.address_line2 && `, ${addr.address_line2}`}
                        <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>

                      <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100 text-xs">
                        {!addr.is_default ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr)}
                            className="text-[#B91C1C] font-semibold hover:underline text-[11px]"
                          >
                            Set as default
                          </button>
                        ) : <div />}

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEditAddress(addr)}
                            className="text-gray-500 hover:text-gray-900 font-semibold inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-gray-400 hover:text-red-600 font-semibold inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-xl">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h2 className="font-heading font-bold text-gray-900 text-lg">Personal Information</h2>
                <p className="text-xs text-gray-400">Update your account name and contact number</p>
              </div>

              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                <Input
                  label="Full Name"
                  {...register('full_name')}
                  icon={<User className="w-4 h-4" />}
                  placeholder="Enter your name"
                />

                <Input
                  label="Email Address (Account ID)"
                  value={profile?.email || ''}
                  disabled
                  icon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  {...register('phone')}
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="Enter your 10-digit phone number"
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={profileLoading}
                    className="rounded-xl font-bold py-3"
                  >
                    <Save className="w-4 h-4 mr-1.5" /> Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* COMPLETE ORDER DETAILS MODAL */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedOrder(null)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="bg-[#7F1D1D] text-white p-6 sm:p-7 relative select-none">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md">
                      Order Details
                    </span>
                    <span className="text-xs text-white/80">
                      #{selectedOrder.order_number}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
                    Order #{selectedOrder.order_number}
                  </h2>
                  <p className="text-xs text-white/80 mt-1">
                    Placed on{' '}
                    {new Date(selectedOrder.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
                  {/* Status Banner */}
                  {(() => {
                    const statusCfg = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending
                    const StatusIcon = statusCfg.icon
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${statusCfg.color}`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</p>
                            <p className="text-sm font-black text-gray-900">{statusCfg.label}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Payment</p>
                          <p className={`text-xs font-black uppercase ${selectedOrder.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {selectedOrder.payment_status}
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Items List */}
                  <div>
                    <h3 className="font-heading font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">
                      Ordered Items ({selectedOrder.items?.length || 0})
                    </h3>
                    <div className="divide-y divide-gray-100 border border-gray-150 rounded-2xl overflow-hidden bg-white">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-4 text-xs sm:text-sm">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 truncate">{item.product_name}</p>
                            {item.variant_name && (
                              <p className="text-xs text-gray-400 mt-0.5">Variant: {item.variant_name}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.quantity} × {formatPrice(item.unit_price)}
                            </p>
                          </div>
                          <span className="font-black text-gray-900 shrink-0">
                            {formatPrice(item.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery & Payment Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Delivery Address */}
                    <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#B91C1C]" />
                        <span>Delivery Address</span>
                      </div>
                      {(() => {
                        const addr = selectedOrder.shipping_address as any
                        return (
                          <div className="text-xs text-gray-700 space-y-0.5 leading-relaxed">
                            <p className="font-bold text-gray-900">{addr?.full_name}</p>
                            <p>{addr?.phone}</p>
                            <p>
                              {addr?.address_line1}
                              {addr?.address_line2 && `, ${addr?.address_line2}`}
                            </p>
                            <p>
                              {addr?.city}, {addr?.state} - {addr?.pincode}
                            </p>
                            <p>{addr?.country || 'India'}</p>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Payment & Charges */}
                    <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        <CreditCard className="w-3.5 h-3.5 text-[#B91C1C]" />
                        <span>Payment Summary</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-900">{formatPrice(selectedOrder.subtotal)}</span>
                        </div>
                        {Number(selectedOrder.discount_amount) > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Discount {selectedOrder.coupon_code && `(${selectedOrder.coupon_code})`}</span>
                            <span className="font-semibold">- {formatPrice(selectedOrder.discount_amount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span className="font-semibold text-gray-900">
                            {Number(selectedOrder.shipping_amount) === 0 ? 'FREE' : formatPrice(selectedOrder.shipping_amount)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-1.5 flex justify-between font-black text-sm text-gray-900">
                          <span>Grand Total</span>
                          <span className="text-[#B91C1C]">{formatPrice(selectedOrder.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.customer_notes && (
                    <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-4 text-xs">
                      <p className="font-bold text-amber-900 uppercase tracking-wider mb-1">Customer Notes</p>
                      <p className="text-gray-700 italic">&ldquo;{selectedOrder.customer_notes}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                  <Link href="/products" onClick={() => setSelectedOrder(null)}>
                    <Button variant="primary" size="sm" className="rounded-xl font-bold">
                      Order More Items <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountClient />
    </Suspense>
  )
}
