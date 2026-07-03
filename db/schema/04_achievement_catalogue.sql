-- Achievement catalogue: the display definitions (glyph, title, description) for
-- each achievement. Public, read-only content — just like puzzles — so both the
-- anon (guest) and authenticated roles can read it. `sort_order` sets the order
-- shown in the rail.
--
-- NOTE: this is separate from `user_achievements` (01_achievements.sql), which
-- records *which* achievements each user has unlocked. The unlock logic itself
-- lives in the app (each achievement has a coded trigger); this table only holds
-- how it looks.
--
-- Idempotent: safe to run repeatedly.

create table if not exists public.achievements (
  id          text        not null primary key,
  glyph       text        not null,
  title       text        not null,
  description text        not null,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default clock_timestamp()
);

alter table public.achievements enable row level security;

drop policy if exists "read achievements" on public.achievements;
create policy "read achievements"
  on public.achievements for select
  to anon, authenticated
  using (true);

grant select on public.achievements to anon, authenticated;
