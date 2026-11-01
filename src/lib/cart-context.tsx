'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { CartItem } from '@/lib/types'

const CART_KEY = 'pipe_centre_cart'

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateQty: (product_id: string, qty: number) => void
  removeItem: (product_id: string) => void
  clearCart: () => void
  totalCount: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  updateQty: () => {},
  removeItem: () => {},
  clearCart: () => {},
  totalCount: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = (newItems: CartItem[]) => {
    setItems(newItems)
    try { localStorage.setItem(CART_KEY, JSON.stringify(newItems)) } catch {}
  }

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id)
      const next = existing
        ? prev.map(i => i.product_id === item.product_id ? { ...i, qty: i.qty + item.qty } : i)
        : [...prev, item]
      try { localStorage.setItem(CART_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const updateQty = useCallback((product_id: string, qty: number) => {
    setItems(prev => {
      const next = qty <= 0
        ? prev.filter(i => i.product_id !== product_id)
        : prev.map(i => i.product_id === product_id ? { ...i, qty } : i)
      try { localStorage.setItem(CART_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const removeItem = useCallback((product_id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.product_id !== product_id)
      try { localStorage.setItem(CART_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    persist([])
  }, [])

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, totalCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
