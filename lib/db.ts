import { neon, NeonQueryFunction } from '@neondatabase/serverless'

export function getDb(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  const url = process.env.DATABASE_URL.replace('channel_binding=require', '').replace(/&&|&$|\?$/, '')
  return neon(url)
}

export const sql: NeonQueryFunction<false, false> = ((...args: Parameters<NeonQueryFunction<false, false>>) => {
  return getDb()(...args)
}) as NeonQueryFunction<false, false>

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
