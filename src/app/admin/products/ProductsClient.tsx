'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Edit, Trash2, ArrowUpDown, Plus } from 'lucide-react'
import { StockBadge } from '@/components/catalogue/StockBadge'
import { formatPrice, addStockStatus } from '@/lib/utils'
import type { Category, ProductWithStatus } from '@/lib/types'

interface Props {
  initialProducts: any[]
  categories: Category[]
}

export function ProductsClient({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockModal, setStockModal] = useState<{ open: boolean; product: any | null; delta: number; reason: string }>({
    open: false,
    product: null,
    delta: 0,
    reason: '',
  })

  const filtered = useMemo(() => {
    return products
      .map(addStockStatus)
      .filter(p => {
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase())
        const matchesCategory = !categoryFilter || p.category_id === categoryFilter
        return matchesSearch && matchesCategory
      })
  }, [products, search, categoryFilter])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) setProducts(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  const handleStockAdjust = async () => {
    if (!stockModal.product || stockModal.delta === 0) return
    try {
      const res = await fetch(`/api/products/${stockModal.product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_delta: stockModal.delta,
          reason: stockModal.reason || 'Manual adjustment',
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setProducts(prev => prev.map(p => p.id === stockModal.product.id ? json.data : p))
        setStockModal({ open: false, product: null, delta: 0, reason: '' })
      }
    } catch {}
  }

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search products by name or brand…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="input sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p.category?.name || '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatPrice(p.price)} <span className="text-xs text-gray-400">/{p.unit}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setStockModal({ open: true, product: p, delta: 0, reason: '' })}
                      className="inline-flex items-center gap-1 font-bold text-gray-900 hover:text-brand-600 group"
                      title="Adjust stock"
                    >
                      <span>{p.stock_qty} {p.unit}</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-brand-600" />
                    </button>
                    <p className="text-xs text-gray-400">Low at ≤ {p.low_stock_threshold}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge status={p.stock_status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-brand-600 rounded-md hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {stockModal.open && stockModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-gray-900">Adjust Stock</h3>
            <p className="text-sm text-gray-600">
              {stockModal.product.name} (Current: {stockModal.product.stock_qty} {stockModal.product.unit})
            </p>
            <div>
              <label className="label">Change amount (+ add, - remove)</label>
              <input
                type="number"
                value={stockModal.delta || ''}
                onChange={e => setStockModal(prev => ({ ...prev, delta: parseInt(e.target.value) || 0 }))}
                className="input"
                placeholder="e.g. +10 or -5"
              />
            </div>
            <div>
              <label className="label">Reason</label>
              <input
                type="text"
                value={stockModal.reason}
                onChange={e => setStockModal(prev => ({ ...prev, reason: e.target.value }))}
                className="input"
                placeholder="e.g. New stock arrival, Damaged, Count correction"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setStockModal({ open: false, product: null, delta: 0, reason: '' })}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleStockAdjust}
                disabled={stockModal.delta === 0}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
