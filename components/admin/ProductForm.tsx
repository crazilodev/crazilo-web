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
import { createProductAction, updateProductAction } from '@/app/admin/products/actions'
import { AlertCircle, Plus } from 'lucide-react'

interface ProductFormProps {
  product?: Product
}

interface Variant {
  id?: string
  name: string
  sku?: string | null
  price: number
  compare_price?: number | null
  stock_quantity: number
  weight_grams?: number | null
  display_order: number
  is_active: boolean
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>(product?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const isEdit = !!product

  // Product variants state
  const [variants, setVariants] = useState<Variant[]>(
    (product as any)?.variants || []
  )

  // Local state for the "new variant" drawer/inputs
  const [newVarName, setNewVarName] = useState('')
  const [newVarSku, setNewVarSku] = useState('')
  const [newVarPrice, setNewVarPrice] = useState(0)
  const [newVarStock, setNewVarStock] = useState(0)
  const [newVarWeight, setNewVarWeight] = useState(0)

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
      if (data) setCategories(data)
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

  // Adding variant locally
  const handleAddVariant = () => {
    if (!newVarName.trim()) {
      toast.error('Variant name is required')
      return
    }
    if (newVarPrice <= 0) {
      toast.error('Variant price must be greater than zero')
      return
    }
    if (newVarStock < 0) {
      toast.error('Variant stock must be non-negative')
      return
    }

    const payload: Variant = {
      name: newVarName.trim(),
      sku: newVarSku.trim() || null,
      price: Number(newVarPrice),
      stock_quantity: Math.floor(Number(newVarStock)),
      weight_grams: newVarWeight ? Math.floor(Number(newVarWeight)) : null,
      display_order: variants.length,
      is_active: true,
    }

    setVariants([...variants, payload])
    
    // Reset variant inputs
    setNewVarName('')
    setNewVarSku('')
    setNewVarPrice(0)
    setNewVarStock(0)
    setNewVarWeight(0)
    toast.success('Variant added locally. Press Save to persist changes.')
  }

  const handleUpdateVariantField = (index: number, field: keyof Variant, value: any) => {
    setVariants(
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const productPayload = {
        ...data,
        images: images,
        thumbnail_url: images[0] || null,
        tags,
      }

      let result
      if (isEdit) {
        result = await updateProductAction(product.id, productPayload, variants)
      } else {
        result = await createProductAction(productPayload, variants)
      }

      if (result.success) {
        toast.success(isEdit ? 'Product updated successfully!' : 'Product created successfully!')
        router.push('/admin/products')
        router.refresh()
      } else {
        toast.error(result.error || 'Operation failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  // Group Categories hierarchically
  const mainCategories = categories.filter((c) => !c.parent_id)
  const subCategories = categories.filter((c) => c.parent_id)

  const checkboxFields = [
    { name: 'is_active' as const, label: 'Active (visible in store)' },
    { name: 'is_featured' as const, label: 'Featured Product' },
    { name: 'is_bestseller' as const, label: 'Best Seller' },
    { name: 'is_new' as const, label: 'New Arrival' },
    { name: 'is_organic' as const, label: 'Organic' },
    { name: 'no_added_sugar' as const, label: 'No Added Sugar' },
    { name: 'track_inventory' as const, label: 'Track Inventory' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Images */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Product Images</h2>
        <ImageUploader
          bucket="product-images"
          folder="products"
          images={images}
          onImagesChange={setImages}
          maxFiles={5}
        />
        {images.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-2">
            * The first image in the preview grid acts automatically as the catalog thumbnail.
          </p>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Product Name *" {...register('name')} error={errors.name?.message} id="product-name" />
          </div>
          <Input label="URL Slug *" {...register('slug')} error={errors.slug?.message} id="product-slug" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              {...register('category_id')}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand focus:ring-brand-red/35"
              id="product-category"
            >
              <option value="">No Category</option>
              {mainCategories.map((main) => (
                <optgroup key={main.id} label={main.name}>
                  <option value={main.id}>{main.name} (Main)</option>
                  {subCategories
                    .filter((sub) => sub.parent_id === main.id)
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        ↳ {sub.name}
                      </option>
                    ))}
                </optgroup>
              ))}
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
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Selling Price (₹) *" type="number" step="0.01" {...register('price')} error={errors.price?.message} id="product-price" />
          <Input label="Compare Price (₹)" type="number" step="0.01" {...register('compare_price')} id="product-compare-price" />
          <Input label="Cost Price (₹)" type="number" step="0.01" {...register('cost_price')} id="product-cost-price" />
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="SKU" {...register('sku')} id="product-sku" />
          <div className="relative">
            <Input
              label="Stock Quantity"
              type="number"
              disabled={isEdit}
              {...register('stock_quantity')}
              error={errors.stock_quantity?.message}
              id="product-stock"
            />
            {isEdit && (
              <p className="text-[10px] text-amber-600 mt-1 font-semibold">
                * Stock adjustments must be made through the Inventory tab.
              </p>
            )}
          </div>
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

      {/* Product Variants (New Section) */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 space-y-6">
        <div className="border-b border-gray-50 pb-4">
          <h2 className="font-heading font-bold text-xl text-gray-900">Product Variants</h2>
          <p className="text-gray-400 text-xs mt-1">
            Specify weight, sizing, and specific prices for packages. If variants exist, they override product prices and stock levels.
          </p>
        </div>

        {/* Variant Creation Inputs Row */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
          <p className="text-xs font-bold text-gray-700">Add Variant Option</p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Name (e.g. 500g Pack)"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs input-brand bg-white"
            />
            <input
              type="text"
              placeholder="SKU"
              value={newVarSku}
              onChange={(e) => setNewVarSku(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs input-brand bg-white"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={newVarPrice || ''}
              onChange={(e) => setNewVarPrice(Number(e.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs input-brand bg-white"
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={newVarStock || ''}
              onChange={(e) => setNewVarStock(Number(e.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs input-brand bg-white"
            />
            <input
              type="number"
              placeholder="Weight (grams)"
              value={newVarWeight || ''}
              onChange={(e) => setNewVarWeight(Number(e.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs input-brand bg-white"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center gap-1 bg-brand-red hover:bg-brand-red-dark text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>
        </div>

        {/* Variants Listing Table */}
        {variants.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            No variants specified for this product.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase">
                  <th className="px-4 py-3">Variant Name *</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price (₹) *</th>
                  <th className="px-4 py-3">Stock *</th>
                  <th className="px-4 py-3">Weight (g)</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((v, index) => (
                  <tr key={index} className="hover:bg-gray-50/20">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleUpdateVariantField(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white input-brand focus:ring-1 focus:ring-brand-red/35"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={v.sku || ''}
                        onChange={(e) => handleUpdateVariantField(index, 'sku', e.target.value || null)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white input-brand"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => handleUpdateVariantField(index, 'price', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white input-brand"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={v.stock_quantity}
                        disabled={!!v.id}
                        onChange={(e) => handleUpdateVariantField(index, 'stock_quantity', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white input-brand disabled:bg-gray-100 disabled:cursor-not-allowed"
                        title={v.id ? "Stock quantity of existing variants can only be updated in the Inventory tab." : ""}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={v.weight_grams || ''}
                        onChange={(e) => handleUpdateVariantField(index, 'weight_grams', e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white input-brand"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={v.is_active}
                        onChange={(e) => handleUpdateVariantField(index, 'is_active', e.target.checked)}
                        className="w-4 h-4 accent-brand-red rounded"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
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
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
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
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
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
      <div className="flex items-center justify-end gap-4 sticky bottom-0 bg-gray-50 border-t border-gray-100 py-4 -mx-8 px-8 rounded-t-2xl shadow-lg z-[90]">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="primary" size="lg" loading={loading} id="product-submit-btn">
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
