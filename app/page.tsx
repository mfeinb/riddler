import { sql } from '@/lib/db'
import type { Riddle } from '@/lib/db'
import RiddleGrid from '@/components/RiddleGrid'

export default async function HomePage() {
  let riddles: Riddle[] = []
  let fetchError: string | null = null

  try {
    const rows = await sql`SELECT * FROM riddles ORDER BY created_at DESC`
    riddles = rows as Riddle[]
  } catch {
    fetchError = 'Failed to load riddles'
  }

  return <RiddleGrid initialRiddles={riddles} fetchError={fetchError} />
}
