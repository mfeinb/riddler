'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Riddle } from '@/lib/db'

interface RiddleCardProps {
  riddle: Riddle
  onSolved?: () => void
  highlight?: boolean
  compact?: boolean
}

const difficultyConfig = {
  easy: { label: 'Easy', bg: '#14532d', text: '#4ade80', border: '#166534' },
  medium: { label: 'Medium', bg: '#78350f', text: '#fcd34d', border: '#92400e' },
  hard: { label: 'Hard', bg: '#7f1d1d', text: '#fca5a5', border: '#991b1b' },
}

const QUESTION_PREVIEW_LENGTH = 200

export default function RiddleCard({ riddle, onSolved, highlight, compact }: RiddleCardProps) {
  const [revealedClues, setRevealedClues] = useState(0)
  const [hiddenClues, setHiddenClues] = useState<Set<number>>(new Set())
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [answerVisible, setAnswerVisible] = useState(false)
  const [confirmingReveal, setConfirmingReveal] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const solved = localStorage.getItem(`solved_riddle_${riddle.id}`) === 'true'
    setIsSolved(solved)
  }, [riddle.id])

  const revealClue = () => {
    if (revealedClues < riddle.clues.length) {
      setRevealedClues(prev => prev + 1)
    }
  }

  const toggleClueVisibility = (idx: number) => {
    setHiddenClues(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const revealAnswer = () => {
    setConfirmingReveal(false)
    setAnswerRevealed(true)
    setAnswerVisible(true)
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
      prompt('Copy this link:', `${window.location.origin}/riddle/${riddle.id}`)
    }
  }

  const diff = difficultyConfig[riddle.difficulty]
  const isLong = riddle.question.length > QUESTION_PREVIEW_LENGTH
  const questionText = compact && isLong
    ? riddle.question.slice(0, QUESTION_PREVIEW_LENGTH).trimEnd() + '…'
    : riddle.question

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
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#1e3a5f', color: '#93c5fd', border: '1px solid #1d4ed840' }}
            >
              {riddle.category}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: diff.bg, color: diff.text, border: `1px solid ${diff.border}` }}
            >
              {diff.label}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSolved && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#14532d', color: '#4ade80' }}
                title="Solved!"
              >
                ✓
              </div>
            )}
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              #{riddle.id}
            </span>
          </div>
        </div>

        {/* Title */}
        {riddle.title && (
          compact ? (
            <Link href={`/riddle/${riddle.id}`}>
              <h2
                className="text-lg font-bold mb-2 hover:text-amber-400 transition-colors cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                {riddle.title}
              </h2>
            </Link>
          ) : (
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {riddle.title}
            </h2>
          )
        )}

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
        <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {questionText}
          {compact && isLong && (
            <Link
              href={`/riddle/${riddle.id}`}
              className="ml-1 text-sm font-normal hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Read more
            </Link>
          )}
        </p>
      </div>

      {/* Clues Section */}
      {riddle.clues.length > 0 && (
        <div className="px-5 pb-3 space-y-2">
          {riddle.clues.slice(0, revealedClues).map((clue, idx) => (
            <div key={idx} style={{ animation: 'fadeIn 0.35s ease-in-out' }}>
              {hiddenClues.has(idx) ? (
                <button
                  onClick={() => toggleClueVisibility(idx)}
                  className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: '#0f2744', border: '1px solid #1d4ed840', color: '#60a5fa' }}
                >
                  Show Clue {idx + 1}
                </button>
              ) : (
                <div
                  className="flex gap-2.5 p-3 rounded-lg text-sm"
                  style={{ backgroundColor: '#0f2744', border: '1px solid #1d4ed840' }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ backgroundColor: '#1d4ed8', color: '#bfdbfe' }}
                  >
                    {idx + 1}
                  </span>
                  <span className="flex-1" style={{ color: '#93c5fd' }}>{clue}</span>
                  <button
                    onClick={() => toggleClueVisibility(idx)}
                    className="flex-shrink-0 text-xs hover:opacity-70 transition-opacity"
                    style={{ color: '#60a5fa' }}
                    title="Hide clue"
                  >
                    Hide
                  </button>
                </div>
              )}
            </div>
          ))}

          {revealedClues < riddle.clues.length && !answerRevealed && (
            <button
              onClick={revealClue}
              className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ backgroundColor: '#0f2744', border: '1px solid #1d4ed840', color: '#60a5fa' }}
            >
              💡 Reveal Clue {revealedClues + 1}
              {riddle.clues.length > 1 && (
                <span className="ml-1 text-xs opacity-60">
                  ({revealedClues + 1} of {riddle.clues.length})
                </span>
              )}
            </button>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Answer Section */}
      <div className="px-5 pb-5 pt-2 space-y-2">
        {!answerRevealed ? (
          confirmingReveal ? (
            <div
              className="p-3 rounded-lg space-y-2"
              style={{ backgroundColor: '#422006', border: '1px solid #92400e' }}
            >
              <p className="text-sm text-center" style={{ color: '#fcd34d' }}>
                Sure you want to reveal the answer?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={revealAnswer}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
                >
                  Yes, reveal it
                </button>
                <button
                  onClick={() => setConfirmingReveal(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  Keep trying
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingReveal(true)}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
            >
              🔓 Reveal Answer
            </button>
          )
        ) : (
          <div>
            {answerVisible ? (
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: '#422006', border: '1px solid #92400e', animation: 'fadeIn 0.35s ease-in-out' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#d97706' }}>
                    Answer
                  </p>
                  <button
                    onClick={() => setAnswerVisible(false)}
                    className="text-xs hover:opacity-70 transition-opacity"
                    style={{ color: '#d97706' }}
                  >
                    Hide
                  </button>
                </div>
                <p className="text-base font-medium" style={{ color: '#fbbf24' }}>
                  {riddle.answer}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setAnswerVisible(true)}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
              >
                Show Answer
              </button>
            )}
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
          {copied ? '✓ Copied link!' : '🔗 Share this riddle'}
        </button>
      </div>
    </div>
  )
}
