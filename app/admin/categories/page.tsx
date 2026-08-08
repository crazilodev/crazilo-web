'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PlusCircle, Edit, Trash2, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUploader from '@/components/admin/ImageUploader'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils/slugify'

interface CategoryForm {
  name: string
  slug: string
  description: string
  display_order: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, setValue, watch, reset } = useForm<CategoryForm>()
  const nameValue = watch('name')

  useEffect(() => {
    if (!editing && nameValue) setValue('slug', slugify(nameValue))
  }, [nameValue, editing, setValue])

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('*').order('display_order')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setImages(cat.image_url ? [cat.image_url] : [])
    reset({ name: cat.name, slug: cat.slug, description: cat.description || '', display_order: cat.display_order })
    setShowForm(true)
  }

  const onSubmit = async (data: CategoryForm) => {
    setSubmitting(true)
    try {
      const supabase = createClient()
      const payload = { ...data, image_url: images[0] || null }

      if (editing) {
        await supabase.from('categories').update(payload).eq('id', editing.id)
        toast.success('Category updated!')
      } else {
        await supabase.from('categories').insert({ ...payload, is_active: true })
        toast.success('Category created!')
      }

      reset(); setImages([]); setEditing(null); setShowForm(false)
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
    toast.success('Category deleted')
  }

  const toggleActive = async (cat: Category) => {
    const supabase = createClient()
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    fetchCategories()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900">Categories</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); reset(); setImages([]) }} variant="primary">
          <PlusCircle className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Category'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
          <h2 className="font-heading font-bold text-xl mb-5">{editing ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name *" {...register('name', { required: true })} id="cat-name" />
              <Input label="Slug *" {...register('slug', { required: true })} id="cat-slug" />
              <Input label="Description" {...register('description')} id="cat-desc" />
              <Input label="Display Order" type="number" {...register('display_order')} id="cat-order" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Category Image</p>
              <ImageUploader bucket="category-images" folder="categories" images={images} onImagesChange={setImages} maxFiles={1} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={submitting} id="cat-submit">
                {editing ? 'Update' : 'Create'} Category
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); reset() }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full data-table">
          <thead><tr>
            <th className="px-5 py-3 text-left">Name</th>
            <th className="px-5 py-3 text-left">Slug</th>
            <th className="px-5 py-3 text-left">Order</th>
            <th className="px-5 py-3 text-left">Status</th>
            <th className="px-5 py-3 text-left">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="skeleton h-5 rounded" /></td></tr>
              ))
            ) : categories.map(cat => (
              <tr key={cat.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-sm">{cat.name}</td>
                <td className="px-5 py-3 text-sm text-gray-500 font-mono">{cat.slug}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{cat.display_order}</td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleActive(cat)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.is_active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
