# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This is **Next.js 16** — APIs and conventions differ from older versions in your
training data. Notably in this repo:

- **`proxy.ts` replaces `middleware.ts`.** The file is [`src/proxy.ts`](src/proxy.ts)
  and exports a `proxy()` function (not `middleware()`). Do not re-add a
  `middleware.ts`.
- **`params` and `searchParams` are Promises** in pages/layouts — `await` them.
- **`cookies()` from `next/headers` is async** — `await` it (see
  [`src/lib/supabase/server.ts`](src/lib/supabase/server.ts)).

When unsure about a framework API, check `node_modules/next/dist/docs/` rather
than assuming older behaviour.
<!-- END:nextjs-agent-rules -->

## What this app is

A personal "error log" for VCE study: the user uploads screenshots of problems
they got wrong (Methods / Specialist / Physics), tags them, reviews them, and
gets AI worked solutions + stats. See [README.md](README.md) for product detail
and setup.

## Commands

```bash
npm run dev      # dev server (localhost:3000)
npm run build    # production build — ALSO runs full TypeScript type-check
npm run lint     # ESLint (CI-strict; e.g. no setState-in-effect)
npm run start    # serve a production build
```

There is no test suite. **`npm run build` is the primary correctness gate** (it
type-checks every route); run it after non-trivial changes. The dev server will
throw on boot if Supabase env vars are missing — that's expected without
`.env.local`.

## Architecture

Next.js App Router. Server Components fetch data; Client Components handle
interaction and mutations. There is no separate API layer except the AI route.

### Data flow (important pattern)

- **Reads** happen in Server Components via the **server** Supabase client
  ([`src/lib/data.ts`](src/lib/data.ts), [`src/lib/supabase/server.ts`](src/lib/supabase/server.ts)).
- **Writes** (create/update/delete problem, log a review, upload an image)
  happen **directly from Client Components** using the **browser** Supabase
  client ([`src/lib/supabase/client.ts`](src/lib/supabase/client.ts)), then call
  `router.refresh()` to re-pull server data. There are no Server Actions.
- Security is enforced by **Postgres Row Level Security**, not app code: every
  `problems`/`reviews` row is scoped to `auth.uid()`. The schema lives in
  [`supabase/schema.sql`](supabase/schema.sql) — keep it in sync with
  [`src/lib/types.ts`](src/lib/types.ts) whenever columns change.

### Auth & route protection

[`src/proxy.ts`](src/proxy.ts) → [`src/lib/supabase/middleware.ts`](src/lib/supabase/middleware.ts)
runs on every request: it refreshes the session and redirects unauthenticated
users to `/login`. When Supabase env vars are absent
([`src/lib/supabase/config.ts`](src/lib/supabase/config.ts)), it routes
everything to `/login`, which renders a setup notice instead of crashing.
Authenticated pages live under the `src/app/(app)/` route group, whose layout
double-checks the user.

**Always read the current user via [`getCurrentUser()`](src/lib/auth.ts)**, not
`supabase.auth.getUser()` directly. It is wrapped in React `cache()` so the
layout, page, and helpers share **one** auth round-trip per request — calling
`getUser()` ad hoc reintroduces redundant network calls and is the main perf
footgun here.

### Admin & AI permissions

- AI generation is a **per-account privilege**. The `profiles` table
  (`ai_enabled`, `ai_generations`) gates it; new sign-ups default to `false`, a
  signup trigger creates the row, and existing users are backfilled `true`. See
  the profiles section of [`supabase/schema.sql`](supabase/schema.sql).
- **Admins** are defined by the `ADMIN_EMAILS` env var (comma-separated), never
  a DB flag — see [`src/lib/adminConfig.ts`](src/lib/adminConfig.ts). Admins
  always have AI. [`canUseAi()`](src/lib/admin.ts) is the single source of truth
  and is enforced server-side in the AI route, not just the UI.
- The `/admin` page and `/api/admin/*` routes use a **secret-key** Supabase
  client ([`src/lib/supabase/admin.ts`](src/lib/supabase/admin.ts)) that
  bypasses RLS. Only ever instantiate it server-side behind an `isAdminEmail`
  check. `SUPABASE_SECRET_KEY` is required for those features (graceful notice
  if absent).

### Images

Screenshots are resized **client-side** to WebP via canvas
([`src/lib/images.ts`](src/lib/images.ts)) before upload to the Supabase Storage
bucket `problem-images`, stored at `<user_id>/<uuid>.webp`. The DB stores only
the path; build display URLs with `publicImageUrl()`. Plain `<img>` is used
(not `next/image`) to avoid remote-image config. The lightbox/zoom lives in
[`src/components/ProblemImage.tsx`](src/components/ProblemImage.tsx).

### AI solutions

The **only** server route is [`src/app/api/ai-solution/route.ts`](src/app/api/ai-solution/route.ts).
It authenticates, loads the problem (RLS-scoped), fetches the screenshot bytes,
and calls Gemini ([`src/lib/gemini.ts`](src/lib/gemini.ts)) with a VCE-tutor
prompt that requests LaTeX. The result is cached in `problems.ai_solution`.
`GEMINI_API_KEY` is server-only; if absent the route returns 503 and the UI
shows a graceful message. Solutions render through
[`src/components/Markdown.tsx`](src/components/Markdown.tsx) (remark-math +
rehype-katex), so any math output must be valid LaTeX (`$…$` / `$$…$$`).

## Conventions

- **Subjects/topics/statuses are centralized** in
  [`src/lib/constants.ts`](src/lib/constants.ts). Add VCE topics there, not
  inline. `usesCas` controls whether the CAS-vs-tech-free UI shows (false for
  Physics).
- **Theming**: light/dark is class-based (`.dark` on `<html>`), set before paint
  by the inline script in [`src/app/layout.tsx`](src/app/layout.tsx). Semantic
  colors (`bg-surface`, `text-muted`, `border-border`, …) are CSS variables
  defined in [`src/app/globals.css`](src/app/globals.css) — prefer these over
  raw `gray-*`. Per-subject accent classes are **static literals** in
  [`src/lib/theme.ts`](src/lib/theme.ts); never build them dynamically
  (`bg-${color}`), or Tailwind v4 will purge them.
- The theme toggle uses `useSyncExternalStore` deliberately — the lint config
  forbids `setState` inside `useEffect`.
