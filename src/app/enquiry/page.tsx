'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, Phone, Send, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useCart } from '@/lib/cart-context'
import { formatPrice, SHOP_CONFIG, buildWhatsAppUrl, generateReference } from '@/lib/utils'

const schema = z.object({
  customer_name: z.string().min(2, 'Please enter your name'),
  customer_phone: z.string().min(10, 'Please enter a valid phone number'),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  note: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function EnquiryPage() {
  const { items, updateQty, removeItem, clearCart } = useCart()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      const reference = generateReference()
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items, reference }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Submission failed')
      clearCart()
      router.push(`/enquiry/confirmation/${reference}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const buildWhatsAppMessage = () => {
    const lines = [
      `Hello ${SHOP_CONFIG.name}!`,
      `I'd like to enquire about the following items:`,
      '',
      ...items.map(i => `• ${i.product_name} — Qty: ${i.qty} ${i.unit}${i.product_price ? ` (₹${i.product_price}/${i.unit})` : ''}`),
      '',
      `Please let me know the total price and availability.`,
    ]
    const vals = getValues()
    if (vals.customer_name) lines.push(`\nName: ${vals.customer_name}`)
    if (vals.note) lines.push(`Note: ${vals.note}`)
    return buildWhatsAppUrl(lines.join('\n'))
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your enquiry list is empty</h1>
          <p className="text-gray-500 mb-6">Browse our catalogue and add items you're interested in.</p>
          <Link href="/catalogue" className="btn-primary">Browse Catalogue</Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Your Enquiry List</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Items */}
          <div className="lg:col-span-3 space-y-3">
            {items.map(item => (
              <div key={item.product_id} className="card p-4 flex gap-4">
                {item.image && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    <Image src={item.image} alt={item.product_name} fill className="object-contain p-1" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</p>
                  <p className="text-brand-600 font-bold text-sm mt-0.5">
                    {formatPrice(item.product_price)} <span className="text-gray-400 font-normal">/{item.unit}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.product_id, item.qty - 1)}
                      className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product_id, item.qty + 1)}
                      className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-red-400 hover:text-red-600 p-1 self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Quick actions */}
            <div className="flex gap-3 pt-2">
              <a
                href={buildWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> Send via WhatsApp
              </a>
              <a
                href={`tel:${SHOP_CONFIG.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
              >
                <Phone className="w-5 h-5" /> Call Us
              </a>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Submit Enquiry</h2>

              <div className="space-y-3">
                <div>
                  <label className="label">Your Name *</label>
                  <input {...register('customer_name')} className="input" placeholder="Ramesh Kumar" />
                  {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>}
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input {...register('customer_phone')} className="input" placeholder="+91 98765 43210" type="tel" />
                  {errors.customer_phone && <p className="text-red-500 text-xs mt-1">{errors.customer_phone.message}</p>}
                </div>
                <div>
                  <label className="label">Email (optional)</label>
                  <input {...register('customer_email')} className="input" placeholder="email@example.com" type="email" />
                  {errors.customer_email && <p className="text-red-500 text-xs mt-1">{errors.customer_email.message}</p>}
                </div>
                <div>
                  <label className="label">Additional Note (optional)</label>
                  <textarea {...register('note')} className="input resize-none" rows={3} placeholder="Delivery address, preferred brand, delivery date, etc." />
                </div>
              </div>

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full mt-4"
              >
                {submitting ? 'Submitting…' : <><Send className="w-4 h-4" /> Submit Enquiry</>}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                We'll contact you within a few hours to confirm prices and availability.
              </p>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
