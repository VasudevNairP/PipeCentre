import Link from 'next/link'
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react'
import { SHOP_CONFIG, buildWhatsAppUrl } from '@/lib/utils'

export function Footer() {
  const waUrl = buildWhatsAppUrl(`Hello! I'd like to know more about your products.`)
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">PC</span>
              </div>
              <span className="text-white font-bold text-base">{SHOP_CONFIG.name}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Quality plumbing and electrical supplies for homes and businesses. Browse our catalogue or call us for the best prices.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Home</Link></li>
              <li><Link href="/catalogue" className="hover:text-brand-400 transition-colors">Catalogue</Link></li>
              <li><Link href="/enquiry" className="hover:text-brand-400 transition-colors">Enquiry List</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" />
                <span>{SHOP_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{SHOP_CONFIG.hours}</span>
              </li>
              <li>
                <a href={`tel:${SHOP_CONFIG.phone}`} className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                  <Phone className="w-4 h-4 text-brand-400" />
                  {SHOP_CONFIG.phone}
                </a>
              </li>
              <li>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400 transition-colors">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  WhatsApp us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {SHOP_CONFIG.name}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
