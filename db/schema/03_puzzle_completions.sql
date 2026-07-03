-- Per-user puzzle completion: one row per (user, puzzle) once they finish it.
-- `won` records whether they solved it or ran out of guesses; `mistakes` is how
-- many wrong guesses it took. Resetting a puzzle deletes its row so the user can
-- replay it fresh (that's why delete is granted below).
--
-- References public.puzzles(id), so this file must run after 02_puzzles.sql (the
-- numeric filename prefixes guarantee that order).
--
-- Idempotent: safe to run repeatedly.

create table if not exists public.puzzle_completions (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  puzzle_id    text        not null references public.puzzles (id) on delete cascade,
  won          boolean     not null default true,
  mistakes     integer     not null default 0,
  completed_at timestamptz not null default now(),
  primary key (user_id, puzzle_id)
);

alter table public.puzzle_completions enable row level security;

-- Same own-rows-only rules as achievements. update is granted too so a replay
-- that ends differently (e.g. won after a prior loss) can overwrite the record.
drop policy if exists "read own completions" on public.puzzle_completions;
create policy "read own completions"
  on public.puzzle_completions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "insert own completions" on public.puzzle_completions;
create policy "insert own completions"
  on public.puzzle_completions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "update own completions" on public.puzzle_completions;
create policy "update own completions"
  on public.puzzle_completions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "delete own completions" on public.puzzle_completions;
create policy "delete own completions"
  on public.puzzle_completions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.puzzle_completions to authenticated;
