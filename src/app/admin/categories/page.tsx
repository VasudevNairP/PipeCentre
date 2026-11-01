import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { CategoriesClient } from './CategoriesClient'
import { createServerClient } from '@/lib/supabase-server'

import { DEFAULT_CATEGORIES } from '@/lib/utils'

export const revalidate = 0

export default async function AdminCategoriesPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  let categories = null
  try {
    const res = await supabase
      .from('categories')
      .select('*, parent:categories(id,name)')
      .order('sort_order')
    if (res.data && res.data.length > 0) {
      categories = res.data
    } else if (session) {
      const parents = DEFAULT_CATEGORIES.filter(c => !c.parent_id).map(({ id, name, slug, sort_order }) => ({
        id, name, slug, parent_id: null, sort_order
      }))
      await supabase.from('categories').upsert(parents)

      const children = DEFAULT_CATEGORIES.filter(c => c.parent_id).map(({ id, name, slug, parent_id, sort_order }) => ({
        id, name, slug, parent_id, sort_order
      }))
      await supabase.from('categories').upsert(children)

      const { data: seeded } = await supabase
        .from('categories')
        .select('*, parent:categories(id,name)')
        .order('sort_order')
      if (seeded && seeded.length > 0) {
        categories = seeded
      }
    }
  } catch {}

  const finalCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar userEmail={session?.user?.email} />
      <main className="flex-1 p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Categories &amp; Sub-categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">Organise products for easier customer browsing</p>
        </div>
        <CategoriesClient initialCategories={finalCategories} />
      </main>
    </div>
  )
}
