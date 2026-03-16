# The Riddler

A personal riddle-hosting website. Share riddles with friends — they can reveal clues one at a time and uncover the answer when they're ready.

## Features

- Browse riddles with category and difficulty filters
- Progressive clue reveal (up to 3 clues per riddle)
- Confirm before revealing an answer; hide/show clues and answers after revealing
- Titles, images, and share links for individual riddles
- Progress tracking (browser remembers which riddles you've solved)
- Random riddle picker
- Password-protected admin panel to add, edit, and delete riddles

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Neon](https://neon.tech/) — serverless Postgres
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) — image storage
- [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

## Running Locally

**1. Install dependencies**

```bash
npm install
```

**2. Set up environment variables**

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | Random string (32+ chars) for signing session cookies |
| `ADMIN_PASSWORD` | Password for the `/admin` panel |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (optional — only needed for image uploads) |

**3. Run the database migration**

```bash
npm run db:migrate
```

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repo to GitHub
2. Import it on [vercel.com](https://vercel.com)
3. Add the environment variables in **Project Settings → Environment Variables**
4. For image uploads, create a Blob store under **Project → Storage → Blob** — Vercel adds the token automatically
5. Run `npm run db:migrate` locally (it connects to Neon directly via `DATABASE_URL`)

## Admin Panel

Go to `/admin` and enter your `ADMIN_PASSWORD` to add, edit, or delete riddles. Each riddle supports a title, question, answer, up to 3 clues, a category, a difficulty level, and an optional image.
