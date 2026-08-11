'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { 
  AlertOctagon, 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  Layers, 
  History, 
  ArrowUpDown, 
  CheckCircle2, 
  User 
} from 'lucide-react'
import { 
  getInventoryOverviewAction, 
  getInventoryMovementsAction, 
  adjustInventoryAction 
} from './actions'
import toast from 'react-hot-toast'

interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string | null
  price: number
  stock_quantity: number
  is_active: boolean
  weight_grams: number | null
}

interface ProductWithVariant {
  id: string
  name: string
  slug: string
  sku: string | null
  price: number
  stock_quantity: number
  track_inventory: boolean
  low_stock_threshold: number
  category_id: string
  is_active: boolean
  categories: { name: string } | null
  product_variants: ProductVariant[]
}

interface MovementLog {
  id: string
  product_id: string | null
  variant_id: string | null
  order_id: string | null
  performed_by: string | null
  movement_type: 'sale' | 'return' | 'restock' | 'damage' | 'correction' | 'initial_stock'
  quantity: number
  stock_before: number
  stock_after: number
  reason: string | null
  note: string | null
  created_at: string
  products: { name: string } | null
  product_variants: { name: string } | null
  profiles: { full_name: string } | null
}

export default function AdminInventoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductWithVariant[]>([])
  const [movements, setMovements] = useState<MovementLog[]>([])
  const [lastMovementMap, setLastMovementMap] = useState<Record<string, { created_at: string; movement_type: string }>>({})

  // Tabs
  const [selectedTab, setSelectedTab] = useState<'matrix' | 'movements'>('matrix')

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')

  // Adjustment Modal
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false)
  const [adjustingItem, setAdjustingItem] = useState<{
    id: string
    name: string
    sku: string
    stock: number
    parentId: string
    isVariant: boolean
    track: boolean
    threshold: number
  } | null>(null)

  const [adjustmentType, setAdjustmentType] = useState<'restock' | 'damage' | 'correction'>('restock')
  const [adjustQuantity, setAdjustQuantity] = useState(1)
  const [adjustReason, setAdjustReason] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Inventory Matrix and Movements logs
  const loadData = async () => {
    setLoading(true)
    try {
      const overviewRes = await getInventoryOverviewAction()
      if (overviewRes.success && overviewRes.data) {
        setProducts(overviewRes.data.products)
        setLastMovementMap(overviewRes.data.lastMovementMap)
      } else {
        toast.error(overviewRes.error || 'Failed to load inventory matrix')
      }

      const movementsRes = await getInventoryMovementsAction(100)
      if (movementsRes.success && movementsRes.data) {
        setMovements(movementsRes.data)
      }
    } catch (err: any) {
      toast.error('An error occurred while loading inventory data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate statistics
  let totalTracked = 0
  let inStockCount = 0
  let lowStockCount = 0
  let outOfStockCount = 0

  products.forEach(p => {
    const hasVariants = p.product_variants && p.product_variants.length > 0
    if (hasVariants) {
      p.product_variants.forEach(v => {
        if (p.track_inventory) {
          totalTracked++
          if (v.stock_quantity === 0) outOfStockCount++
          else if (v.stock_quantity <= p.low_stock_threshold) lowStockCount++
          else inStockCount++
        }
      })
    } else {
      if (p.track_inventory) {
        totalTracked++
        if (p.stock_quantity === 0) outOfStockCount++
        else if (p.stock_quantity <= p.low_stock_threshold) lowStockCount++
        else inStockCount++
      }
    }
  })

  // Open adjustment modal
  const handleOpenAdjustment = (item: {
    id: string
    name: string
    sku: string
    stock: number
    parentId: string
    isVariant: boolean
    track: boolean
    threshold: number
  }) => {
    setAdjustingItem(item)
    setAdjustmentType('restock')
    setAdjustQuantity(1)
    setAdjustReason('')
    setAdjustNote('')
    setIsAdjustmentOpen(true)
  }

  // Handle Adjustment Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustingItem) return

    if (adjustQuantity <= 0) {
      toast.error('Adjustment quantity must be greater than zero')
      return
    }

    if (!adjustReason.trim()) {
      toast.error('Adjustment reason is required')
      return
    }

    let calculatedQty = adjustQuantity
    if (adjustmentType === 'damage') {
      calculatedQty = -Math.abs(adjustQuantity)
    } else if (adjustmentType === 'correction') {
      // Correction allows negative values from UI or we compute it based on sign
      calculatedQty = Number(calculatedQty)
    }

    const previewNewStock = adjustingItem.stock + calculatedQty
    if (previewNewStock < 0) {
      toast.error('Resulting stock level cannot drop below zero')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await adjustInventoryAction({
        productId: adjustingItem.isVariant ? adjustingItem.parentId : adjustingItem.id,
        variantId: adjustingItem.isVariant ? adjustingItem.id : null,
        quantity: calculatedQty,
        movementType: adjustmentType,
        reason: adjustReason.trim(),
        note: adjustNote.trim() || undefined,
      })

      if (res.success) {
        toast.success('Stock adjusted successfully!')
        setIsAdjustmentOpen(false)
        await loadData()
      } else {
        toast.error(res.error || 'Failed to adjust stock')
      }
    } catch (err: any) {
      toast.error(err.message || 'Stock adjustment failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stock status badges formatting
  const renderStatusBadge = (stock: number, track: boolean, threshold: number) => {
    if (!track) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-200 uppercase">
          Not Tracked
        </span>
      )
    }
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 uppercase">
          Out of Stock
        </span>
      )
    }
    if (stock <= threshold) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase">
          Low Stock
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
        In Stock
      </span>
    )
  }

  const renderMovementBadge = (type: string) => {
    const styles: Record<string, string> = {
      sale: 'bg-rose-50 text-rose-700 border border-rose-100',
      return: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      restock: 'bg-blue-50 text-blue-700 border border-blue-100',
      damage: 'bg-red-50 text-red-700 border border-red-100',
      correction: 'bg-amber-50 text-amber-700 border border-amber-100',
      initial_stock: 'bg-purple-50 text-purple-700 border border-purple-100',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${styles[type] || 'bg-gray-50 text-gray-700'}`}>
        {type.replace('_', ' ')}
      </span>
    )
  }

  // Filter matrix logic
  const filteredProducts = products.filter(p => {
    const hasVariants = p.product_variants && p.product_variants.length > 0
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (hasVariants && p.product_variants.some(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (v.sku && v.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      ))

    if (!matchesSearch) return false

    if (statusFilter === 'All') return true

    if (hasVariants) {
      // If parent has variants, check if any active variant matches the filter status
      return p.product_variants.some(v => {
        if (statusFilter === 'Not Tracked') return !p.track_inventory
        if (!p.track_inventory) return false
        if (statusFilter === 'Out of Stock') return v.stock_quantity === 0
        if (statusFilter === 'Low Stock') return v.stock_quantity > 0 && v.stock_quantity <= p.low_stock_threshold
        if (statusFilter === 'In Stock') return v.stock_quantity > p.low_stock_threshold
        return false
      })
    } else {
      if (statusFilter === 'Not Tracked') return !p.track_inventory
      if (!p.track_inventory) return false
      if (statusFilter === 'Out of Stock') return p.stock_quantity === 0
      if (statusFilter === 'Low Stock') return p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold
      if (statusFilter === 'In Stock') return p.stock_quantity > p.low_stock_threshold
    }
    return false
  })

  // Filter movements logic
  const filteredMovements = movements.filter(m => {
    const prodName = m.products?.name || ''
    const varName = m.product_variants?.name || ''
    const matchesSearch = 
      prodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      varName.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (typeFilter === 'All') return true
    return m.movement_type === typeFilter.toLowerCase().replace(' ', '_')
  })

  const previewNewStock = adjustingItem 
    ? adjustingItem.stock + (adjustmentType === 'damage' ? -Math.abs(adjustQuantity) : Number(adjustQuantity))
    : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Inventory & Stock Alerts"
        description="Monitor product stock levels, view low inventory alerts, and perform manual stock updates."
      />

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tracked Lines', value: totalTracked, icon: Layers, color: 'text-indigo-500 bg-indigo-50' },
          { label: 'In Stock', value: inStockCount, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
          { label: 'Out of Stock', value: outOfStockCount, icon: AlertOctagon, color: 'text-rose-500 bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Tabs Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setSelectedTab('matrix')}
            className={`px-6 py-4 text-sm font-heading font-semibold border-b-2 transition-all flex items-center gap-2 ${selectedTab === 'matrix' ? 'border-brand-red text-brand-red bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            <Package className="w-4 h-4" /> Stock Matrix
          </button>
          <button
            onClick={() => setSelectedTab('movements')}
            className={`px-6 py-4 text-sm font-heading font-semibold border-b-2 transition-all flex items-center gap-2 ${selectedTab === 'movements' ? 'border-brand-red text-brand-red bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            <History className="w-4 h-4" /> Movements Audit Log
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={selectedTab === 'matrix' ? "Search product, SKU..." : "Search items..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none input-brand"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Filter className="w-4 h-4 text-gray-400 hidden md:block" />
            
            {selectedTab === 'matrix' ? (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full md:w-44 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red/35"
              >
                <option value="All">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Not Tracked">Not Tracked</option>
              </select>
            ) : (
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full md:w-44 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red/35"
              >
                <option value="All">All Types</option>
                <option value="Sale">Sale</option>
                <option value="Return">Return</option>
                <option value="Restock">Restock</option>
                <option value="Damage">Damage</option>
                <option value="Correction">Correction</option>
                <option value="Initial Stock">Initial Stock</option>
              </select>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : selectedTab === 'matrix' ? (
          filteredProducts.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Package}
                title="No inventory records found"
                description="Create products in the catalog editor or modify your filters/search keywords."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-center">Alert Limit</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4">Last Movement</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150/40">
                  {filteredProducts.map(p => {
                    const hasVariants = p.product_variants && p.product_variants.length > 0
                    const categoryName = p.categories?.name || 'N/A'
                    const pLastMov = lastMovementMap[`prod_${p.id}`]
                    
                    return (
                      <>
                        {/* Parent Product Row */}
                        <tr key={p.id} className={`${hasVariants ? 'bg-gray-50/20' : 'hover:bg-gray-50/20'}`}>
                          <td className="px-6 py-3 font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                            {p.name}
                          </td>
                          <td className="px-6 py-3 text-gray-500">{p.sku || '-'}</td>
                          <td className="px-6 py-3 text-gray-500">{categoryName}</td>
                          
                          {/* Stock Column */}
                          <td className="px-6 py-3 text-center">
                            {hasVariants ? (
                              <span className="text-[10px] text-gray-400 font-semibold uppercase">
                                {p.product_variants.length} Variants
                              </span>
                            ) : (
                              <span className="font-bold text-gray-900">{p.stock_quantity}</span>
                            )}
                          </td>
                          
                          {/* Alert Limit */}
                          <td className="px-6 py-3 text-center text-gray-500">
                            {hasVariants ? '-' : p.low_stock_threshold}
                          </td>
                          
                          {/* Status */}
                          <td className="px-6 py-3 text-center">
                            {hasVariants ? '-' : renderStatusBadge(p.stock_quantity, p.track_inventory, p.low_stock_threshold)}
                          </td>

                          {/* Last Movement */}
                          <td className="px-6 py-3 text-gray-400">
                            {hasVariants ? '-' : pLastMov ? (
                              <div className="flex flex-col">
                                <span className="text-gray-600 font-semibold text-[10px] uppercase">{pLastMov.movement_type}</span>
                                <span className="text-[9px]">{new Date(pLastMov.created_at).toLocaleDateString()}</span>
                              </div>
                            ) : '-'}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-3 text-right">
                            {!hasVariants && (
                              <button
                                onClick={() => handleOpenAdjustment({
                                  id: p.id,
                                  name: p.name,
                                  sku: p.sku || '-',
                                  stock: p.stock_quantity,
                                  parentId: '',
                                  isVariant: false,
                                  track: p.track_inventory,
                                  threshold: p.low_stock_threshold
                                })}
                                className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
                              >
                                Adjust Stock
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Variant Rows (Indented) */}
                        {hasVariants && p.product_variants.map(v => {
                          const vLastMov = lastMovementMap[`var_${v.id}`]
                          return (
                            <tr key={v.id} className="hover:bg-gray-50/10 bg-white">
                              <td className="pl-12 pr-6 py-2.5 text-gray-600 flex items-center gap-1.5">
                                <span className="text-gray-300">└─</span>
                                <span className="font-medium">{v.name}</span>
                              </td>
                              <td className="px-6 py-2.5 text-gray-500">{v.sku || '-'}</td>
                              <td className="px-6 py-2.5 text-gray-400">Inherited</td>
                              
                              {/* Variant Stock */}
                              <td className="px-6 py-2.5 text-center font-bold text-gray-900">
                                {v.stock_quantity}
                              </td>

                              {/* Alert Threshold */}
                              <td className="px-6 py-2.5 text-center text-gray-400">
                                {p.low_stock_threshold}
                              </td>

                              {/* Status Badge */}
                              <td className="px-6 py-2.5 text-center">
                                {renderStatusBadge(v.stock_quantity, p.track_inventory, p.low_stock_threshold)}
                              </td>

                              {/* Last Movement */}
                              <td className="px-6 py-2.5 text-gray-400">
                                {vLastMov ? (
                                  <div className="flex flex-col">
                                    <span className="text-gray-600 font-semibold text-[10px] uppercase">{vLastMov.movement_type}</span>
                                    <span className="text-[9px]">{new Date(vLastMov.created_at).toLocaleDateString()}</span>
                                  </div>
                                ) : '-'}
                              </td>

                              {/* Action */}
                              <td className="px-6 py-2.5 text-right">
                                <button
                                  onClick={() => handleOpenAdjustment({
                                    id: v.id,
                                    name: `${p.name} (${v.name})`,
                                    sku: v.sku || '-',
                                    stock: v.stock_quantity,
                                    parentId: p.id,
                                    isVariant: true,
                                    track: p.track_inventory,
                                    threshold: p.low_stock_threshold
                                  })}
                                  className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
                                >
                                  Adjust Stock
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredMovements.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={History}
                title="No stock movements logged"
                description="Manual adjustments or order status changes will list history logs here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Movement Type</th>
                    <th className="px-6 py-4 text-center">Change</th>
                    <th className="px-6 py-4 text-center">Stock Path</th>
                    <th className="px-6 py-4">Reason / Note</th>
                    <th className="px-6 py-4 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150/40">
                  {filteredMovements.map(m => {
                    const itemName = m.product_variants
                      ? `${m.products?.name || 'Unknown'} (${m.product_variants.name})`
                      : (m.products?.name || 'Unknown')
                    
                    const isPositive = m.quantity > 0
                    const quantityText = isPositive ? `+${m.quantity}` : `${m.quantity}`

                    return (
                      <tr key={m.id} className="hover:bg-gray-50/20">
                        <td className="px-6 py-3.5 text-gray-400 whitespace-nowrap">
                          {new Date(m.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-gray-800">{itemName}</td>
                        <td className="px-6 py-3.5">{renderMovementBadge(m.movement_type)}</td>
                        
                        {/* Change Quantity */}
                        <td className={`px-6 py-3.5 text-center font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {quantityText}
                        </td>

                        {/* Stock Change flow */}
                        <td className="px-6 py-3.5 text-center text-gray-500 whitespace-nowrap">
                          {m.stock_before} <span className="text-gray-300">→</span> {m.stock_after}
                        </td>

                        {/* Reason / Order Details */}
                        <td className="px-6 py-3.5 text-gray-600 max-w-xs truncate">
                          <span className="font-medium text-gray-800">{m.reason || '-'}</span>
                          {m.note && <span className="text-gray-400 block text-[10px] mt-0.5">{m.note}</span>}
                          {m.order_id && (
                            <span className="inline-block mt-1 text-[9px] bg-gray-50 text-gray-400 border border-gray-200 px-1 py-0.5 rounded font-mono">
                              Order Ref: #{m.order_id.slice(0, 8)}
                            </span>
                          )}
                        </td>

                        {/* Operator info */}
                        <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap font-medium">
                          {m.profiles?.full_name || (m.order_id ? 'Storefront System' : 'Admin')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Adjust Inventory Modal */}
      <Modal
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        title="Adjust Inventory Stock"
        size="md"
      >
        {adjustingItem && (
          <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5 text-sm">
            {/* Metadata info */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400 font-semibold uppercase">Item Name</p>
                <p className="font-bold text-gray-800 mt-0.5">{adjustingItem.name}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase">SKU Reference</p>
                <p className="font-mono font-bold text-gray-800 mt-0.5">{adjustingItem.sku}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase">Current Stock</p>
                <p className="font-bold text-gray-900 mt-0.5">{adjustingItem.stock} units</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase">Tracking Status</p>
                <p className="mt-0.5 font-bold">{adjustingItem.track ? 'Enabled' : 'Bypassed'}</p>
              </div>
            </div>

            {/* Adjustment Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Adjustment Type
              </label>
              <select
                value={adjustmentType}
                onChange={e => {
                  setAdjustmentType(e.target.value as any)
                  setAdjustQuantity(1)
                }}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none input-brand"
              >
                <option value="restock">RESTOCK (Add incoming inventory)</option>
                <option value="damage">DAMAGE (Deduct damaged/lost stock)</option>
                <option value="correction">CORRECTION (Manual stock override)</option>
              </select>
            </div>

            {/* Quantity adjustment */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Adjustment Quantity
              </label>
              <input
                type="number"
                value={adjustQuantity}
                onChange={e => setAdjustQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none input-brand"
                placeholder={adjustmentType === 'correction' ? "e.g. -2 or 5" : "e.g. 10"}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                {adjustmentType === 'restock' && "* Enter a positive number representing incoming stock."}
                {adjustmentType === 'damage' && "* Enter a positive number. It will be automatically deducted."}
                {adjustmentType === 'correction' && "* Use positive values to add stock, negative to deduct."}
              </p>
            </div>

            {/* Reason text input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Reason *
              </label>
              <input
                type="text"
                placeholder="e.g. Vendor delivery, Expired item write-off"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none input-brand"
                required
              />
            </div>

            {/* Note Optional input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Operational Note (Optional)
              </label>
              <textarea
                placeholder="Internal logistics tracking reference details..."
                value={adjustNote}
                onChange={e => setAdjustNote(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none input-brand resize-none"
              />
            </div>

            {/* Informational preview */}
            <div className="bg-gray-50 border border-dashed border-gray-200 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Stock Preview:</span>
              </div>
              <div className="text-xs font-bold text-gray-800">
                {adjustingItem.stock} <span className="text-gray-300">→</span>{' '}
                <span className={previewNewStock < 0 ? 'text-red-500' : 'text-brand-red'}>
                  {previewNewStock}
                </span>
                {previewNewStock < 0 && (
                  <span className="block text-[9px] text-red-500 font-semibold mt-0.5 text-right uppercase">
                    Invalid negative stock
                  </span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustmentOpen(false)}
                disabled={isSubmitting}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={previewNewStock < 0 || adjustQuantity <= 0}
                size="sm"
              >
                Save Adjustment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
