-- Achievements: one row per (user, achievement). The composite primary key
-- makes unlocking the same achievement twice a harmless no-op.
--
-- Everything in this file is idempotent (safe to run repeatedly) so the deploy
-- workflow can re-apply it any time.

create table if not exists public.user_achievements (
  user_id        uuid        not null references auth.users (id) on delete cascade,
  achievement_id text        not null,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- Row Level Security is what makes the public (browser) key safe. Without this,
-- anyone with the key could read or write everyone's data.
alter table public.user_achievements enable row level security;

-- The signed-in user (including anonymous users, who assume the `authenticated`
-- role) may only see and change rows where user_id matches their own id.
-- Wrapping auth.uid() in a subselect lets Postgres cache it per statement.
-- `drop policy if exists` first keeps re-running this file safe (Postgres has
-- no `create policy if not exists`).
drop policy if exists "read own achievements" on public.user_achievements;
create policy "read own achievements"
  on public.user_achievements for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "insert own achievements" on public.user_achievements;
create policy "insert own achievements"
  on public.user_achievements for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "delete own achievements" on public.user_achievements;
create policy "delete own achievements"
  on public.user_achievements for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Make sure the authenticated role has table privileges (RLS then narrows which
-- rows those privileges apply to). Harmless if Supabase already granted these.
grant select, insert, delete on public.user_achievements to authenticated;
