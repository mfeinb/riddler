import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

interface Params {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }
  try {
    const rows = await sql`SELECT * FROM riddles WHERE id = ${id}`
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Riddle not found' }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error(`GET /api/riddles/${id} error:`, err)
    return NextResponse.json({ error: 'Failed to fetch riddle' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = parseInt(params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
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
      UPDATE riddles SET
        question = ${question.trim()},
        answer = ${answer.trim()},
        clues = ${cleanClues},
        image_url = ${image_url},
        category = ${category.trim() || 'General'},
        difficulty = ${difficulty}
      WHERE id = ${id}
      RETURNING *
    `
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Riddle not found' }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (err) {
    console.error(`PUT /api/riddles/${id} error:`, err)
    return NextResponse.json({ error: 'Failed to update riddle' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = parseInt(params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const rows = await sql`DELETE FROM riddles WHERE id = ${id} RETURNING id`
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Riddle not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error(`DELETE /api/riddles/${id} error:`, err)
    return NextResponse.json({ error: 'Failed to delete riddle' }, { status: 500 })
  }
}
