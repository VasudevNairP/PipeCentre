import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ImportExportClient } from './ImportExportClient'
import { createServerClient } from '@/lib/supabase-server'

export const revalidate = 0

export default async function AdminImportExportPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar userEmail={session?.user?.email} />
      <main className="flex-1 p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Import &amp; Export</h1>
          <p className="text-gray-500 text-sm mt-0.5">Bulk manage your product catalogue using CSV files</p>
        </div>
        <ImportExportClient categories={categories || []} />
      </main>
    </div>
  )
}
