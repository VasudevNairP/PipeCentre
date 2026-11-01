'use client'

import { useState } from 'react'
import { Phone, MessageCircle, Save } from 'lucide-react'
import type { Enquiry, EnquiryStatus } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

export function EnquiryDetailClient({ initialEnquiry }: { initialEnquiry: Enquiry }) {
  const [enquiry, setEnquiry] = useState(initialEnquiry)
  const [status, setStatus] = useState<EnquiryStatus>(initialEnquiry.status)
  const [internalNotes, setInternalNotes] = useState(initialEnquiry.internal_notes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/enquiries/${enquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, internal_notes: internalNotes }),
      })
      if (res.ok) {
        const json = await res.json()
        setEnquiry(json.data)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  const cleanPhone = enquiry.customer_phone.replace(/\D/g, '')
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${enquiry.customer_name}, regarding your enquiry ${enquiry.reference} at Pipe Centre:`)}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-gray-400">Reference</span>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{enquiry.reference}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Received {new Date(enquiry.created_at).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`tel:${enquiry.customer_phone}`}
            className="btn-secondary"
          >
            <Phone className="w-4 h-4" /> Call
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer info */}
        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-gray-400">Customer</h2>
          <div>
            <p className="text-sm font-semibold text-gray-900">{enquiry.customer_name}</p>
            <p className="text-sm text-gray-500">{enquiry.customer_phone}</p>
            {enquiry.customer_email && <p className="text-sm text-gray-500">{enquiry.customer_email}</p>}
          </div>
          {enquiry.note && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">Customer note:</p>
              <p className="text-sm text-gray-700 italic mt-0.5">{enquiry.note}</p>
            </div>
          )}
        </div>

        {/* Status + Internal notes */}
        <div className="card p-5 md:col-span-2 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-gray-400">Manage Enquiry</h2>
          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as EnquiryStatus)}
              className="input"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed (auto-deducts stock)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">Internal Notes</label>
            <textarea
              value={internalNotes}
              onChange={e => setInternalNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Called customer, quoted ₹1,200 for 5 pipes. Waiting for confirmation."
              className="input resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Items table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Enquired Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">Price at Enquiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiry.items?.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.product_name}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{item.qty}</td>
                  <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatPrice(item.product_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
