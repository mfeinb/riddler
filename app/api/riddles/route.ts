import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM riddles ORDER BY created_at DESC`
    return NextResponse.json(rows)
  } catch (err) {
    console.error('GET /api/riddles error:', err)
    return NextResponse.json({ error: 'Failed to fetch riddles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { question, answer, clues = [], category = 'General', difficulty = 'medium', image_url = null } = body

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }
    if (!answer?.trim()) {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
    }
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
    }
    if (!Array.isArray(clues) || clues.length > 3) {
      return NextResponse.json({ error: 'Invalid clues (max 3)' }, { status: 400 })
    }

    const cleanClues = clues.filter((c: string) => c && c.trim() !== '')

    const rows = await sql`
      INSERT INTO riddles (question, answer, clues, image_url, category, difficulty)
      VALUES (
        ${question.trim()},
        ${answer.trim()},
        ${cleanClues},
        ${image_url},
        ${category.trim() || 'General'},
        ${difficulty}
      )
      RETURNING *
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err) {
    console.error('POST /api/riddles error:', err)
    return NextResponse.json({ error: 'Failed to create riddle' }, { status: 500 })
  }
}
