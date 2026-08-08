'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PlusCircle, Edit, Trash2, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Coupon } from '@/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/formatPrice'
import toast from 'react-hot-toast'

interface CouponForm {
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  minimum_order_amount: number
  maximum_discount: number
  usage_limit: number
  expires_at: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, reset, watch } = useForm<CouponForm>({
    defaultValues: { discount_type: 'percentage', minimum_order_amount: 0 }
  })
  const discountType = watch('discount_type')

  const fetchCoupons = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    setCoupons(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCoupons() }, [])

  const onSubmit = async (data: CouponForm) => {
    setSubmitting(true)
    try {
      const supabase = createClient()
      const payload = { ...data, code: data.code.toUpperCase(), is_active: true }
      if (editing) {
        await supabase.from('coupons').update(payload).eq('id', editing.id)
        toast.success('Coupon updated!')
      } else {
        await supabase.from('coupons').insert(payload)
        toast.success('Coupon created!')
      }
      reset(); setEditing(null); setShowForm(false); fetchCoupons()
    } catch (err: any) { toast.error(err.message) } finally { setSubmitting(false) }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    const supabase = createClient()
    await supabase.from('coupons').delete().eq('id', id)
    fetchCoupons()
    toast.success('Coupon deleted')
  }

  const toggleActive = async (coupon: Coupon) => {
    const supabase = createClient()
    await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id)
    fetchCoupons()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900">Coupons</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); reset() }} variant="primary">
          <PlusCircle className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Coupon'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
          <h2 className="font-heading font-bold text-xl mb-5">{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Coupon Code *" placeholder="e.g. CRAZILO10" {...register('code', { required: true })} id="coupon-code" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type</label>
                <select {...register('discount_type')} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand" id="coupon-type">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <Input label={`Discount Value (${discountType === 'percentage' ? '%' : '₹'}) *`} type="number" step="0.01" {...register('discount_value', { required: true })} id="coupon-value" />
              <Input label="Minimum Order Amount (₹)" type="number" {...register('minimum_order_amount')} id="coupon-min" />
              <Input label="Maximum Discount (₹)" type="number" {...register('maximum_discount')} id="coupon-max" />
              <Input label="Usage Limit" type="number" {...register('usage_limit')} placeholder="Leave blank for unlimited" id="coupon-limit" />
              <div className="sm:col-span-2"><Input label="Description" {...register('description')} id="coupon-desc" /></div>
              <Input label="Expires At" type="datetime-local" {...register('expires_at')} id="coupon-expires" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={submitting} id="coupon-submit">{editing ? 'Update' : 'Create'} Coupon</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset() }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full data-table">
          <thead><tr>
            <th className="px-5 py-3 text-left">Code</th>
            <th className="px-5 py-3 text-left">Discount</th>
            <th className="px-5 py-3 text-left">Min Order</th>
            <th className="px-5 py-3 text-left">Used / Limit</th>
            <th className="px-5 py-3 text-left">Expires</th>
            <th className="px-5 py-3 text-left">Status</th>
            <th className="px-5 py-3 text-left">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="skeleton h-5 rounded" /></td></tr>)
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No coupons yet</td></tr>
            ) : (
              coupons.map(coupon => (
                <tr key={coupon.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-brand-gold" />
                      <span className="font-mono font-bold text-sm text-gray-900">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-brand-red">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{formatPrice(coupon.minimum_order_amount)}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{coupon.used_count} / {coupon.usage_limit || '∞'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(coupon)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${coupon.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditing(coupon); setShowForm(true) }} className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteCoupon(coupon.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
