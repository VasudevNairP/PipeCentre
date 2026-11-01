import type { StockStatus } from '@/lib/types'

const labels: Record<StockStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
}

const classes: Record<StockStatus, string> = {
  in_stock: 'badge-in-stock',
  low_stock: 'badge-low-stock',
  out_of_stock: 'badge-out-of-stock',
}

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span className={classes[status]}>
      <span className={`mr-1 inline-block w-1.5 h-1.5 rounded-full ${
        status === 'in_stock' ? 'bg-green-500' :
        status === 'low_stock' ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      {labels[status]}
    </span>
  )
}
