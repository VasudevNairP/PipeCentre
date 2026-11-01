import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { createServerClient } from '@/lib/supabase-server'

export const revalidate = 0

export default async function AdminStockLogPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: movements } = await supabase
    .from('stock_movements')
    .select('*, product:products(name, unit), profile:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar userEmail={session?.user?.email} />
      <main className="flex-1 p-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Stock Movement History</h1>
          <p className="text-gray-500 text-sm mt-0.5">Audit log of all stock additions, deductions, and adjustments</p>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(movements || []).map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {m.product?.name || 'Deleted Product'}
                    </td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap">
                      <span className={m.delta > 0 ? 'text-green-600' : 'text-red-600'}>
                        {m.delta > 0 ? `+${m.delta}` : m.delta} {m.product?.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.reason}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {m.profile?.full_name || 'Admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
