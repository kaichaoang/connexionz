-- Achievement definitions (display only). Each id must match an id the app
-- knows how to unlock (see the AchievementId union + the `unlock("...")` calls
-- in src/App.tsx) — the behavior lives in code, this is just the look.
--
-- `on conflict (id) do update` pushes edits on re-deploy.

-- Keep the catalogue to exactly the achievements below.
delete from public.achievements
  where id not in ('flawless', 'completionist', 'back_to_it', 'meow', 'you_remembered');

insert into public.achievements (id, glyph, title, description, sort_order) values
  ('you_remembered', '❤️',  'You remembered!',           'Solved The First One.',                         1),
  ('meow',           '🐱',  'Meow?',                     'Solved the cat puzzle.',                        2),
  ('flawless',       '✦',   'Flawless',                  'Solved a puzzle without a single mistake.',     3),
  ('back_to_it',     '↻',   'Back to the drawing board', 'Ran out of guesses. It happens to everyone.',   4)
on conflict (id) do update set
  glyph       = excluded.glyph,
  title       = excluded.title,
  description = excluded.description,
  sort_order  = excluded.sort_order;
