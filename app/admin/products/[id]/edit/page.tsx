import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props { params: { id: string } }

export default async function EditProductPage({ params }: Props) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
      <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
      <p className="text-gray-500 text-sm mb-8">{product.name}</p>
      <ProductForm product={product} />
    </div>
  )
}
