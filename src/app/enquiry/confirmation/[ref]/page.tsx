import Link from 'next/link'
import { CheckCircle2, Phone, MessageCircle, Home } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SHOP_CONFIG, buildWhatsAppUrl } from '@/lib/utils'

interface Props {
  params: { ref: string }
}

export default function ConfirmationPage({ params }: Props) {
  const ref = params.ref
  const waUrl = buildWhatsAppUrl(`Hi, I just submitted an enquiry. My reference number is ${ref}. Can you confirm you received it?`)

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h1>
        <p className="text-gray-500 mb-4">Thank you. We've received your enquiry and will contact you shortly.</p>

        <div className="card p-5 mb-8 text-left">
          <p className="text-sm text-gray-500 mb-1">Your reference number</p>
          <p className="text-2xl font-bold text-brand-700 font-mono tracking-wide">{ref}</p>
          <p className="text-xs text-gray-400 mt-1">Save this number for follow-up enquiries.</p>
        </div>

        <p className="text-gray-600 mb-6">Want a quicker response? Call or WhatsApp us directly:</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a href={`tel:${SHOP_CONFIG.phone}`} className="btn-primary">
            <Phone className="w-4 h-4" /> Call {SHOP_CONFIG.phone}
          </a>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>

        <Link href="/" className="btn-ghost text-gray-600">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </main>
      <Footer />
    </>
  )
}
