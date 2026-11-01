'use client'

import { ShoppingBag, Check } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import type { ProductWithStatus } from '@/lib/types'
import { getSupabaseImageUrl } from '@/lib/utils'

interface Props {
  product: ProductWithStatus
  compact?: boolean
}

export function AddToCartButton({ product, compact }: Props) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)

  const isOutOfStock = product.stock_status === 'out_of_stock'
  const inCart = items.some(i => i.product_id === product.id)

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      unit: product.unit,
      qty: 1,
      image: product.images?.[0] ? getSupabaseImageUrl(product.images[0]) : null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isOutOfStock) {
    return (
      <button disabled className={`btn-secondary w-full opacity-50 cursor-not-allowed ${compact ? 'text-xs py-2' : ''}`}>
        Out of Stock
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className={`btn-primary w-full ${compact ? 'text-xs py-2' : ''} ${added ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      {added ? (
        <><Check className="w-3.5 h-3.5" /> Added!</>
      ) : (
        <><ShoppingBag className="w-3.5 h-3.5" /> {inCart ? 'Add More' : 'Add to Enquiry'}</>
      )}
    </button>
  )
}
