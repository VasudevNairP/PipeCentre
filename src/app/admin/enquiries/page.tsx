import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { EnquiriesClient } from './EnquiriesClient'
import { createServerClient } from '@/lib/supabase-server'

export const revalidate = 0

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const status = searchParams.status || ''
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('enquiries')
    .select('*, items:enquiry_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)

  const { data: enquiries, count } = await query

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar userEmail={session?.user?.email} />
      <main className="flex-1 p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Customer Enquiries</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage and respond to customer requests</p>
        </div>
        <EnquiriesClient
          initialEnquiries={enquiries || []}
          totalCount={count || 0}
          currentStatus={status}
          currentPage={page}
        />
      </main>
    </div>
  )
}
