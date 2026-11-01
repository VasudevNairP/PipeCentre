import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ProductsClient } from './ProductsClient'
import { createServerClient } from '@/lib/supabase-server'
import { DEFAULT_CATEGORIES } from '@/lib/utils'

export const revalidate = 0

export default async function AdminProductsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  let products = null
  let categories = null

  try {
    const [pRes, cRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(id,name,slug)')
        .order('name'),
      supabase
        .from('categories')
        .select('*')
        .order('sort_order'),
    ])
    products = pRes.data
    categories = cRes.data
  } catch {}

  const finalCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar userEmail={session?.user?.email} />
      <main className="flex-1 p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products &amp; Inventory</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage catalogue items, prices, and stock levels</p>
          </div>
          <Link href="/admin/products/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
        <ProductsClient initialProducts={products || []} categories={finalCategories} />
      </main>
    </div>
  )
}
