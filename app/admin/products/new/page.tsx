import ProductForm from '@/components/admin/ProductForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
      <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>
      <ProductForm />
    </div>
  )
}
