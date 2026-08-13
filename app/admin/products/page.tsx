'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PlusCircle, Search, Edit, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import Image from 'next/image'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import StatusBadge from '@/components/admin/StatusBadge'
import { deleteProductAction } from '@/app/admin/products/actions'

const FILTER_TYPES = [
  { value: 'all', label: 'All Products' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'featured', label: 'Featured' },
  { value: 'bestseller', label: 'Bestseller' },
  { value: 'new', label: 'New' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search & Filter states
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Action states
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Fetch products, joining category name and counting variants in a single query
    let query = supabase
      .from('products')
      .select('*, category:categories(name), variants:product_variants(count)')
      .order('created_at', { ascending: false })

    if (categoryFilter) {
      query = query.eq('category_id', categoryFilter)
    }

    if (search.trim()) {
      // Searches by name, slug, or SKU
      query = query.or(`name.ilike.%${search.trim()}%,slug.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%`)
    }

    // Apply client-side filters after fetch or build specific sub-queries
    // Let's retrieve all and apply subset filters in React for instant filtering
    const { data, error } = await query
    
    if (error) {
      toast.error('Failed to load products')
      setProducts([])
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }, [categoryFilter, search])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const toggleActive = async (product: Product) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (error) {
      toast.error(error.message || 'Operation failed')
    } else {
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      )
      toast.success(product.is_active ? 'Product hidden from store' : 'Product published to store')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return
    setActionLoading(true)
    
    const result = await deleteProductAction(deletingProduct.id)
    if (result.success) {
      toast.success('Product deleted successfully')
      await fetchProducts()
    } else {
      toast.error(result.error || 'Failed to delete product')
    }
    setActionLoading(false)
    setDeletingProduct(null)
  }

  // Filter lists in memory
  const getFilteredProducts = () => {
    return products.filter((p) => {
      switch (filterType) {
        case 'active':
          return p.is_active
        case 'inactive':
          return !p.is_active
        case 'featured':
          return p.is_featured
        case 'bestseller':
          return p.is_bestseller
        case 'new':
          return p.is_new
        case 'in_stock':
          return !p.track_inventory || p.stock_quantity > 0
        case 'low_stock':
          return p.track_inventory && p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
        case 'out_of_stock':
          return p.track_inventory && p.stock_quantity === 0
        default:
          return true
      }
    })
  }

  const filteredProducts = getFilteredProducts()

  // Category listing structure for selector
  const mainCategories = categories.filter((c) => !c.parent_id)
  const subCategories = categories.filter((c) => c.parent_id)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Products"
        description="Add, edit, structure variants, and publish products in the shop catalog."
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md hover:shadow-lg focus:outline-none"
          >
            <PlusCircle className="w-4 h-4" /> Add Product
          </Link>
        }
      />

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU, slug..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-xs input-brand focus:ring-brand-red/35"
            id="admin-product-search-input"
          />
        </div>

        {/* Category selector filter */}
        <div className="max-w-xs flex-1">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs input-brand focus:ring-brand-red/35"
            id="admin-product-category-filter"
          >
            <option value="">All Categories</option>
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

        {/* Type status filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {FILTER_TYPES.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filterType === f.value
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}      {/* Catalog Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Inventory
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-5">
                      <div className="skeleton h-10 rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No products matching current selection.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const variantCount = (product as any).variants?.[0]?.count || 0

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Product details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gray-50 shadow-inner flex-shrink-0">
                            {product.thumbnail_url ? (
                              <Image
                                src={product.thumbnail_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-[10px]">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {product.sku || 'No SKU'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {(product.category as any)?.name || 'Uncategorized'}
                      </td>

                      {/* Pricing */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-semibold text-brand-red text-sm">
                            {formatPrice(product.price)}
                          </p>
                          {product.compare_price && (
                            <p className="text-[10px] text-gray-400 line-through">
                              {formatPrice(product.compare_price)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Inventory / Variants status */}
                      <td className="px-4 py-3.5">
                        {variantCount > 0 ? (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                            {variantCount} Variant{variantCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {product.track_inventory && product.stock_quantity <= product.low_stock_threshold && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span
                              className={`text-sm font-semibold ${
                                !product.track_inventory
                                  ? 'text-gray-500'
                                  : product.stock_quantity === 0
                                  ? 'text-red-500 font-bold'
                                  : product.stock_quantity <= product.low_stock_threshold
                                  ? 'text-amber-600 font-bold'
                                  : 'text-gray-700'
                              }`}
                            >
                              {product.track_inventory ? product.stock_quantity : '∞'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Badges / Flags */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {product.is_featured && (
                            <span className="text-[8px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 px-1.5 py-0.5 rounded uppercase">
                              Featured
                            </span>
                          )}
                          {product.is_bestseller && (
                            <span className="text-[8px] font-bold bg-purple-50 text-purple-700 border border-purple-200/50 px-1.5 py-0.5 rounded uppercase">
                              Bestseller
                            </span>
                          )}
                          {product.is_new && (
                            <span className="text-[8px] font-bold bg-blue-50 text-blue-700 border border-blue-200/50 px-1.5 py-0.5 rounded uppercase">
                              New
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => toggleActive(product)}
                          className="focus:outline-none"
                        >
                          <StatusBadge status={product.is_active ? 'Active' : 'Inactive'} type="generic" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-lg transition-colors"
                            title="View in Storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => toggleActive(product)}
                            className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors"
                            title={product.is_active ? 'Hide Product' : 'Show Product'}
                          >
                            {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50/50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 text-gray-400 hover:text-red-650 hover:bg-red-50/50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="md:hidden divide-y divide-gray-100 p-4 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))
          ) : filteredProducts.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">
              No products matching current selection.
            </p>
          ) : (
            filteredProducts.map((product) => {
              const variantCount = (product as any).variants?.[0]?.count || 0
              const isLowStock = product.track_inventory && product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0
              const isOutOfStock = product.track_inventory && product.stock_quantity === 0

              return (
                <div key={product.id} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 text-xs">
                  {/* Top Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-white border border-gray-100 flex-shrink-0">
                      {product.thumbnail_url ? (
                        <Image src={product.thumbnail_url} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">
                          No Img
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{product.sku || 'No SKU'}</p>
                    </div>
                  </div>

                  {/* Middle Specs grid */}
                  <div className="grid grid-cols-2 gap-2.5 border-t border-b border-gray-100 py-3 my-1 text-gray-600">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Category</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{(product.category as any)?.name || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Price</p>
                      <p className="font-semibold text-brand-red mt-0.5">{formatPrice(product.price)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">Inventory</p>
                      <div className="mt-0.5">
                        {variantCount > 0 ? (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {variantCount} Var
                          </span>
                        ) : (
                          <span className={`font-semibold ${isOutOfStock ? 'text-red-500 font-bold' : isLowStock ? 'text-amber-600 font-bold' : 'text-gray-700'}`}>
                            {product.track_inventory ? `${product.stock_quantity} left` : '∞ unlimited'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">Status</p>
                      <button
                        onClick={() => toggleActive(product)}
                        className="mt-0.5 text-left focus:outline-none"
                      >
                        <StatusBadge status={product.is_active ? 'Active' : 'Inactive'} type="generic" />
                      </button>
                    </div>
                  </div>

                  {/* Badges/Flags */}
                  <div className="flex flex-wrap gap-1">
                    {product.is_featured && <span className="text-[8px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 px-1.5 py-0.5 rounded uppercase">Featured</span>}
                    {product.is_bestseller && <span className="text-[8px] font-bold bg-purple-50 text-purple-700 border border-purple-200/50 px-1.5 py-0.5 rounded uppercase">Bestseller</span>}
                    {product.is_new && <span className="text-[8px] font-bold bg-blue-50 text-blue-700 border border-blue-200/50 px-1.5 py-0.5 rounded uppercase">New</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end items-center gap-2 pt-2.5 border-t border-gray-100">
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="px-2.5 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-150 rounded-lg flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Store
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="px-2.5 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button
                      onClick={() => setDeletingProduct(product)}
                      className="px-2.5 py-1.5 text-[10px] font-bold text-red-650 hover:bg-red-50 border border-red-200 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {deletingProduct && (
        <ConfirmDialog
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Product"
          message={`Are you sure you want to delete "${deletingProduct.name}"?\n\nThis will completely delete the product and its variants. If orders are linked to this product, the operation will fail and you should set the status to "Inactive" instead.`}
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  )
}
