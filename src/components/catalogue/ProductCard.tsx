import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import type { ProductWithStatus } from '@/lib/types'
import { formatPrice, getSupabaseImageUrl } from '@/lib/utils'
import { StockBadge } from './StockBadge'
import { AddToCartButton } from './AddToCartButton'

interface Props {
  product: ProductWithStatus
}

export function ProductCard({ product }: Props) {
  const imgSrc = product.images?.[0] ? getSupabaseImageUrl(product.images[0]) : '/placeholder-product.svg'

  return (
    <div className="card flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/catalogue/${product.slug}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          className="object-contain p-4 hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      <div className="p-3 flex flex-col flex-1">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{product.brand}</p>
        )}

        {/* Name */}
        <Link href={`/catalogue/${product.slug}`} className="text-sm font-semibold text-gray-900 hover:text-brand-600 line-clamp-2 leading-snug mb-2">
          {product.name}
        </Link>

        {/* Stock + Price row */}
        <div className="flex items-center justify-between mt-auto mb-3">
          <StockBadge status={product.stock_status} />
          <div className="text-right">
            <span className="font-bold text-brand-700 text-sm">{formatPrice(product.price)}</span>
            <span className="text-xs text-gray-400 block">/{product.unit}</span>
          </div>
        </div>

        <AddToCartButton product={product} compact />
      </div>
    </div>
  )
}
