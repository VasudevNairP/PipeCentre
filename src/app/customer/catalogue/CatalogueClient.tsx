'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { ProductCard } from '@/components/catalogue/ProductCard'
import { addStockStatus } from '@/lib/utils'
import type { Category } from '@/lib/types'

interface Props {
  products: any[]
  categories: Category[]
}

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

const PAGE_SIZE = 24

export function CatalogueClient({ products, categories }: Props) {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || ''

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [priceMax, setPriceMax] = useState('')
  const [sort, setSort] = useState('name_asc')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const parentCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories])
  const subCategories = useMemo(() =>
    selectedCategory
      ? categories.filter(c => c.parent_id && parentCategories.find(p => p.slug === selectedCategory && p.id === c.parent_id))
      : [],
    [categories, parentCategories, selectedCategory]
  )
  const brands = useMemo(() => {
    const b = new Set(products.map((p: any) => p.brand).filter(Boolean))
    return Array.from(b).sort() as string[]
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products.map(addStockStatus)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      )
    }

    if (selectedCategory) {
      const parent = parentCategories.find(c => c.slug === selectedCategory)
      if (parent) {
        const subIds = categories.filter(c => c.parent_id === parent.id).map(c => c.id)
        result = result.filter(p =>
          p.category_id === parent.id || subIds.includes(p.category_id)
        )
      }
    }

    if (selectedSubCategory) {
      result = result.filter(p => p.category?.slug === selectedSubCategory)
    }

    if (selectedBrand) {
      result = result.filter(p => p.brand === selectedBrand)
    }

    if (inStockOnly) {
      result = result.filter(p => p.stock_status !== 'out_of_stock')
    }

    if (priceMax) {
      const max = parseFloat(priceMax)
      if (!isNaN(max)) {
        result = result.filter(p => p.price !== null && p.price <= max)
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sort === 'name_asc') return a.name.localeCompare(b.name)
      if (sort === 'name_desc') return b.name.localeCompare(a.name)
      if (sort === 'price_asc') return (a.price ?? Infinity) - (b.price ?? Infinity)
      if (sort === 'price_desc') return (b.price ?? -Infinity) - (a.price ?? -Infinity)
      return 0
    })

    return result
  }, [products, search, selectedCategory, selectedSubCategory, selectedBrand, inStockOnly, priceMax, sort, categories, parentCategories])

  const paginated = filteredProducts.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < filteredProducts.length

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setSelectedSubCategory('')
    setSelectedBrand('')
    setInStockOnly(false)
    setPriceMax('')
    setSort('name_asc')
    setPage(1)
  }

  const activeFilterCount = [
    selectedCategory, selectedSubCategory, selectedBrand, inStockOnly ? '1' : '', priceMax
  ].filter(Boolean).length

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search products, brands…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn-secondary gap-2 relative ${filtersOpen ? 'border-brand-500 text-brand-600' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        <select value={sort} onChange={e => setSort(e.target.value)} className="input w-auto hidden sm:block">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Category</label>
            <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); setPage(1) }} className="input">
              <option value="">All Categories</option>
              {parentCategories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          {subCategories.length > 0 && (
            <div>
              <label className="label">Sub-category</label>
              <select value={selectedSubCategory} onChange={e => { setSelectedSubCategory(e.target.value); setPage(1) }} className="input">
                <option value="">All</option>
                {subCategories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Brand</label>
            <select value={selectedBrand} onChange={e => { setSelectedBrand(e.target.value); setPage(1) }} className="input">
              <option value="">All Brands</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Max Price (₹)</label>
            <input type="number" placeholder="e.g. 500" value={priceMax} onChange={e => { setPriceMax(e.target.value); setPage(1) }} className="input" min="0" />
          </div>
          <div className="sm:col-span-2 md:col-span-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inStockOnly} onChange={e => { setInStockOnly(e.target.checked); setPage(1) }} className="w-4 h-4 accent-brand-600" />
              <span className="text-sm font-medium text-gray-700">In-stock only</span>
            </label>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {paginated.length} of {filteredProducts.length} products
      </p>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-primary mt-4">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginated.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button onClick={() => setPage(page + 1)} className="btn-secondary">
                Load more ({filteredProducts.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
