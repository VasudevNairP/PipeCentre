'use client'

import { useState } from 'react'
import { Plus, Trash2, Shield, User, AlertCircle } from 'lucide-react'
import type { Profile, UserRole } from '@/lib/types'

interface Props {
  initialProfiles: Profile[]
  isOwner: boolean
  currentUserId?: string
}

export function UsersClient({ initialProfiles, isOwner, currentUserId }: Props) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [modalOpen, setModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('staff')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create user')
      setProfiles(prev => [...prev, json.data])
      setModalOpen(false)
      setEmail('')
      setPassword('')
      setFullName('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) setProfiles(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  return (
    <div>
      {isOwner && (
        <div className="flex justify-end mb-4">
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Staff Member
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Added</th>
                {isOwner && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <User className="w-4 h-4" />
                    </div>
                    {p.full_name}
                    {p.id === currentUserId && <span className="text-xs text-brand-600 font-normal">(You)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {p.role === 'owner' && <Shield className="w-3 h-3" />}
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleDateString('en-IN')}
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-right">
                      {p.id !== currentUserId && (
                        <button
                          onClick={() => handleDeleteUser(p.id, p.full_name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-gray-900">Add Staff Member</h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="input"
                  placeholder="e.g. Suresh Patel"
                  required
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="suresh@example.com"
                  required
                />
              </div>
              <div>
                <label className="label">Temporary Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="input">
                  <option value="staff">Staff</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Creating…' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
