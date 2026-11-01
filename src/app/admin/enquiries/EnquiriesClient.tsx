'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, MessageCircle, Eye, ChevronRight } from 'lucide-react'
import type { Enquiry, EnquiryStatus } from '@/lib/types'
import { buildWhatsAppUrl } from '@/lib/utils'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

interface Props {
  initialEnquiries: Enquiry[]
  totalCount: number
  currentStatus: string
  currentPage: number
}

export function EnquiriesClient({ initialEnquiries, totalCount, currentStatus, currentPage }: Props) {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState(initialEnquiries)

  const handleStatusTab = (val: string) => {
    const url = val ? `/admin/enquiries?status=${val}` : '/admin/enquiries'
    router.push(url)
  }

  const updateStatus = async (id: string, newStatus: EnquiryStatus) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e))
      }
    } catch {}
  }

  return (
    <div>
      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 border-b border-gray-200">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleStatusTab(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              currentStatus === tab.value
                ? 'bg-brand-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {enquiries.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-base font-medium">No enquiries found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enquiries.map(enq => {
                  const cleanPhone = enq.customer_phone.replace(/\D/g, '')
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${enq.customer_name}, regarding your enquiry ${enq.reference} at Pipe Centre:`)}`

                  return (
                    <tr key={enq.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono font-medium text-xs text-gray-700">
                        {enq.reference}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{enq.customer_name}</p>
                        <p className="text-xs text-gray-400">{enq.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {enq.items?.length || 0} item(s)
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(enq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={enq.status}
                          onChange={e => updateStatus(enq.id, e.target.value as EnquiryStatus)}
                          className={`text-xs font-semibold px-2 py-1 rounded-md border-0 cursor-pointer ${STATUS_BADGE[enq.status] || 'bg-gray-100'}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`tel:${enq.customer_phone}`}
                            title="Call"
                            className="p-1.5 text-gray-400 hover:text-brand-600 rounded-md hover:bg-gray-100"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp"
                            className="p-1.5 text-gray-400 hover:text-green-600 rounded-md hover:bg-gray-100"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <Link
                            href={`/admin/enquiries/${enq.id}`}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
