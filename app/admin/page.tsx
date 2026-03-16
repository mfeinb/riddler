import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { sql } from '@/lib/db'
import type { Riddle } from '@/lib/db'
import AdminDashboard from '@/components/AdminDashboard'

async function getRiddles(): Promise<Riddle[]> {
  try {
    const rows = await sql`SELECT * FROM riddles ORDER BY created_at DESC`
    return rows as Riddle[]
  } catch {
    return []
  }
}

export default async function AdminPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/admin/login')
  }

  const riddles = await getRiddles()
  const categories = Array.from(new Set(riddles.map(r => r.category))).sort()

  return <AdminDashboard initialRiddles={riddles} initialCategories={categories} />
}
