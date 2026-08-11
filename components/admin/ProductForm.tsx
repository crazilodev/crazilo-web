'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category, Product } from '@/types'
import { productSchema, ProductFormData } from '@/lib/validations/productSchema'
import { slugify } from '@/lib/utils/slugify'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUploader from './ImageUploader'
import toast from 'react-hot-toast'

interface ProductFormProps {
  product?: Product
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>(product?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const isEdit = !!product

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      short_description: product.short_description || '',
      category_id: product.category_id || null,
      price: product.price,
      compare_price: product.compare_price || undefined,
      cost_price: product.cost_price || undefined,
      sku: product.sku || '',
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      track_inventory: product.track_inventory,
      weight_grams: product.weight_grams || undefined,
      unit: product.unit,
      is_active: product.is_active,
      is_featured: product.is_featured,
      is_bestseller: product.is_bestseller,
      is_new: product.is_new,
      is_organic: product.is_organic,
      no_added_sugar: product.no_added_sugar,
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
    } : {
      is_active: true, is_featured: false, is_bestseller: false,
      is_new: false, is_organic: false, no_added_sugar: false,
      track_inventory: true, stock_quantity: 0, low_stock_threshold: 10,
      unit: 'g', tags: [],
    },
  })

  const nameValue = watch('name')

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('name')
      if (data) setCategories(data.filter((c: { slug: string }) => c.slug !== 'all'))
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue('slug', slugify(nameValue))
    }
  }, [nameValue, isEdit, setValue])

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const productData = {
        ...data,
        images: images,
        thumbnail_url: images[0] || null,
        tags,
      }

      if (isEdit) {
        const { error } = await supabase.from('products').update(productData).eq('id', product.id)
        if (error) throw error
        toast.success('Product updated successfully!')
      } else {
        const { error } = await supabase.from('products').insert(productData)
        if (error) throw error
        toast.success('Product created successfully!')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const checkboxFields = [
    { name: 'is_active' as const, label: 'Active (visible in store)' },
    { name: 'is_featured' as const, label: 'Featured Product' },
    { name: 'is_bestseller' as const, label: 'Best Seller' },
    { name: 'is_new' as const, label: 'New Arrival' },
    { name: 'is_organic' as const, label: '🌿 Organic' },
    { name: 'no_added_sugar' as const, label: 'No Added Sugar' },
    { name: 'track_inventory' as const, label: 'Track Inventory' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Images */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Product Images</h2>
        <ImageUploader
          bucket="product-images"
          folder="products"
          images={images}
          onImagesChange={setImages}
          maxFiles={5}
        />
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Product Name *" {...register('name')} error={errors.name?.message} id="product-name" />
          </div>
          <Input label="URL Slug *" {...register('slug')} error={errors.slug?.message} id="product-slug" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select {...register('category_id')} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand" id="product-category">
              <option value="">No Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
            <textarea {...register('short_description')} rows={2} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand resize-none" placeholder="One-line summary..." id="product-short-desc" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description</label>
            <textarea {...register('description')} rows={5} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand resize-none" placeholder="Detailed product description..." id="product-description" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Selling Price (₹) *" type="number" step="0.01" {...register('price')} error={errors.price?.message} id="product-price" />
          <Input label="Compare Price (₹)" type="number" step="0.01" {...register('compare_price')} id="product-compare-price" />
          <Input label="Cost Price (₹)" type="number" step="0.01" {...register('cost_price')} id="product-cost-price" />
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="SKU" {...register('sku')} id="product-sku" />
          <Input label="Stock Quantity" type="number" {...register('stock_quantity')} error={errors.stock_quantity?.message} id="product-stock" />
          <Input label="Low Stock Alert" type="number" {...register('low_stock_threshold')} id="product-low-stock" />
          <Input label="Weight (grams)" type="number" {...register('weight_grams')} id="product-weight" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
            <select {...register('unit')} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand" id="product-unit">
              {['g', 'kg', 'ml', 'l', 'pcs', 'pack'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Tags</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Add a tag and press Enter"
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand"
            id="product-tag-input"
          />
          <button type="button" onClick={addTag} className="px-4 py-2.5 bg-brand-red text-white rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-colors">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1.5 bg-red-50 text-brand-red text-xs font-medium px-3 py-1.5 rounded-full">
              {tag}
              <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-700">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Product Flags</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {checkboxFields.map(({ name, label }) => (
            <label key={name} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" {...register(name)} className="w-4 h-4 accent-brand-red rounded" id={`product-${name}`} />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">SEO (Optional)</h2>
        <div className="space-y-4">
          <Input label="Meta Title" {...register('meta_title')} id="product-meta-title" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
            <textarea {...register('meta_description')} rows={2} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand resize-none" id="product-meta-desc" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4 sticky bottom-0 bg-gray-100 py-4 -mx-8 px-8 rounded-t-2xl shadow-lg">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="primary" size="lg" loading={loading} id="product-submit-btn">
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
