'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Riddle } from '@/lib/db'
import RiddleForm from './RiddleForm'

interface Props {
  initialRiddles: Riddle[]
  initialCategories: string[]
}

const difficultyBadge = {
  easy: { bg: '#14532d', text: '#4ade80' },
  medium: { bg: '#78350f', text: '#fcd34d' },
  hard: { bg: '#7f1d1d', text: '#fca5a5' },
}

export default function AdminDashboard({ initialRiddles, initialCategories }: Props) {
  const [riddles, setRiddles] = useState<Riddle[]>(initialRiddles)
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const refreshRiddles = useCallback(async () => {
    try {
      const res = await fetch('/api/riddles')
      if (!res.ok) return
      const data: Riddle[] = await res.json()
      setRiddles(data)
      const cats = Array.from(new Set(data.map(r => r.category))).sort()
      setCategories(cats)
    } catch {
      // silently fail
    }
  }, [])

  const handleAddSuccess = async () => {
    await refreshRiddles()
    setShowAddForm(false)
    showSuccess('Riddle added successfully!')
  }

  const handleEditSuccess = async () => {
    await refreshRiddles()
    setEditingId(null)
    showSuccess('Riddle updated successfully!')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this riddle? This cannot be undone.')) return
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch(`/api/riddles/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to delete riddle')
      }
      await refreshRiddles()
      showSuccess('Riddle deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete riddle')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  const editingRiddle = editingId !== null ? riddles.find(r => r.id === editingId) : undefined

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Admin Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {riddles.length} riddle{riddles.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowAddForm(f => !f)
              setEditingId(null)
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
          >
            {showAddForm ? 'Cancel' : '+ Add New Riddle'}
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-700"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
          style={{ backgroundColor: '#14532d30', border: '1px solid #166534', color: '#4ade80' }}
        >
          <span>&#10003;</span> {successMsg}
        </div>
      )}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: '#7f1d1d30', border: '1px solid #7f1d1d', color: '#fca5a5' }}
        >
          {error}
          <button className="ml-3 underline" onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div
          className="mb-8 rounded-xl p-6"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
            Add New Riddle
          </h2>
          <RiddleForm
            categories={categories}
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Riddles list */}
      {riddles.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="text-5xl mb-4">&#x2753;</div>
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            No riddles yet
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            Click &ldquo;Add New Riddle&rdquo; to create your first riddle.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {riddles.map(riddle => (
            <div key={riddle.id}>
              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {/* Riddle row */}
                <div className="px-5 py-4 flex items-start gap-4">
                  {/* ID */}
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold font-mono"
                    style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-muted)' }}
                  >
                    #{riddle.id}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: '#1e3a5f', color: '#93c5fd' }}
                      >
                        {riddle.category}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: difficultyBadge[riddle.difficulty].bg,
                          color: difficultyBadge[riddle.difficulty].text,
                        }}
                      >
                        {riddle.difficulty}
                      </span>
                      {riddle.clues.length > 0 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {riddle.clues.length} clue{riddle.clues.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {riddle.image_url && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          &#x1F4F8; image
                        </span>
                      )}
                    </div>
                    {riddle.title && (
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                        {riddle.title}
                      </p>
                    )}
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: riddle.title ? 'var(--text-muted)' : 'var(--text-primary)' }}
                    >
                      {riddle.question}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Answer: <span style={{ color: 'var(--accent)' }}>{riddle.answer}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(editingId === riddle.id ? null : riddle.id)
                        setShowAddForm(false)
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-slate-600"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    >
                      {editingId === riddle.id ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(riddle.id)}
                      disabled={deletingId === riddle.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-red-900/40 disabled:opacity-50"
                      style={{ border: '1px solid #7f1d1d', color: '#f87171' }}
                    >
                      {deletingId === riddle.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Edit form (inline) */}
                {editingId === riddle.id && editingRiddle && (
                  <div
                    className="px-5 pb-5 pt-1 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <h3 className="text-sm font-semibold mb-4 mt-3" style={{ color: 'var(--text-secondary)' }}>
                      Editing Riddle #{riddle.id}
                    </h3>
                    <RiddleForm
                      riddle={editingRiddle}
                      categories={categories}
                      onSuccess={handleEditSuccess}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
