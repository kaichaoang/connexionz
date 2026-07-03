# Connexionz

A word-grouping puzzle game — find the four hidden groups of four.

**▶ Play: https://kaichaoang.github.io/connexionz/**

Built with React + TypeScript + Vite, with an achievements system and optional
cloud save + email login via Supabase.

- **Zero-backend by default** — fully playable, saving progress in the browser (localStorage).
- **Guest or account** — play as a guest (progress saved on that device only), or
  sign in with **email + password** (or a magic link) to sync across devices.
- **Add Supabase** to serve puzzles from a database and store accounts' progress.
- **Auto-deploys** to GitHub Pages on every push to `main`.

Repo: https://github.com/kaichaoang/connexionz

---

## Run locally

Needs [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm run dev        # http://localhost:5173
```

The game is fully playable at this point — no database needed.

Other scripts: `npm run build` (type-check + production build), `npm run typecheck`, `npm run preview`.

---

## Deploy (GitHub Pages)

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which builds the app and force-pushes the built `dist/` to the **`gh-pages`**
branch. GitHub Pages serves that branch.

**One-time setup:** in **Settings → Pages → Build and deployment**, set
**Source: Deploy from a branch**, branch **`gh-pages`**, folder **`/ (root)`** →
https://github.com/kaichaoang/connexionz/settings/pages
(The `gh-pages` branch appears after the workflow runs once.)

- Live site → https://kaichaoang.github.io/connexionz/
- Deploy runs → https://github.com/kaichaoang/connexionz/actions

The Vite `base` is set to `/connexionz/` (in [`vite.config.ts`](vite.config.ts))
to match the repo path — the site lives at `…github.io/connexionz/` regardless
of which branch serves it. Rename the repo → update `base`.

> The workflow needs write access to push the branch. If the deploy step fails
> with a permissions error, set **Settings → Actions → General → Workflow
> permissions → Read and write permissions**.

---

## Database + login (Supabase)

Optional. Without it, the game runs per-browser. With it, puzzles come from the
database and each player's achievements + puzzle completions follow them across
devices.

Project dashboard → https://supabase.com/dashboard/project/wmhnlgizhdleoyiaftuz (free tier)

### 1. Apply the schema + seed

The whole database lives in [`db/`](db/README.md) — tables in `db/schema/`, puzzles in `db/seed/`. Deploy it with the **Deploy database** Action:

1. Add the repo secret **`SUPABASE_DB_URL`** → https://github.com/kaichaoang/connexionz/settings/secrets/actions

   Copy the **Session pooler** string verbatim from
   https://supabase.com/dashboard/project/wmhnlgizhdleoyiaftuz/settings/database
   (replace only the password). It looks like:
   ```
   postgresql://postgres.wmhnlgizhdleoyiaftuz:[YOUR-PASSWORD]@aws-N-[REGION].pooler.supabase.com:5432/postgres
   ```
   > ⚠️ **Not** the "Direct connection" (`db.wmhnlgizhdleoyiaftuz.supabase.co`) — it's
   > IPv6-only and GitHub runners can't reach it (`Network is unreachable`).
   >
   > Copy the host exactly — the prefix is `aws-0` **or** `aws-1` depending on the
   > project, and the region must match yours. A wrong host gives
   > `FATAL: Tenant or user not found`.
2. Run it: **Actions → Deploy database → Run workflow** (or `bash db/apply.sh` locally).

You get four tables with row-level security:

- `puzzles` — the puzzles, keyed by your custom `id` (world-readable).
- `achievements` — the achievement catalogue: glyph/title/description (world-readable).
- `puzzle_completions` — which puzzles each player finished (private per player).
- `user_achievements` — which achievements each player unlocked (private per player).

More detail (including how to wipe and start over) → [`db/README.md`](db/README.md).

### 2. Turn on auth

Accounts use **email + password** (plus an optional magic link). The Email
provider is on by default, so there's nothing to enable — guests need no auth at
all. Two optional tweaks in the dashboard:

- **Email links** (needed for magic links + signup confirmation) →
  https://supabase.com/dashboard/project/wmhnlgizhdleoyiaftuz/auth/url-configuration
  - **Site URL:** `https://kaichaoang.github.io/connexionz/`
  - **Redirect URLs:** add both that URL **and** `http://localhost:5173/` (so links work in dev).
- **Skip email confirmation** (optional) → Authentication → Providers → Email →
  turn off "Confirm email" if you want sign-ups to log in immediately instead of
  after clicking a confirmation link.

> Anonymous sign-in is **not** used anymore — leave it off.

### 3. Add the browser keys

From **Project Settings → API Keys**
(https://supabase.com/dashboard/project/wmhnlgizhdleoyiaftuz/settings/api) copy the
**Project URL** and the **publishable** key (`sb_publishable_...` — never the secret
one; the publishable key is safe in the browser because RLS is on).

- **Local:** `cp .env.example .env.local`, then:
  ```
  VITE_SUPABASE_URL=https://wmhnlgizhdleoyiaftuz.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
  ```
  Restart `npm run dev`.
- **Live:** add those same two as repo secrets →
  https://github.com/kaichaoang/connexionz/settings/secrets/actions
  The deploy workflow reads them at build time.

---

## Editing the game

- **Puzzles (database):** add a row to [`db/seed/puzzles.sql`](db/seed/puzzles.sql) — a
  custom `id`, a `title` for the picker, and four groups of exactly four words —
  then deploy the `seed` target. See [`db/README.md`](db/README.md).
- **Puzzles (offline fallback):** [`src/mocks/puzzles.ts`](src/mocks/puzzles.ts), used when Supabase isn't configured.
- **Achievements:** an achievement is two parts — its **look** and its **trigger**.
  1. Look (glyph/title/description) lives in the DB: add a row to
     [`db/seed/achievements.sql`](db/seed/achievements.sql) (and to the
     [`src/mocks/achievements.ts`](src/mocks/achievements.ts) fallback), then deploy the `seed` target.
  2. Trigger lives in code: add the id to `AchievementId` in [`src/types.ts`](src/types.ts),
     then call `unlock("your_id")` where it's earned (see the `unlock(` calls in [`src/App.tsx`](src/App.tsx)).
- **Colors:** palette in [`src/styles/global.css`](src/styles/global.css) (`:root`); tier colors in [`src/theme.ts`](src/theme.ts).
- **Wording:** in the components — e.g. [`src/components/AllSolvedCard.tsx`](src/components/AllSolvedCard.tsx), and the `flash(...)` calls in `src/App.tsx`.

---

## How saving works

- **Guests** (not signed in) save progress to the browser (localStorage) only —
  it stays on that device and isn't written to the database.
- **Signed-in accounts** save to the browser **and** the database at once, so
  progress follows them to any device they log in on.
- Sign in with **email + password**, or a passwordless **magic link**.
- When a guest later signs in, their local progress **merges** up into the
  account — nothing is lost.

---

## Project structure

```
connexionz/
├─ index.html                  Page shell
├─ vite.config.ts              Build config (GitHub Pages base path)
├─ .env.example                Template for Supabase keys
├─ db/                         Database source of truth — see db/README.md
│  ├─ schema/                  Tables + RLS (idempotent)
│  ├─ seed/                    Puzzles to load
│  ├─ reset.sql                Drops all tables (wipe & start over)
│  └─ apply.sh                 Applies the SQL to the database
├─ .github/workflows/
│  ├─ deploy.yml               Build + deploy the app to Pages on push
│  └─ deploy-db.yml            Deploy the database (manual, from Actions)
└─ src/
   ├─ App.tsx                  Game state + layout
   ├─ types.ts theme.ts        Shared types / colors + tiers
   ├─ mocks/                   Offline fallbacks (DB is the real source)
   │  ├─ puzzles.ts            · fallback puzzles
   │  └─ achievements.ts       · fallback achievement catalogue
   ├─ hooks/                   useAuth · usePuzzles · useAchievements
   ├─ lib/                     supabase client · auth · puzzles/achievements stores
   ├─ components/              Header, Board, Tile, PuzzleBar, EndCard, AuthBar, …
   └─ styles/global.css        All styling (CSS variables at the top)
```

---

## Troubleshooting

- **Blank page / 404 on Pages** → Pages is serving the wrong branch. **Source**
  must be **Deploy from a branch → `gh-pages`** (that branch holds the built
  files; serving `main` would show raw source and 404 on `/src/main.tsx`). Also
  confirm `base` in `vite.config.ts` is `/connexionz/`.
- **DB deploy: `Network is unreachable`** → you're using the direct (IPv6) connection
  string. Switch `SUPABASE_DB_URL` to the **Session pooler** string (see above).
- **Login link goes nowhere** → add the site + `localhost:5173` URLs to Supabase Redirect URLs.
- **Stuck on "Loading puzzles…"** → the puzzle fetch is failing. Make sure the
  `db/` schema was applied (including the `anon` read policy on `puzzles`) and
  the `VITE_SUPABASE_*` keys are correct. It falls back to the built-in puzzles
  after ~5s regardless.
- **Cloud saves not working (signed in)** → schema applied cleanly? Redirect URLs
  set (step 2)? Check the browser console.
- **`npm run build` fails** → a type error; run `npm run typecheck` to see it.
- **No music** → click the Play toggle (browsers block autoplay).
