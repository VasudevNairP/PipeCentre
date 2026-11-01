import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ProductForm } from '../ProductForm'
import { createServerClient } from '@/lib/supabase-server'
import { DEFAULT_CATEGORIES } from '@/lib/utils'
import type { Category } from '@/lib/types'

export const revalidate = 0

export default async function NewProductPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  let categories: Category[] = []
  try {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
    if (data && data.length > 0) {
      categories = data
    } else if (session) {
      const parents = DEFAULT_CATEGORIES.filter(c => !c.parent_id).map(({ id, name, slug, sort_order }) => ({
        id, name, slug, parent_id: null, sort_order
      }))
      await supabase.from('categories').upsert(parents)

      const children = DEFAULT_CATEGORIES.filter(c => c.parent_id).map(({ id, name, slug, parent_id, sort_order }) => ({
        id, name, slug, parent_id, sort_order
      }))
      await supabase.from('categories').upsert(children)

      const { data: seeded } = await supabase.from('categories').select('*').order('sort_order')
      if (seeded && seeded.length > 0) {
        categories = seeded
      }
    }
  } catch {}

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
        <ProductForm categories={categories || []} />
      </main>
    </div>
  )
}
