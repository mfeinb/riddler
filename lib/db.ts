import { neon, NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction<false, false> | null = null

export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

export const sql: NeonQueryFunction<false, false> = (
  (...args: Parameters<NeonQueryFunction<false, false>>) =>
    getDb()(...args)
) as NeonQueryFunction<false, false>

export type Riddle = {
  id: number
  title: string | null
  question: string
  answer: string
  clues: string[]
  image_url: string | null
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  created_at: string
}
