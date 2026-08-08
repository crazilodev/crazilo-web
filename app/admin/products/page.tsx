'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Search, Edit, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProducts = async () => {
    const supabase = createClient()
    let query = supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false })
    if (search) query = query.ilike('name', `%${search}%`)
    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [search])

  const toggleActive = async (product: Product) => {
    const supabase = createClient()
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
    toast.success(product.is_active ? 'Product hidden from store' : 'Product published to store')
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { toast.error('Delete failed'); setDeleting(null); return }
    setProducts(products.filter(p => p.id !== id))
    toast.success('Product deleted')
    setDeleting(null)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} total products</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md">
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm input-brand"
          id="admin-product-search"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td colSpan={6} className="px-4 py-4"><div className="skeleton h-8 rounded-lg" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No products found</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {product.thumbnail_url ? (
                            <Image src={product.thumbnail_url} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                          ) : <div className="w-full h-full bg-gray-100" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{product.sku || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{(product.category as any)?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-brand-red text-sm">{formatPrice(product.price)}</p>
                        {product.compare_price && <p className="text-xs text-gray-400 line-through">{formatPrice(product.compare_price)}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {product.stock_quantity <= (product.low_stock_threshold || 10) && product.track_inventory && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${product.stock_quantity === 0 ? 'text-red-500' : product.stock_quantity <= (product.low_stock_threshold || 10) ? 'text-amber-600' : 'text-gray-700'}`}>
                          {product.track_inventory ? product.stock_quantity : '∞'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/products/${product.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View in store">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => toggleActive(product)} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title={product.is_active ? 'Hide' : 'Show'}>
                          {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          disabled={deleting === product.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
