import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Riddler',
  description: 'Challenge your mind with riddles of all kinds. Reveal clues, uncover answers, and track your progress.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <header className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3 group">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}
                >
                  ?
                </div>
                <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  The Riddler
                </span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium transition-colors hover:text-amber-400"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Riddles
                </Link>
                <Link
                  href="/admin"
                  className="text-sm font-medium transition-colors hover:text-amber-400"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Admin
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t mt-16" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            The Riddler &mdash; Challenge your mind
          </div>
        </footer>
      </body>
    </html>
  )
}
