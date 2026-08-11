'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { getSiteSettings } from '@/lib/data/content'
import { updateSiteSettingsAction } from './actions'
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Coins,
  Shield,
  FileText,
  Share2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SiteSettingsForm {
  store_name: string
  support_phone: string
  support_email: string
  support_address: string
  support_hours: string
  footer_description: string
  free_shipping_threshold: number
  currency_code: string
  instagram_url: string
  facebook_url: string
  twitter_url: string
  youtube_url: string
  privacy_policy_url: string
  terms_url: string
  returns_policy_url: string
  store_locator_url: string
  faqs_url: string
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SiteSettingsForm>({
    defaultValues: {
      store_name: 'Crazilo',
      free_shipping_threshold: 599,
      currency_code: 'INR',
    },
  })

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const data = await getSiteSettings(supabase)
      if (data) {
        reset({
          store_name: data.store_name,
          support_phone: data.support_phone || '',
          support_email: data.support_email || '',
          support_address: data.support_address || '',
          support_hours: data.support_hours || '',
          footer_description: data.footer_description || '',
          free_shipping_threshold: Number(data.free_shipping_threshold),
          currency_code: data.currency_code,
          instagram_url: data.instagram_url || '',
          facebook_url: data.facebook_url || '',
          twitter_url: data.twitter_url || '',
          youtube_url: data.youtube_url || '',
          privacy_policy_url: data.privacy_policy_url || '',
          terms_url: data.terms_url || '',
          returns_policy_url: data.returns_policy_url || '',
          store_locator_url: data.store_locator_url || '',
          faqs_url: data.faqs_url || '',
        })
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to retrieve site configuration')
    } finally {
      setLoading(false)
    }
  }, [reset])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const onSubmit = async (formData: SiteSettingsForm) => {
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        free_shipping_threshold: Number(formData.free_shipping_threshold),
      }
      const result = await updateSiteSettingsAction(payload)
      if (!result.success) {
        toast.error(result.error || 'Failed to save configuration settings')
      } else {
        toast.success('Site settings updated successfully!')
        // Reload details to reset dirty state
        loadSettings()
      }
    } catch (err: any) {
      toast.error(err?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Site Settings"
        description="Configure store profile attributes, customer support parameters, e-commerce variables, and global footer navigation policies."
      />

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-50 rounded" />
                <div className="h-10 bg-gray-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-12" noValidate>
          {/* Section 1: Store profile */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Store className="w-5 h-5 text-brand-red" />
              <h2 className="font-heading text-lg font-black text-gray-900">Store Profile</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="store_name" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Store Name *
                </label>
                <Input
                  id="store_name"
                  placeholder="e.g. Crazilo"
                  {...register('store_name', { required: 'Store name is required' })}
                  error={errors.store_name?.message}
                />
              </div>
              <div>
                <label htmlFor="footer_description" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Footer Description
                </label>
                <Input
                  id="footer_description"
                  placeholder="e.g. Premium dry fruits and organic spices."
                  {...register('footer_description')}
                  error={errors.footer_description?.message}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact parameters */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Phone className="w-5 h-5 text-brand-red" />
              <h2 className="font-heading text-lg font-black text-gray-900">Customer Support</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="support_phone" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Support Phone
                </label>
                <Input
                  id="support_phone"
                  placeholder="e.g. +91 98765 43210"
                  {...register('support_phone')}
                  error={errors.support_phone?.message}
                />
              </div>
              <div>
                <label htmlFor="support_email" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Support Email
                </label>
                <Input
                  id="support_email"
                  type="email"
                  placeholder="e.g. support@crazilo.com"
                  {...register('support_email')}
                  error={errors.support_email?.message}
                />
              </div>
              <div>
                <label htmlFor="support_hours" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Support Hours
                </label>
                <Input
                  id="support_hours"
                  placeholder="e.g. Mon–Sat, 9am–6pm IST"
                  {...register('support_hours')}
                  error={errors.support_hours?.message}
                />
              </div>
              <div>
                <label htmlFor="support_address" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Support Address
                </label>
                <Input
                  id="support_address"
                  placeholder="e.g. Mumbai, Maharashtra, India"
                  {...register('support_address')}
                  error={errors.support_address?.message}
                />
              </div>
            </div>
          </div>

          {/* Section 3: E-commerce Configurations */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Coins className="w-5 h-5 text-brand-red" />
              <h2 className="font-heading text-lg font-black text-gray-900">E-Commerce Configuration</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="free_shipping_threshold" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Free Shipping Threshold (₹) *
                </label>
                <Input
                  id="free_shipping_threshold"
                  type="number"
                  placeholder="599"
                  {...register('free_shipping_threshold', {
                    required: 'Shipping threshold is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Threshold must be at least 0' },
                  })}
                  error={errors.free_shipping_threshold?.message}
                />
              </div>
              <div>
                <label htmlFor="currency_code" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Currency Code *
                </label>
                <Input
                  id="currency_code"
                  placeholder="INR"
                  {...register('currency_code', { required: 'Currency code is required' })}
                  error={errors.currency_code?.message}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social media */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Share2 className="w-5 h-5 text-brand-red" />
              <h2 className="font-heading text-lg font-black text-gray-900">Social Links</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instagram_url" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Instagram Link
                </label>
                <Input
                  id="instagram_url"
                  placeholder="https://instagram.com/crazilo"
                  {...register('instagram_url')}
                  error={errors.instagram_url?.message}
                />
              </div>
              <div>
                <label htmlFor="facebook_url" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Facebook Link
                </label>
                <Input
                  id="facebook_url"
                  placeholder="https://facebook.com/crazilo"
                  {...register('facebook_url')}
                  error={errors.facebook_url?.message}
                />
              </div>
              <div>
                <label htmlFor="twitter_url" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Twitter/X Link
                </label>
                <Input
                  id="twitter_url"
                  placeholder="https://twitter.com/crazilo"
                  {...register('twitter_url')}
                  error={errors.twitter_url?.message}
                />
              </div>
              <div>
                <label htmlFor="youtube_url" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  YouTube Link
                </label>
                <Input
                  id="youtube_url"
                  placeholder="https://youtube.com/crazilo"
                  {...register('youtube_url')}
                  error={errors.youtube_url?.message}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Store policies */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <FileText className="w-5 h-5 text-brand-red" />
              <h2 className="font-heading text-lg font-black text-gray-900">Legal & Resource Links</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="privacy_policy_url" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Privacy Policy Href
                </label>
                <Input
                  id="privacy_policy_url"
                  placeholder="/privacy-policy"
                  {...register('privacy_policy_url')}
                  error={errors.privacy_policy_url?.message}
                />
              </div>
              <div>
                <label htmlFor="terms_url" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Terms of Service Href
                </label>
                <Input
                  id="terms_url"
                  placeholder="/terms-of-service"
                  {...register('terms_url')}
                  error={errors.terms_url?.message}
                />
              </div>
              <div>
                <label htmlFor="returns_policy_url" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Returns Policy Href
                </label>
                <Input
                  id="returns_policy_url"
                  placeholder="/returns-policy"
                  {...register('returns_policy_url')}
                  error={errors.returns_policy_url?.message}
                />
              </div>
              <div>
                <label htmlFor="store_locator_url" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Store Locator Href
                </label>
                <Input
                  id="store_locator_url"
                  placeholder="/store-locator"
                  {...register('store_locator_url')}
                  error={errors.store_locator_url?.message}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="faqs_url" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  FAQs Href
                </label>
                <Input
                  id="faqs_url"
                  placeholder="/faqs"
                  {...register('faqs_url')}
                  error={errors.faqs_url?.message}
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer Sticky bar */}
          <div className="sticky bottom-4 bg-white/95 backdrop-blur border border-gray-100 rounded-2xl p-4 shadow-lg flex items-center justify-between z-40">
            <div>
              {isDirty ? (
                <p className="text-xs text-amber-600 font-bold">Unsaved changes detected</p>
              ) : (
                <p className="text-xs text-gray-400 font-medium">All settings synchronized</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" size="sm" onClick={loadSettings} disabled={submitting}>
                Reset
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting}>
                Save Configuration
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
