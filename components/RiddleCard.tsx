'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Riddle } from '@/lib/db'

interface RiddleCardProps {
  riddle: Riddle
  onSolved?: () => void
  highlight?: boolean
}

const difficultyConfig = {
  easy: { label: 'Easy', bg: '#14532d', text: '#4ade80', border: '#166534' },
  medium: { label: 'Medium', bg: '#78350f', text: '#fcd34d', border: '#92400e' },
  hard: { label: 'Hard', bg: '#7f1d1d', text: '#fca5a5', border: '#991b1b' },
}

export default function RiddleCard({ riddle, onSolved, highlight }: RiddleCardProps) {
  const [revealedClues, setRevealedClues] = useState(0)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const [copied, setCopied] = useState(false)
  const answerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const solved = localStorage.getItem(`solved_riddle_${riddle.id}`) === 'true'
    setIsSolved(solved)
  }, [riddle.id])

  const revealClue = () => {
    if (revealedClues < riddle.clues.length) {
      setRevealedClues(prev => prev + 1)
    }
  }

  const revealAnswer = () => {
    setAnswerRevealed(true)
    if (!isSolved) {
      setIsSolved(true)
      localStorage.setItem(`solved_riddle_${riddle.id}`, 'true')
      onSolved?.()
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/riddle/${riddle.id}`
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const url = `${window.location.origin}/riddle/${riddle.id}`
      prompt('Copy this link:', url)
    }
  }

  const diff = difficultyConfig[riddle.difficulty]

  return (
    <div
      className={`rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${
        isSolved ? 'card-solved' : ''
      } ${highlight ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Card Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category badge */}
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: '#1e3a5f',
                color: '#93c5fd',
                border: '1px solid #1d4ed840',
              }}
            >
              {riddle.category}
            </span>
            {/* Difficulty badge */}
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: diff.bg,
                color: diff.text,
                border: `1px solid ${diff.border}`,
              }}
            >
              {diff.label}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Solved indicator */}
            {isSolved && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#14532d', color: '#4ade80' }}
                title="Solved!"
              >
                &#10003;
              </div>
            )}
            {/* Riddle ID */}
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              #{riddle.id}
            </span>
          </div>
        </div>

        {/* Image */}
        {riddle.image_url && (
          <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
            <Image
              src={riddle.image_url}
              alt="Riddle image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {/* Question */}
        <p
          className="text-base font-medium leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
        >
          {riddle.question}
        </p>
      </div>

      {/* Clues Section */}
      {riddle.clues.length > 0 && (
        <div className="px-5 pb-3 space-y-2">
          {/* Revealed clues */}
          {riddle.clues.slice(0, revealedClues).map((clue, idx) => (
            <div
              key={idx}
              className="overflow-hidden animate-fade-in"
              style={{
                animation: 'fadeIn 0.35s ease-in-out',
              }}
            >
              <div
                className="flex gap-2.5 p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: '#0f2744',
                  border: '1px solid #1d4ed840',
                }}
              >
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ backgroundColor: '#1d4ed8', color: '#bfdbfe' }}
                >
                  {idx + 1}
                </span>
                <span style={{ color: '#93c5fd' }}>{clue}</span>
              </div>
            </div>
          ))}

          {/* Reveal next clue button */}
          {revealedClues < riddle.clues.length && !answerRevealed && (
            <button
              onClick={revealClue}
              className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: '#0f2744',
                border: '1px solid #1d4ed840',
                color: '#60a5fa',
              }}
            >
              <span className="mr-1.5">&#128161;</span>
              Reveal Clue {revealedClues + 1}
              {riddle.clues.length > 1 && (
                <span className="ml-1 text-xs opacity-60">
                  ({revealedClues + 1} of {riddle.clues.length})
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* Spacer to push controls down */}
      <div className="flex-1" />

      {/* Answer Section */}
      <div className="px-5 pb-5 pt-2 space-y-2">
        {!answerRevealed ? (
          <button
            onClick={revealAnswer}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)',
            }}
          >
            &#x1F513; Reveal Answer
          </button>
        ) : (
          <div
            ref={answerRef}
            className="p-4 rounded-lg"
            style={{
              backgroundColor: '#422006',
              border: '1px solid #92400e',
              animation: 'fadeIn 0.35s ease-in-out',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#d97706' }}>
              Answer
            </p>
            <p className="text-base font-medium" style={{ color: '#fbbf24' }}>
              {riddle.answer}
            </p>
          </div>
        )}

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full py-2 px-4 rounded-lg text-xs font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border)',
            color: copied ? '#4ade80' : 'var(--text-muted)',
          }}
        >
          {copied ? '&#10003; Copied link!' : '&#128279; Share this riddle'}
        </button>
      </div>
    </div>
  )
}
