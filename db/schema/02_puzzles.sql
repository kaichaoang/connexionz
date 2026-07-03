-- Puzzles: one row per puzzle, identified by a custom string key you choose
-- (`id`) — e.g. 'week1-food'. `title` is the human-friendly name shown in the
-- picker; `data` holds the puzzle as JSON: four groups (yellow/green/blue/purple),
-- each { "label": string, "words": string[] }. Puzzles are shared content —
-- everyone reads the same rows — so this table is world-readable (to any signed-in
-- user) but not writable from the browser. Publish puzzles by adding rows in
-- db/seed/ and deploying, not from the app.
--
-- `created_at` defaults to clock_timestamp() (not now()) so each row gets a
-- distinct timestamp even when several are seeded in one transaction. The app
-- orders the picker by it, so puzzles show up in the order you added them.
--
-- Idempotent: safe to run repeatedly.

create table if not exists public.puzzles (
  id         text        not null primary key,
  title      text        not null,
  data       jsonb       not null,
  created_at timestamptz not null default clock_timestamp()
);

alter table public.puzzles enable row level security;

-- Puzzles are public content. Both signed-in accounts (`authenticated`) and
-- guests using the browser key with no session (`anon`) may read every puzzle,
-- so guests get the real puzzles too. Nobody can write from the browser.
drop policy if exists "read puzzles" on public.puzzles;
create policy "read puzzles"
  on public.puzzles for select
  to anon, authenticated
  using (true);

grant select on public.puzzles to anon, authenticated;
