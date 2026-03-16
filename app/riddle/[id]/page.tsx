import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sql } from '@/lib/db'
import type { Riddle } from '@/lib/db'
import RiddleCard from '@/components/RiddleCard'

interface Props {
  params: { id: string }
}

async function getRiddle(id: string): Promise<Riddle | null> {
  const numId = parseInt(id, 10)
  if (isNaN(numId)) return null
  try {
    const rows = await sql`SELECT * FROM riddles WHERE id = ${numId}`
    if (rows.length === 0) return null
    return rows[0] as Riddle
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const riddle = await getRiddle(params.id)
  if (!riddle) {
    return { title: 'Riddle Not Found | The Riddler' }
  }
  const preview = riddle.question.length > 120
    ? riddle.question.slice(0, 120) + '...'
    : riddle.question
  return {
    title: `${riddle.title ? riddle.title + ' | ' : ''}Riddle #${riddle.id} | The Riddler`,
    description: preview,
    openGraph: {
      title: riddle.title ?? `Can you solve this ${riddle.difficulty} riddle?`,
      description: preview,
      ...(riddle.image_url ? { images: [riddle.image_url] } : {}),
    },
  }
}

export default async function RiddlePage({ params }: Props) {
  const riddle = await getRiddle(params.id)

  if (!riddle) {
    notFound()
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-amber-400"
        style={{ color: 'var(--text-secondary)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to all riddles
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {riddle.title ?? `Riddle #${riddle.id}`}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Category: <span style={{ color: 'var(--text-secondary)' }}>{riddle.category}</span>
          {' · '}
          Difficulty:{' '}
          <span
            style={{
              color:
                riddle.difficulty === 'easy' ? '#4ade80'
                : riddle.difficulty === 'medium' ? '#fcd34d'
                : '#fca5a5',
            }}
          >
            {riddle.difficulty.charAt(0).toUpperCase() + riddle.difficulty.slice(1)}
          </span>
        </p>
      </div>

      <RiddleCard riddle={riddle} />

      {/* Navigation hint */}
      <div className="mt-8 text-center">
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          Want more riddles?
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
        >
          Browse All Riddles
        </Link>
      </div>
    </div>
  )
}
