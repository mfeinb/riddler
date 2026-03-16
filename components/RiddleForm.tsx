'use client'

import { useState, useRef, FormEvent, useEffect } from 'react'
import Image from 'next/image'
import type { Riddle } from '@/lib/db'

interface RiddleFormProps {
  riddle?: Riddle
  categories: string[]
  onSuccess: () => void
  onCancel?: () => void
}

const emptyForm = {
  question: '',
  answer: '',
  clues: [''],
  category: '',
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  image_url: '',
}

export default function RiddleForm({ riddle, categories, onSuccess, onCancel }: RiddleFormProps) {
  const [form, setForm] = useState(() =>
    riddle
      ? {
          question: riddle.question,
          answer: riddle.answer,
          clues: riddle.clues.length > 0 ? [...riddle.clues] : [''],
          category: riddle.category,
          difficulty: riddle.difficulty,
          image_url: riddle.image_url ?? '',
        }
      : { ...emptyForm, clues: [''] }
  )
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(riddle?.image_url ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (riddle) {
      setForm({
        question: riddle.question,
        answer: riddle.answer,
        clues: riddle.clues.length > 0 ? [...riddle.clues] : [''],
        category: riddle.category,
        difficulty: riddle.difficulty,
        image_url: riddle.image_url ?? '',
      })
      setImagePreview(riddle.image_url ?? '')
    }
  }, [riddle])

  const handleClueChange = (idx: number, value: string) => {
    const updated = [...form.clues]
    updated[idx] = value
    setForm(f => ({ ...f, clues: updated }))
  }

  const addClue = () => {
    if (form.clues.length < 3) {
      setForm(f => ({ ...f, clues: [...f.clues, ''] }))
    }
  }

  const removeClue = (idx: number) => {
    const updated = form.clues.filter((_, i) => i !== idx)
    setForm(f => ({ ...f, clues: updated.length > 0 ? updated : [''] }))
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Upload failed')
      }
      const { url } = await res.json()
      setForm(f => ({ ...f, image_url: url }))
      setImagePreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const cleanClues = form.clues.filter(c => c.trim() !== '')

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      clues: cleanClues,
      category: form.category.trim() || 'General',
      difficulty: form.difficulty,
      image_url: form.image_url || null,
    }

    try {
      const url = riddle ? `/api/riddles/${riddle.id}` : '/api/riddles'
      const method = riddle ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to save riddle')
      }
      // Reset form if creating
      if (!riddle) {
        setForm({ ...emptyForm, clues: [''] })
        setImagePreview('')
        if (fileRef.current) fileRef.current.value = ''
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save riddle')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm transition-colors"
  const inputStyle = {
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }
  const labelClass = "block text-sm font-medium mb-1.5"
  const labelStyle = { color: 'var(--text-secondary)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Question */}
      <div>
        <label className={labelClass} style={labelStyle}>
          Question <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.question}
          onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
          required
          rows={3}
          placeholder="Enter your riddle question..."
          className={inputClass + ' resize-none'}
          style={inputStyle}
        />
      </div>

      {/* Answer */}
      <div>
        <label className={labelClass} style={labelStyle}>
          Answer <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.answer}
          onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
          required
          placeholder="The answer to the riddle..."
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Clues */}
      <div>
        <label className={labelClass} style={labelStyle}>
          Clues{' '}
          <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            (optional, max 3)
          </span>
        </label>
        <div className="space-y-2">
          {form.clues.map((clue, idx) => (
            <div key={idx} className="flex gap-2">
              <div
                className="flex-shrink-0 w-7 h-10 flex items-center justify-center text-xs font-bold rounded-lg"
                style={{ backgroundColor: '#0f2744', color: '#60a5fa' }}
              >
                {idx + 1}
              </div>
              <input
                type="text"
                value={clue}
                onChange={e => handleClueChange(idx, e.target.value)}
                placeholder={`Clue ${idx + 1}...`}
                className={inputClass + ' flex-1'}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeClue(idx)}
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-red-900/40"
                style={{ border: '1px solid var(--border)', color: '#f87171' }}
                title="Remove clue"
              >
                &#x2715;
              </button>
            </div>
          ))}
          {form.clues.length < 3 && (
            <button
              type="button"
              onClick={addClue}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: 'var(--bg-base)',
                border: '1px dashed var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ color: 'var(--accent)' }}>+</span> Add Clue
            </button>
          )}
        </div>
      </div>

      {/* Category + Difficulty row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={labelStyle}>
            Category
          </label>
          <input
            type="text"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            placeholder="e.g. General, Animals..."
            list="category-list"
            className={inputClass}
            style={inputStyle}
          />
          <datalist id="category-list">
            {categories.map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Difficulty
          </label>
          <select
            value={form.difficulty}
            onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
            className={inputClass + ' cursor-pointer'}
            style={inputStyle}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className={labelClass} style={labelStyle}>
          Image{' '}
          <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            (optional)
          </span>
        </label>

        {imagePreview && (
          <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="600px"
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview('')
                setForm(f => ({ ...f, image_url: '' }))
                if (fileRef.current) fileRef.current.value = ''
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              style={{ backgroundColor: '#0f172a99', color: '#f87171', border: '1px solid #7f1d1d' }}
              title="Remove image"
            >
              &#x2715;
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <label
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm cursor-pointer transition-all hover:scale-[1.01]"
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px dashed var(--border)',
              color: uploading ? 'var(--text-muted)' : 'var(--text-secondary)',
              pointerEvents: uploading ? 'none' : 'auto',
            }}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading...
              </span>
            ) : (
              <>
                <span>&#x1F4CE;</span>
                {imagePreview ? 'Change image' : 'Upload image'}
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleImageUpload(f)
              }}
            />
          </label>

          {form.image_url && !imagePreview && (
            <input
              type="text"
              value={form.image_url}
              onChange={e => {
                setForm(f => ({ ...f, image_url: e.target.value }))
                setImagePreview(e.target.value)
              }}
              placeholder="Or paste image URL..."
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={inputStyle}
            />
          )}
        </div>

        {/* URL input when no file yet */}
        {!imagePreview && (
          <input
            type="text"
            value={form.image_url}
            onChange={e => {
              setForm(f => ({ ...f, image_url: e.target.value }))
              if (e.target.value) setImagePreview(e.target.value)
            }}
            placeholder="Or paste an image URL..."
            className={inputClass + ' mt-2'}
            style={inputStyle}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: '#7f1d1d30', border: '1px solid #7f1d1d', color: '#fca5a5' }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : riddle ? 'Save Changes' : 'Add Riddle'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-700"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
