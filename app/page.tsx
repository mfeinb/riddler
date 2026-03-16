'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Riddle } from '@/lib/db'
import RiddleCard from '@/components/RiddleCard'

type Difficulty = 'all' | 'easy' | 'medium' | 'hard'

export default function HomePage() {
  const [riddles, setRiddles] = useState<Riddle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState<Difficulty>('all')
  const [solvedCount, setSolvedCount] = useState(0)
  const [highlightId, setHighlightId] = useState<number | null>(null)

  const fetchRiddles = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/riddles')
      if (!res.ok) throw new Error('Failed to fetch riddles')
      const data: Riddle[] = await res.json()
      setRiddles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRiddles()
  }, [fetchRiddles])

  useEffect(() => {
    if (riddles.length === 0) return
    const count = riddles.filter(r =>
      localStorage.getItem(`solved_riddle_${r.id}`) === 'true'
    ).length
    setSolvedCount(count)
  }, [riddles])

  const handleSolved = useCallback(() => {
    if (riddles.length === 0) return
    const count = riddles.filter(r =>
      localStorage.getItem(`solved_riddle_${r.id}`) === 'true'
    ).length
    setSolvedCount(count)
  }, [riddles])

  const categories = ['all', ...Array.from(new Set(riddles.map(r => r.category))).sort()]

  const filtered = riddles.filter(r => {
    const matchSearch =
      search === '' ||
      r.question.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      (r.title?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchCategory = category === 'all' || r.category === category
    const matchDifficulty = difficulty === 'all' || r.difficulty === difficulty
    return matchSearch && matchCategory && matchDifficulty
  })

  const handleRandom = () => {
    if (filtered.length === 0) return
    const pick = filtered[Math.floor(Math.random() * filtered.length)]
    setHighlightId(pick.id)
    setTimeout(() => {
      const el = document.getElementById(`riddle-${pick.id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2', 'ring-offset-slate-900')
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2', 'ring-offset-slate-900')
          setHighlightId(null)
        }, 2000)
      }
    }, 50)
  }

  const difficultyButtons: { label: string; value: Difficulty }[] = [
    { label: 'All', value: 'all' },
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
          <span style={{ color: 'var(--accent)' }}>The</span>{' '}
          <span style={{ color: 'var(--text-primary)' }}>Riddler</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Challenge your mind with riddles of all kinds. Reveal clues one at a time and test your wit.
        </p>
        {riddles.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--accent)' }}>&#10003;</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {solvedCount} of {riddles.length} solved
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-muted)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search riddles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Random */}
          <button
            onClick={handleRandom}
            disabled={filtered.length === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
          >
            &#x2684; Random
          </button>
        </div>

        {/* Difficulty filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide mr-1" style={{ color: 'var(--text-muted)' }}>
            Difficulty:
          </span>
          {difficultyButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setDifficulty(btn.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
              style={
                difficulty === btn.value
                  ? {
                      backgroundColor: btn.value === 'easy' ? '#16a34a'
                        : btn.value === 'medium' ? '#d97706'
                        : btn.value === 'hard' ? '#dc2626'
                        : 'var(--accent)',
                      color: '#fff',
                    }
                  : {
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }
              }
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* State messages */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--text-muted)' }}>Loading riddles...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg p-6 text-center"
          style={{ backgroundColor: '#7f1d1d30', border: '1px solid #7f1d1d' }}>
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchRiddles}
            className="mt-3 text-sm underline text-red-300 hover:text-red-200"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && riddles.length === 0 && (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">&#x2753;</div>
          <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No riddles yet
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            Head to the{' '}
            <a href="/admin" className="underline" style={{ color: 'var(--accent)' }}>
              admin panel
            </a>{' '}
            to add some riddles.
          </p>
        </div>
      )}

      {!loading && !error && riddles.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">&#x1F50D;</div>
          <p className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            No riddles match your filters
          </p>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(riddle => (
            <div
              key={riddle.id}
              id={`riddle-${riddle.id}`}
              className="transition-all duration-500"
            >
              <RiddleCard riddle={riddle} onSolved={handleSolved} highlight={highlightId === riddle.id} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
