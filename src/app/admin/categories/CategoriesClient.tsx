'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, FolderPlus } from 'lucide-react'
import { slugify } from '@/lib/utils'

export function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [modal, setModal] = useState<{ open: boolean; item: any | null; parent_id: string | null }>({
    open: false,
    item: null,
    parent_id: null,
  })
  const [name, setName] = useState('')
  const [sortOrder, setSortOrder] = useState(0)

  const parents = categories.filter(c => !c.parent_id)

  const openAdd = (parent_id: string | null = null) => {
    setName('')
    setSortOrder(categories.length)
    setModal({ open: true, item: null, parent_id })
  }

  const openEdit = (cat: any) => {
    setName(cat.name)
    setSortOrder(cat.sort_order)
    setModal({ open: true, item: cat, parent_id: cat.parent_id })
  }

  const handleSave = async () => {
    if (!name.trim()) return
    const slug = slugify(name)

    if (modal.item) {
      // Edit
      const res = await fetch(`/api/categories/${modal.item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, sort_order: sortOrder }),
      })
      if (res.ok) {
        setCategories(prev => prev.map(c => c.id === modal.item.id ? { ...c, name, slug, sort_order: sortOrder } : c))
        setModal({ open: false, item: null, parent_id: null })
      }
    } else {
      // Create
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, parent_id: modal.parent_id, sort_order: sortOrder }),
      })
      if (res.ok) {
        const json = await res.json()
        setCategories(prev => [...prev, json.data])
        setModal({ open: false, item: null, parent_id: null })
      }
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in it may need reassigning.`)) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => openAdd()} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Main Category
        </button>
      </div>

      <div className="space-y-4">
        {parents.map(parent => {
          const children = categories.filter(c => c.parent_id === parent.id)
          return (
            <div key={parent.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{parent.name}</h3>
                  <span className="text-xs text-gray-400">/{parent.slug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAdd(parent.id)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> Add Sub-category
                  </button>
                  <button onClick={() => openEdit(parent)} className="p-1.5 text-gray-400 hover:text-gray-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(parent.id, parent.name)} className="p-1.5 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {children.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-2">
                  {children.map(child => (
                    <div key={child.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-700">{child.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(child)} className="p-1 text-gray-400 hover:text-gray-700">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(child.id, child.name)} className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-gray-900">
              {modal.item ? 'Edit Category' : modal.parent_id ? 'Add Sub-category' : 'Add Category'}
            </h3>
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                placeholder="e.g. PVC Fittings"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setModal({ open: false, item: null, parent_id: null })} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
