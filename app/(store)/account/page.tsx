'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile, Address } from '@/types'
import { 
  User, Mail, Phone, Save, Shield, Plus, MapPin, 
  Trash2, Edit2, Check, X, LogOut
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { getProfileById, updateProfileContactInfo } from '@/lib/data/profiles'

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

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  
  // Address Form States
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState<AddressFormFields>(initialAddressState)
  const [addressFormErrors, setAddressFormErrors] = useState<Partial<Record<keyof AddressFormFields, string>>>({})
  const [addressSubmitLoading, setAddressSubmitLoading] = useState(false)

  const { register, handleSubmit, reset } = useForm<Partial<Profile>>()

  const fetchProfileAndAddresses = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/account')
        return
      }
      
      // Fetch Profile
      const profileData = await getProfileById(supabase, user.id)
      if (profileData) {
        setProfile(profileData)
        reset({
          full_name: profileData.full_name || user.user_metadata?.full_name || '',
          phone: profileData.phone || user.user_metadata?.phone || '',
        })
      }

      // Fetch Addresses
      const { data: addrData, error: addrError } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (addrError) throw addrError
      setAddresses(addrData || [])
    } catch (err: any) {
      console.error('Error fetching account data:', err)
      toast.error('Failed to load account details')
    } finally {
      setAddressesLoading(false)
    }
  }, [reset, router])

  useEffect(() => {
    fetchProfileAndAddresses()
  }, [fetchProfileAndAddresses])

  const onProfileSubmit = async (data: Partial<Profile>) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await updateProfileContactInfo(supabase, user.id, data.full_name || null, data.phone || null)
      
      // Update local state
      setProfile(prev => prev ? { ...prev, full_name: data.full_name || null, phone: data.phone || null } : null)
      toast.success('Profile contact info updated!')
    } catch (err: any) {
      toast.error(err.message || 'Profile update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      toast.error('Logout failed')
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
    
    // Indian pincode check (6 digits)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // If the new/edited address is default, reset other defaults first
      if (addressForm.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
      }

      if (editingAddressId) {
        // Update Address
        const { error } = await supabase
          .from('addresses')
          .update({
            full_name: addressForm.full_name,
            phone: addressForm.phone,
            address_line1: addressForm.address_line1,
            address_line2: addressForm.address_line2 || null,
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode,
            country: addressForm.country,
            is_default: addressForm.is_default,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAddressId)

        if (error) throw error
        toast.success('Address updated!')
      } else {
        // Insert Address
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            full_name: addressForm.full_name,
            phone: addressForm.phone,
            address_line1: addressForm.address_line1,
            address_line2: addressForm.address_line2 || null,
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode,
            country: addressForm.country,
            is_default: addresses.length === 0 ? true : addressForm.is_default // make first address default
          })

        if (error) throw error
        toast.success('New address added!')
      }

      // Reset state and fetch again
      setIsAddressFormOpen(false)
      setEditingAddressId(null)
      setAddressForm(initialAddressState)
      
      // Refresh list
      const { data: addrData } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
      setAddresses(addrData || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address')
    } finally {
      setAddressSubmitLoading(false)
    }
  }

  const handleEditAddressClick = (address: Address) => {
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
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)

      if (error) throw error
      toast.success('Address deleted!')
      
      // Update local state
      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
    } catch (err: any) {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefaultAddress = async (address: Address) => {
    try {
      const supabase = createClient()
      
      // Set all other defaults to false
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', address.user_id)

      // Set target to true
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', address.id)

      if (error) throw error
      toast.success('Default address updated')

      // Refresh local list
      setAddresses(prev => 
        prev.map(addr => 
          addr.id === address.id 
            ? { ...addr, is_default: true } 
            : { ...addr, is_default: false }
        ).sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
      )
    } catch (err: any) {
      toast.error('Failed to update default address')
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              My Account
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your profile, shipping addresses, and preferences</p>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSignOut}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            id="account-logout-btn"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              
              {/* User Avatar Info */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-brand-red text-white flex items-center justify-center text-3xl font-extrabold shadow-md mb-4 ring-4 ring-[#FFF8F0]">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h3 className="font-heading font-bold text-gray-900 text-lg">
                  {profile?.full_name || 'User'}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">{profile?.email}</p>
                
                {profile?.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 text-xs bg-brand-red/10 text-brand-red font-bold px-3 py-1 rounded-full mt-3">
                    <Shield className="w-3.5 h-3.5" /> Admin Dashboard
                  </span>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4 pt-6">
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-gray-400 mb-2">Personal Information</h4>
                
                <Input 
                  label="Full Name" 
                  {...register('full_name')} 
                  icon={<User className="w-4 h-4" />} 
                  id="account-name" 
                />
                
                <Input 
                  label="Email (Read-only)" 
                  value={profile?.email || ''} 
                  disabled 
                  icon={<Mail className="w-4 h-4" />} 
                  id="account-email" 
                />
                
                <Input 
                  label="Phone Number" 
                  {...register('phone')} 
                  icon={<Phone className="w-4 h-4" />} 
                  id="account-phone" 
                  placeholder="Enter your phone number"
                />

                <div className="pt-2">
                  <Button type="submit" variant="primary" fullWidth loading={loading} id="save-profile-btn">
                    <Save className="w-4 h-4" /> Save Details
                  </Button>
                </div>

                {profile?.role === 'admin' && (
                  <div className="pt-2">
                    <Link href="/admin" className="block w-full">
                      <Button type="button" variant="outline" fullWidth id="go-to-admin-btn">
                        <Shield className="w-4 h-4" /> Admin Controls
                      </Button>
                    </Link>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: Address Management */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#FFF8F0] rounded-xl">
                    <MapPin className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-gray-900 text-lg">Shipping Addresses</h2>
                    <p className="text-xs text-gray-400">Add or edit your shipping destinations</p>
                  </div>
                </div>

                {!isAddressFormOpen && (
                  <Button 
                    type="button" 
                    variant="gold" 
                    size="sm" 
                    onClick={() => {
                      setEditingAddressId(null)
                      setAddressForm(initialAddressState)
                      setIsAddressFormOpen(true)
                      setAddressFormErrors({})
                    }}
                    id="add-address-btn"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </Button>
                )}
              </div>

              {/* Form to Add/Edit Address */}
              {isAddressFormOpen && (
                <form onSubmit={handleAddressSubmit} className="bg-[#FFF8F0]/30 rounded-2xl p-5 border border-amber-100/50 mb-8 space-y-4">
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
                      onChange={e => setAddressForm(prev => ({ ...prev, full_name: e.target.value }))}
                      error={addressFormErrors.full_name}
                      placeholder="e.g. Rahul Sharma"
                    />
                    <Input 
                      label="Contact Phone" 
                      value={addressForm.phone}
                      onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                      error={addressFormErrors.phone}
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>

                  <Input 
                    label="Address Line 1 (House No, Building, Street)" 
                    value={addressForm.address_line1}
                    onChange={e => setAddressForm(prev => ({ ...prev, address_line1: e.target.value }))}
                    error={addressFormErrors.address_line1}
                    placeholder="e.g. Flat 302, Maple Heights"
                  />

                  <Input 
                    label="Address Line 2 (Area, Landmark - Optional)" 
                    value={addressForm.address_line2}
                    onChange={e => setAddressForm(prev => ({ ...prev, address_line2: e.target.value }))}
                    placeholder="e.g. Near Rose Garden, Sector 4"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input 
                      label="City" 
                      value={addressForm.city}
                      onChange={e => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      error={addressFormErrors.city}
                      placeholder="e.g. New Delhi"
                    />
                    <Input 
                      label="State" 
                      value={addressForm.state}
                      onChange={e => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                      error={addressFormErrors.state}
                      placeholder="e.g. Delhi"
                    />
                    <Input 
                      label="Pincode (6-Digits)" 
                      value={addressForm.pincode}
                      onChange={e => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                      error={addressFormErrors.pincode}
                      placeholder="e.g. 110001"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="address-default-chk" 
                      checked={addressForm.is_default}
                      onChange={e => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                      className="rounded border-gray-300 text-brand-red focus:ring-brand-red w-4 h-4"
                    />
                    <label htmlFor="address-default-chk" className="text-xs font-semibold text-gray-700 select-none">
                      Set as default shipping address
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsAddressFormOpen(false)
                        setEditingAddressId(null)
                        setAddressForm(initialAddressState)
                      }}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <Button type="submit" variant="primary" size="sm" loading={addressSubmitLoading}>
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Address List */}
              {addressesLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                  <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-500">No saved addresses yet</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    Add your shipping address details to enable faster checkout on your orders.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div 
                      key={address.id}
                      className={`rounded-2xl p-5 border text-left flex flex-col justify-between transition-all ${
                        address.is_default 
                          ? 'border-brand-red/50 bg-[#B91C1C]/[0.01] shadow-sm' 
                          : 'border-gray-100 hover:border-gray-250 bg-white'
                      }`}
                    >
                      <div>
                        {/* Title Row */}
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <span className="font-heading font-black text-xs text-gray-900 truncate">
                            {address.full_name}
                          </span>
                          
                          {address.is_default ? (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-full">
                              <Check className="w-2.5 h-2.5" /> Default
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefaultAddress(address)}
                              className="flex-shrink-0 text-[10px] font-black text-[#D97706] hover:text-amber-600 transition-colors uppercase tracking-wider"
                            >
                              Set default
                            </button>
                          )}
                        </div>

                        {/* Address Details */}
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                          {address.address_line1}
                          {address.address_line2 && <span className="block">{address.address_line2}</span>}
                          <span className="block mt-0.5">{address.city}, {address.state} - {address.pincode}</span>
                          <span className="block text-gray-450 text-[10px] uppercase font-bold mt-1 tracking-wider">{address.country}</span>
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mt-3 pt-2.5 border-t border-gray-50">
                          <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span>{address.phone}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-gray-50/70 text-xs">
                        <button
                          onClick={() => handleEditAddressClick(address)}
                          className="inline-flex items-center gap-1 font-bold text-gray-500 hover:text-[#B91C1C] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="inline-flex items-center gap-1 font-bold text-gray-400 hover:text-red-650 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
