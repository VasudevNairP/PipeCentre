import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ProductWithStatus, StockStatus, Category } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null): string {
  if (price === null) return 'Ask for price'
  return `₹${price.toLocaleString('en-IN')}`
}

export function getStockStatus(qty: number, threshold: number): StockStatus {
  if (qty <= 0) return 'out_of_stock'
  if (qty <= threshold) return 'low_stock'
  return 'in_stock'
}

export function addStockStatus<T extends { stock_qty: number; low_stock_threshold: number }>(
  product: T
): T & { stock_status: StockStatus } {
  const status = getStockStatus(product.stock_qty, product.low_stock_threshold)
  return { ...product, stock_status: status }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateReference(): string {
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PC-${dateStr}-${rand}`
}

export const SHOP_CONFIG = {
  name: 'Pipe Centre',
  phone: process.env.NEXT_PUBLIC_SHOP_PHONE || '+91 98765 43210',
  whatsapp: process.env.NEXT_PUBLIC_SHOP_WHATSAPP || '+919876543210',
  address: process.env.NEXT_PUBLIC_SHOP_ADDRESS || '123 Main Street, Bengaluru, Karnataka 560001',
  hours: process.env.NEXT_PUBLIC_SHOP_HOURS || 'Mon–Sat: 9 AM – 7 PM | Sun: 10 AM – 4 PM',
  currency: '₹',
}

export function buildWhatsAppUrl(message: string): string {
  const number = SHOP_CONFIG.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function getSupabaseImageUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || !path) return '/placeholder-product.svg'
  if (path.startsWith('http')) return path
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Plumbing', slug: 'plumbing', parent_id: null, icon: null, sort_order: 1, created_at: '' },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Electrical', slug: 'electrical', parent_id: null, icon: null, sort_order: 2, created_at: '' },
  { id: 'c2000000-0000-0000-0000-000000000001', name: 'Pipes & Fittings', slug: 'pipes-fittings', parent_id: 'c1000000-0000-0000-0000-000000000001', icon: null, sort_order: 1, created_at: '' },
  { id: 'c2000000-0000-0000-0000-000000000002', name: 'Taps & Valves', slug: 'taps-valves', parent_id: 'c1000000-0000-0000-0000-000000000001', icon: null, sort_order: 2, created_at: '' },
  { id: 'c2000000-0000-0000-0000-000000000003', name: 'Solvents & Glues', slug: 'solvents-glues', parent_id: 'c1000000-0000-0000-0000-000000000001', icon: null, sort_order: 3, created_at: '' },
  { id: 'c2000000-0000-0000-0000-000000000004', name: 'Water Tanks', slug: 'water-tanks', parent_id: 'c1000000-0000-0000-0000-000000000001', icon: null, sort_order: 4, created_at: '' },
  { id: 'c2000000-0000-0000-0000-000000000005', name: 'Lighting', slug: 'lighting', parent_id: 'c1000000-0000-0000-0000-000000000002', icon: null, sort_order: 1, created_at: '' },
  { id: 'c2000000-0000-0000-0000-000000000006', name: 'Fans', slug: 'fans', parent_id: 'c1000000-0000-0000-0000-000000000002', icon: null, sort_order: 2, created_at: '' },
  { id: 'c2000000-0000-0000-0000-000000000007', name: 'Switches & Sockets', slug: 'switches-sockets', parent_id: 'c1000000-0000-0000-0000-000000000002', icon: null, sort_order: 3, created_at: '' },
  { id: 'c2000000-0000-0000-0000-000000000008', name: 'Wires & Cables', slug: 'wires-cables', parent_id: 'c1000000-0000-0000-0000-000000000002', icon: null, sort_order: 4, created_at: '' },
]
