'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, AlertCircle, Plus, Trash2 } from 'lucide-react'
import type { Category, ProductUnit } from '@/lib/types'
import { DEFAULT_CATEGORIES } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  category_id: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  price: z.preprocess(val => (val === '' || val === null ? null : Number(val)), z.number().nullable().optional()),
  unit: z.enum(['piece', 'metre', 'kg', 'litre', 'roll', 'box', 'pair', 'set']),
  description: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  low_stock_threshold: z.coerce.number().min(0).default(5),
  stock_qty: z.coerce.number().min(0).default(0),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData?: any
  categories: Category[]
}

export function ProductForm({ initialData, categories }: Props) {
  const router = useRouter()
  const isEdit = !!initialData
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [categoryList, setCategoryList] = useState<Category[]>(
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES
  )

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoryList(categories)
    } else {
      fetch('/api/categories')
        .then(res => res.json())
        .then(res => {
          if (res?.data && res.data.length > 0) {
            setCategoryList(res.data)
          }
        })
        .catch(() => {})
    }
  }, [categories])

  // Specs key-value pairs
  const [specs, setSpecs] = useState<{ key: string; val: string }[]>(
    initialData?.specs
      ? Object.entries(initialData.specs).map(([key, val]) => ({ key, val: String(val) }))
      : []
  )

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      category_id: initialData?.category_id || '',
      brand: initialData?.brand || '',
      price: initialData?.price ?? null,
      unit: initialData?.unit || 'piece',
      description: initialData?.description || '',
      featured: initialData?.featured || false,
      active: initialData?.active ?? true,
      low_stock_threshold: initialData?.low_stock_threshold ?? 5,
      stock_qty: initialData?.stock_qty ?? 0,
    },
  })

  const addSpec = () => setSpecs(prev => [...prev, { key: '', val: '' }])
  const removeSpec = (idx: number) => setSpecs(prev => prev.filter((_, i) => i !== idx))
  const updateSpec = (idx: number, field: 'key' | 'val', value: string) => {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setError('')
    try {
      const specsObj = specs.reduce((acc, { key, val }) => {
        if (key.trim()) acc[key.trim()] = val.trim()
        return acc
      }, {} as Record<string, string>)

      const payload = {
        ...data,
        specs: Object.keys(specsObj).length > 0 ? specsObj : null,
      }

      const url = isEdit ? `/api/products/${initialData.id}` : '/api/products'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        if (json.error?.includes('schema cache') || json.error?.includes('does not exist')) {
          throw new Error('Database tables not found in Supabase. Please execute the supabase/schema.sql script in your Supabase SQL Editor.')
        }
        throw new Error(json.error || 'Failed to save product')
      }
      router.push('/admin/products')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Basic details */}
      <div className="card p-5 space-y-4">
        <h2 className="font-bold text-gray-900">Basic Information</h2>

        <div>
          <label className="label">Product Name *</label>
          <input {...register('name')} className="input" placeholder="e.g. CPVC Pipe 1 inch" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Category *</label>
              <Link href="/admin/categories" target="_blank" className="text-xs text-brand-600 hover:underline">
                + Manage categories
              </Link>
            </div>
            <select {...register('category_id')} className="input">
              <option value="">Select category</option>
              {categoryList
                .filter(c => !c.parent_id)
                .map(parent => {
                  const children = categoryList.filter(c => c.parent_id === parent.id)
                  if (children.length > 0) {
                    return (
                      <optgroup key={parent.id} label={parent.name}>
                        <option value={parent.id}>{parent.name} (General)</option>
                        {children.map(child => (
                          <option key={child.id} value={child.id}>
                            {child.name}
                          </option>
                        ))}
                      </optgroup>
                    )
                  }
                  return (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  )
                })}
              {categoryList
                .filter(c => c.parent_id && !categoryList.some(p => p.id === c.parent_id))
                .map(orphan => (
                  <option key={orphan.id} value={orphan.id}>
                    {orphan.name}
                  </option>
                ))}
            </select>
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
          </div>

          <div>
            <label className="label">Brand</label>
            <input {...register('brand')} className="input" placeholder="e.g. Ashirvad, Havells" />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea {...register('description')} className="input resize-none" rows={3} placeholder="Product description, features, usage…" />
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="card p-5 space-y-4">
        <h2 className="font-bold text-gray-900">Pricing &amp; Inventory</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Price (₹)</label>
            <input {...register('price')} type="number" step="any" className="input" placeholder="Leave empty for 'Ask for price'" />
          </div>

          <div>
            <label className="label">Unit *</label>
            <select {...register('unit')} className="input">
              <option value="piece">per piece</option>
              <option value="metre">per metre</option>
              <option value="kg">per kg</option>
              <option value="litre">per litre</option>
              <option value="roll">per roll</option>
              <option value="box">per box</option>
              <option value="pair">per pair</option>
              <option value="set">per set</option>
            </select>
          </div>

          <div>
            <label className="label">Current Stock Qty</label>
            <input {...register('stock_qty')} type="number" className="input" min="0" />
          </div>
        </div>

        <div>
          <label className="label">Low Stock Threshold</label>
          <input {...register('low_stock_threshold')} type="number" className="input sm:w-48" min="0" />
          <p className="text-xs text-gray-400 mt-1">Alert shows in dashboard when stock drops below this number</p>
        </div>
      </div>

      {/* Specifications */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Specifications</h2>
          <button type="button" onClick={addSpec} className="btn-secondary text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" /> Add Field
          </button>
        </div>

        {specs.length === 0 ? (
          <p className="text-xs text-gray-400">No specs added yet (e.g. size, material, wattage, colour)</p>
        ) : (
          <div className="space-y-2">
            {specs.map((s, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Field (e.g. Size)"
                  value={s.key}
                  onChange={e => updateSpec(idx, 'key', e.target.value)}
                  className="input flex-1 text-sm py-2"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 1 inch)"
                  value={s.val}
                  onChange={e => updateSpec(idx, 'val', e.target.value)}
                  className="input flex-1 text-sm py-2"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-2 text-red-400 hover:text-red-600 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visibility */}
      <div className="card p-5 space-y-3">
        <h2 className="font-bold text-gray-900">Visibility</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-brand-600" />
          <span className="text-sm font-medium text-gray-700">Feature on Home Page</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('active')} className="w-4 h-4 accent-brand-600" />
          <span className="text-sm font-medium text-gray-700">Active (visible in catalogue)</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          <Save className="w-4 h-4" />
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
