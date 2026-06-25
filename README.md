# Error Log

A modern web app for logging the problems you get wrong — built for VCE
**Methods**, **Specialist**, and **Physics**, but useful for any subject.

Paste a screenshot of a question you missed, tag it (topic, paper, CAS vs
tech-free, status), hide the answer until you want it, get an **AI worked
solution**, and track where your mistakes cluster on a **stats** page.

- **Upload** — paste, drag, or pick a screenshot; it's auto-resized and stored.
- **Review** — filter by subject/topic/status, search, reveal answers, log each
  attempt as "got it" / "missed".
- **AI solutions** — Google Gemini reads the screenshot and writes step-by-step
  working with proper maths (LaTeX), plus a "common mistake" note.
- **Stats** — errors by subject, progress, your worst topics, review accuracy.
- **Light / dark** theme, responsive on tablet and laptop.

## Tech stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| App framework  | Next.js 16 (App Router) + React 19 + TypeScript   |
| Styling        | Tailwind CSS v4                                    |
| Data + auth    | Supabase (Postgres + Auth)                         |
| Image storage  | Supabase Storage (`problem-images` bucket)         |
| AI solutions   | Google Gemini (free tier) via `@google/genai`     |
| Charts         | Recharts                                           |

Everything above has a **free tier** — no cost for personal use.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project (free)

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and **Run**. This creates the
   tables, security rules, and the image storage bucket.
3. Go to **Project Settings → API** and copy the **Project URL** and the
   **anon / public** key.

### 3. Get a free Gemini API key (optional, for AI solutions)

1. Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Create an API key (the free tier is enough for personal use).

> Skip this and the app still works fully — the AI button just returns a "not
> configured" message until you add a key.

### 4. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key   # optional
```

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and
start logging. (Until the keys are set, the app shows a setup notice.)

## Deploy (so your tablet + laptop share the same data)

1. Push this folder to a GitHub repo.
2. Import it into [Vercel](https://vercel.com) (free).
3. Add the same environment variables in the Vercel project settings.
4. Deploy. Your data and images live in Supabase, so every device stays in sync.

## Scripts

```bash
npm run dev     # local dev server
npm run build   # production build (also type-checks)
npm run start   # serve the production build
npm run lint    # ESLint
```

## Notes

- The image bucket is **public-read** but writes are scoped to each user, and
  filenames are random UUIDs. Fine for study screenshots; not for secrets.
- Auth is email + password via Supabase. Email confirmation may be on by
  default — you can disable it under **Authentication → Providers → Email** in
  Supabase for a frictionless single-user setup.
