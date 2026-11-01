export type UserRole = 'owner' | 'staff'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
export type EnquiryStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled'
export type ProductUnit = 'piece' | 'metre' | 'kg' | 'litre' | 'roll' | 'box' | 'pair' | 'set'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  icon: string | null
  sort_order: number
  created_at: string
  parent?: Category
  children?: Category[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  brand: string | null
  category_id: string
  price: number | null
  unit: ProductUnit
  stock_qty: number
  low_stock_threshold: number
  specs: Record<string, string> | null
  images: string[]
  featured: boolean
  active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface ProductWithStatus extends Product {
  stock_status: StockStatus
}

export interface StockMovement {
  id: string
  product_id: string
  delta: number
  reason: string
  performed_by: string
  enquiry_id: string | null
  created_at: string
  product?: Product
  profile?: Profile
}

export interface EnquiryItem {
  id: string
  enquiry_id: string
  product_id: string
  product_name: string
  product_price: number | null
  qty: number
  unit: string
}

export interface Enquiry {
  id: string
  reference: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  note: string | null
  status: EnquiryStatus
  internal_notes: string | null
  created_at: string
  updated_at: string
  items?: EnquiryItem[]
}

// Cart (client-side only, stored in localStorage)
export interface CartItem {
  product_id: string
  product_name: string
  product_price: number | null
  unit: ProductUnit
  qty: number
  image: string | null
}
