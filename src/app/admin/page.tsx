import Link from 'next/link'
import {
  Package, AlertTriangle, XCircle, ClipboardList,
  ArrowRight, Phone, MessageCircle
} from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { createServerClient } from '@/lib/supabase-server'
import { formatPrice, SHOP_CONFIG, buildWhatsAppUrl } from '@/lib/utils'

export const revalidate = 0

async function getDashboardData() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const [
    { count: totalProducts },
    { data: allProducts },
    { count: newEnquiriesCount },
    { data: recentEnquiries },
    { data: recentMovements },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('products').select('id, name, stock_qty, low_stock_threshold, unit, price').eq('active', true),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('enquiries').select('*, items:enquiry_items(count)').order('created_at', { ascending: false }).limit(5),
    supabase.from('stock_movements').select('*, product:products(name, unit)').order('created_at', { ascending: false }).limit(5),
  ])

  const lowStock = (allProducts || []).filter(p => p.stock_qty > 0 && p.stock_qty <= p.low_stock_threshold)
  const outOfStock = (allProducts || []).filter(p => p.stock_qty <= 0)

  return {
    userEmail: session?.user?.email,
    stats: {
      totalProducts: totalProducts || 0,
      newEnquiries: newEnquiriesCount || 0,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
    },
    lowStockItems: lowStock.slice(0, 5),
    recentEnquiries: recentEnquiries || [],
    recentMovements: recentMovements || [],
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar userEmail={data.userEmail} />

      <main className="flex-1 p-5 md:p-7 max-w-6xl">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="page-title">Dashboard</h1>
          <p className="muted mt-0.5">Welcome back to {SHOP_CONFIG.name} management</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">New Enquiries</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.stats.newEnquiries}</p>
            <Link href="/admin/enquiries?status=new" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
              View pending →
            </Link>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total Products</span>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.stats.totalProducts}</p>
            <Link href="/admin/products" className="text-xs text-gray-500 hover:underline mt-1 inline-block">
              Manage inventory →
            </Link>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Low Stock</span>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{data.stats.lowStockCount}</p>
            <span className="text-xs text-gray-400 mt-1 inline-block">Items below threshold</span>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Out of Stock</span>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">{data.stats.outOfStockCount}</p>
            <span className="text-xs text-gray-400 mt-1 inline-block">Items needing restock</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent enquiries */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Enquiries</h2>
              <Link href="/admin/enquiries" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {data.recentEnquiries.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No enquiries yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.recentEnquiries.map((enq: any) => (
                  <div key={enq.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{enq.customer_name}</p>
                      <p className="text-xs text-gray-400">{enq.customer_phone} • {enq.reference}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        enq.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        enq.status === 'completed' ? 'bg-green-100 text-green-800' :
                        enq.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {enq.status}
                      </span>
                      <Link href={`/admin/enquiries/${enq.id}`} className="text-xs text-brand-600 hover:underline">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low stock alerts */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Low Stock Alerts</h2>
              <Link href="/admin/products" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                Restock <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {data.lowStockItems.length === 0 ? (
              <p className="text-sm text-green-600 text-center py-6">All items have healthy stock levels</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.lowStockItems.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-xs text-gray-400">Threshold: {p.low_stock_threshold} {p.unit}</p>
                    </div>
                    <span className="font-bold text-sm text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-lg">
                      {p.stock_qty} {p.unit} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
