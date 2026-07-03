# Database

Everything that defines the database lives here, so you can version it and push
it when you want.

```
db/
├─ schema/          Table definitions + Row Level Security (idempotent)
│  ├─ 01_achievements.sql            user_achievements (unlocks per player)
│  ├─ 02_puzzles.sql
│  ├─ 03_puzzle_completions.sql
│  └─ 04_achievement_catalogue.sql   achievements (display definitions)
├─ seed/            Data to load into the tables
│  ├─ puzzles.sql       The puzzles       ← add a row per puzzle, then deploy
│  └─ achievements.sql  Achievement look  ← glyph/title/description per id
├─ reset.sql        Drops all tables (wipe & start over) — run manually
└─ apply.sh         Runs the SQL against your database
```

Files are applied in filename order, `schema/` before `seed/` — that's why the
schema files are numbered (`puzzle_completions` references `puzzles`, so it must
come after). Everything is **idempotent**: re-running is safe. Editing a puzzle
in `seed/puzzles.sql` and deploying again updates that row in place.

## One-time setup: the connection secret

Get the connection string from Supabase →
https://supabase.com/dashboard/project/wmhnlgizhdleoyiaftuz/settings/database .
Choose the **Session pooler** tab (not "Direct connection") and copy the string
verbatim, replacing only the password:

```
postgresql://postgres.wmhnlgizhdleoyiaftuz:[YOUR-PASSWORD]@aws-N-[REGION].pooler.supabase.com:5432/postgres
```

> **Use the Session pooler, not the direct connection.** The direct host
> (`db.wmhnlgizhdleoyiaftuz.supabase.co`) is IPv6-only, and GitHub Actions
> runners have no IPv6 — psql fails with `Network is unreachable`. The Session
> pooler is reachable over IPv4. Use the **Session** pooler (port 5432), not the
> Transaction pooler (6543), since we run schema/DDL.
>
> **Copy the host exactly.** The prefix is `aws-0` **or** `aws-1` depending on the
> project, and the region must be yours — hand-assembling the wrong host gives
> `FATAL: Tenant or user not found` even though the username is correct.

Add it as the repository secret **`SUPABASE_DB_URL`** →
https://github.com/kaichaoang/connexionz/settings/secrets/actions

## Deploy from GitHub (the CD action)

**Actions tab → "Deploy database" → Run workflow.** Pick what to apply:

- `all` — schema then seed (default)
- `schema` — table/RLS changes only
- `seed` — data only (e.g. after adding a new puzzle)

It's manual on purpose, so database writes only happen when you ask for them.

## Deploy from your machine

Same script the action uses:

```bash
# Session pooler URI, copied verbatim from the dashboard (aws-N = aws-0 or aws-1):
export SUPABASE_DB_URL="postgresql://postgres.wmhnlgizhdleoyiaftuz:[YOUR-PASSWORD]@aws-N-[REGION].pooler.supabase.com:5432/postgres"
bash db/apply.sh          # all
bash db/apply.sh seed     # just the puzzles
```

Requires the `psql` client (`brew install libpq` / `apt-get install
postgresql-client`).

## Add a new puzzle

1. Add a row to `db/seed/puzzles.sql`: a unique `id` (your custom key), a
   `title` for the picker, and the `data` (copy an existing block; each group
   needs exactly four words).
2. Deploy the `seed` target.

Keep an `id` stable once players have solved that puzzle — their completion
records reference it. Puzzles show up in the picker in the order you add them.

## Wipe and start over

Since this isn't production yet, you can reset the whole database:

```bash
psql "$SUPABASE_DB_URL" -f db/reset.sql   # drops all tables + data
bash db/apply.sh all                      # recreate schema + seed
```

Or paste `db/reset.sql` into the Supabase SQL editor. `reset.sql` is never run
by `apply.sh` — you have to invoke it deliberately.
