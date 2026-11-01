import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ProductForm } from '../../ProductForm'
import { createServerClient } from '@/lib/supabase-server'
import { DEFAULT_CATEGORIES } from '@/lib/utils'
import type { Category } from '@/lib/types'

export const revalidate = 0

interface Props {
  params: { id: string }
}

export default async function EditProductPage({ params }: Props) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  let product = null
  let categories: Category[] = []

  try {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').eq('id', params.id).single(),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    product = prodRes.data
    if (catRes.data && catRes.data.length > 0) {
      categories = catRes.data
    }
  } catch {}

  if (!product) notFound()
  if (categories.length === 0) {
    categories = DEFAULT_CATEGORIES
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar userEmail={session?.user?.email} />
      <main className="flex-1 p-6 max-w-3xl">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
        <ProductForm initialData={product} categories={categories || []} />
      </main>
    </div>
  )
}
