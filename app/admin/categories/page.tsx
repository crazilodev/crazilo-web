'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Edit, Trash2, Search, CornerDownRight, Folder, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUploader from '@/components/admin/ImageUploader'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils/slugify'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import StatusBadge from '@/components/admin/StatusBadge'
import { categorySchema, CategoryFormData } from '@/lib/validations/categorySchema'
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/admin/categories/actions'
import Image from 'next/image'

type CategoryTreeItem = Category & {
  isSub?: boolean
  parentName?: string
  products?: { count: number }[]
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deletingCat, setDeletingCat] = useState<Category | null>(null)
  
  // Filters and Search states
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'main' | 'sub' | 'active' | 'inactive'>('all')

  // Form states
  const [categoryType, setCategoryType] = useState<'main' | 'sub'>('main')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parent_id: '',
      sort_order: 0,
      is_active: true,
      image_url: '',
    },
  })

  const nameValue = watch('name')

  // Auto-slug generation
  useEffect(() => {
    if (!editing && nameValue) {
      setValue('slug', slugify(nameValue))
    }
  }, [nameValue, editing, setValue])

  const fetchCategories = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*, products:products(count)')
      .order('sort_order')
    
    if (error) {
      toast.error('Failed to load categories')
    } else {
      setCategories(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleEditClick = (cat: Category) => {
    setEditing(cat)
    setImages(cat.image_url ? [cat.image_url] : [])
    setCategoryType(cat.parent_id ? 'sub' : 'main')
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parent_id: cat.parent_id || '',
      sort_order: cat.sort_order,
      is_active: cat.is_active,
      image_url: cat.image_url || '',
    })
    setShowForm(true)
  }

  // Handle category type change in form
  const handleTypeChange = (type: 'main' | 'sub') => {
    setCategoryType(type)
    if (type === 'main') {
      setValue('parent_id', '')
    }
  }

  const handleImageChange = (uploadedImages: string[]) => {
    setImages(uploadedImages)
    setValue('image_url', uploadedImages[0] || '')
  }

  const onSubmit = async (data: CategoryFormData) => {
    setSubmitting(true)

    // Double check parent requirement for subcategories
    if (categoryType === 'sub' && !data.parent_id) {
      toast.error('Parent category is required for subcategories')
      setSubmitting(false)
      return
    }

    const payload = {
      ...data,
      parent_id: categoryType === 'main' ? null : data.parent_id || null,
      image_url: images[0] || null,
    }

    let result
    if (editing) {
      result = await updateCategoryAction(editing.id, payload)
    } else {
      result = await createCategoryAction(payload)
    }

    if (result.success) {
      toast.success(editing ? 'Category updated successfully!' : 'Category created successfully!')
      reset()
      setImages([])
      setEditing(null)
      setShowForm(false)
      await fetchCategories()
    } else {
      toast.error(result.error || 'Operation failed')
    }
    setSubmitting(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCat) return
    setSubmitting(true)
    const result = await deleteCategoryAction(deletingCat.id)
    
    if (result.success) {
      toast.success('Category deleted successfully')
      await fetchCategories()
    } else {
      toast.error(result.error || 'Failed to delete category')
    }
    setSubmitting(false)
    setDeletingCat(null)
  }

  const toggleActive = async (cat: Category) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id)
      
    if (error) {
      toast.error(error.message || 'Failed to update category status')
    } else {
      toast.success(`Category ${!cat.is_active ? 'activated' : 'hidden'} successfully`)
      await fetchCategories()
    }
  }

  // Hierarchical list building
  const mainCategories = categories.filter((c) => !c.parent_id)
  const subCategories = categories.filter((c) => c.parent_id)
  const availableParents = mainCategories.filter((c) => c.id !== editing?.id)

  const buildTree = (): CategoryTreeItem[] => {
    const tree: CategoryTreeItem[] = []
    mainCategories.forEach((main) => {
      tree.push(main)
      const children = subCategories.filter((sub) => sub.parent_id === main.id)
      children.forEach((child) => {
        tree.push({
          ...child,
          isSub: true,
          parentName: main.name,
        })
      })
    })

    // Handle any orphans
    const addedIds = new Set(tree.map((t) => t.id))
    categories.forEach((cat) => {
      if (!addedIds.has(cat.id)) {
        tree.push({
          ...cat,
          isSub: !!cat.parent_id,
          parentName: cat.parent_id ? categories.find((c) => c.id === cat.parent_id)?.name : undefined,
        })
      }
    })

    return tree
  }

  const treeList = buildTree()

  // Apply filters and search
  const filteredList = treeList.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.slug.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'main' && !cat.parent_id) ||
      (filterType === 'sub' && cat.parent_id) ||
      (filterType === 'active' && cat.is_active) ||
      (filterType === 'inactive' && !cat.is_active)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Manage main categories and their subcategories."
        action={
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditing(null)
              reset()
              setImages([])
              setCategoryType('main')
            }}
            variant="primary"
          >
            <PlusCircle className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Category'}
          </Button>
        }
      />

      {/* Category Creation / Editing form panel */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-150 animate-fade-in">
          <h2 className="font-heading font-bold text-xl mb-5 text-gray-900">
            {editing ? `Edit Category: ${editing.name}` : 'Create Category'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Category Type selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      checked={categoryType === 'main'}
                      onChange={() => handleTypeChange('main')}
                      className="accent-brand-red w-4 h-4"
                      disabled={!!editing && mainCategories.some((c) => c.id === editing.id && subCategories.some((sub) => sub.parent_id === c.id))}
                    />
                    Main Category
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      checked={categoryType === 'sub'}
                      onChange={() => handleTypeChange('sub')}
                      className="accent-brand-red w-4 h-4"
                      disabled={!!editing && mainCategories.some((c) => c.id === editing.id && subCategories.some((sub) => sub.parent_id === c.id))}
                    />
                    Subcategory
                  </label>
                </div>
                {editing && mainCategories.some((c) => c.id === editing.id && subCategories.some((sub) => sub.parent_id === c.id)) && (
                  <p className="text-[10px] text-amber-600 mt-1 font-medium">
                    * Cannot convert type: subcategories are currently assigned to this category.
                  </p>
                )}
              </div>

              {/* Parent category selector (Subcategories only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Parent Category {categoryType === 'sub' && '*'}
                </label>
                <select
                  {...register('parent_id')}
                  disabled={categoryType === 'main'}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand focus:ring-brand-red/35 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  id="cat-parent-select"
                >
                  <option value="">-- Select Parent Main Category --</option>
                  {availableParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
                {categoryType === 'sub' && errors.parent_id && (
                  <p className="mt-1 text-xs text-red-500">{errors.parent_id.message}</p>
                )}
              </div>

              <Input
                label="Category Name *"
                {...register('name')}
                error={errors.name?.message}
                id="cat-name-input"
              />

              <Input
                label="URL Slug *"
                {...register('slug')}
                error={errors.slug?.message}
                id="cat-slug-input"
              />

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand resize-none"
                  placeholder="Optional brief description of this category..."
                  id="cat-description"
                />
              </div>

              <Input
                label="Sort Order"
                type="number"
                {...register('sort_order')}
                error={errors.sort_order?.message}
                id="cat-order-input"
              />

              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-4 h-4 accent-brand-red rounded"
                    id="cat-active-checkbox"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Active (visible on storefront)
                  </span>
                </label>
              </div>

            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Category Banner Image</p>
              <ImageUploader
                bucket="category-images"
                folder="categories"
                images={images}
                onImagesChange={handleImageChange}
                maxFiles={1}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                  reset()
                  setImages([])
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting} id="cat-submit-btn">
                {editing ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category, subcategory..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-xs input-brand"
            id="cat-search-field"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {(['all', 'main', 'sub', 'active', 'inactive'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                filterType === t
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red'
              }`}
            >
              {t === 'all'
                ? 'All'
                : t === 'main'
                ? 'Main Categories'
                : t === 'sub'
                ? 'Subcategories'
                : t === 'active'
                ? 'Active'
                : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Categories Tree Grid Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Products Count
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-5 py-5">
                      <div className="skeleton h-6 rounded" />
                    </td>
                  </tr>
                ))
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredList.map((cat) => (
                  <tr
                    key={cat.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      cat.isSub ? 'bg-gray-50/20' : 'bg-white'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* Image Thumbnail */}
                        <div className="w-9 h-9 rounded-lg overflow-hidden relative bg-gray-100 flex-shrink-0 shadow-inner">
                          {cat.image_url ? (
                            <Image
                              src={cat.image_url}
                              alt={cat.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              {cat.isSub ? <CornerDownRight className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                            </div>
                          )}
                        </div>

                        {/* Name indented for subcategories */}
                        <div className="flex items-center min-w-0">
                          {cat.isSub && (
                            <CornerDownRight className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          )}
                          <p
                            className={`truncate leading-snug ${
                              cat.isSub
                                ? 'text-sm font-medium text-gray-600'
                                : 'text-sm font-bold text-gray-900'
                            }`}
                          >
                            {cat.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          cat.isSub
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}
                      >
                        {cat.isSub ? 'Subcategory' : 'Main'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-mono text-gray-500 truncate max-w-[140px]">
                      {cat.slug}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-gray-700">
                      {cat.products?.[0]?.count ?? 0}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500 font-mono">
                      {cat.sort_order}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(cat)}
                        className="focus:outline-none"
                      >
                        <StatusBadge status={cat.is_active ? 'Active' : 'Inactive'} type="generic" />
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50/50 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCat(cat)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors"
                          title="Delete Category"
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

      {deletingCat && (
        <ConfirmDialog
          isOpen={!!deletingCat}
          onClose={() => setDeletingCat(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${deletingCat.name}"?\n\nThis action cannot be undone and will fail if products or child subcategories are currently assigned to it.`}
          variant="danger"
          loading={submitting}
        />
      )}
    </div>
  )
}
