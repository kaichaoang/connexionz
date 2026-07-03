-- DANGER: drops every Connexionz table and all its data. For wiping a
-- non-production database to start over. `cascade` also removes the RLS
-- policies and the puzzle_completions foreign key.
--
-- After running this, re-apply everything: `bash db/apply.sh all`
-- (or the "Deploy database" Action).
--
-- This file is NOT run by apply.sh — invoke it deliberately:
--   psql "$SUPABASE_DB_URL" -f db/reset.sql
-- or paste it into the Supabase SQL editor.

drop table if exists public.puzzle_completions cascade;
drop table if exists public.user_achievements cascade;
drop table if exists public.puzzles cascade;
drop table if exists public.achievements cascade;
