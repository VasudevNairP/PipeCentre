'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, Phone } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { SHOP_CONFIG } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/enquiry', label: 'Enquiry List' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { totalCount } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">PC</span>
            </div>
            <span className="font-bold text-base text-gray-900">{SHOP_CONFIG.name}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${SHOP_CONFIG.phone}`}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <Phone className="w-4 h-4" />
              <span>Call us</span>
            </a>

            <Link href="/enquiry" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingBag className="w-6 h-6 text-gray-700" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="py-2.5 px-3 text-gray-700 hover:text-brand-600 hover:bg-orange-50 rounded-lg font-medium transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={`tel:${SHOP_CONFIG.phone}`}
              className="py-2.5 px-3 text-brand-600 font-medium flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              {SHOP_CONFIG.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
