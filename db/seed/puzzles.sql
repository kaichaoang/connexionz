-- The puzzles you want live in the database. Each row is:
--   id     — your own custom key (must be unique); how the app and completions
--            refer to this puzzle. Keep it stable once players have solved it.
--   title  — the name shown in the picker dropdown.
--   data   — the puzzle: four groups, each { "label", "words" (exactly 4) }.
--
-- `on conflict (id) do update` means re-deploying is safe AND pushes edits.

-- Keep the database to exactly the puzzles defined below: drop anything else.
-- (Cascades to those puzzles' completion rows.) Extend the id list if you add
-- more puzzles.
delete from public.puzzles where id not in ('the-first-one', 'meow-meow');

insert into public.puzzles (id, title, data) values
  ('the-first-one', 'The First One', '{
    "yellow": { "label": "HK''s favourite food", "words": ["NASI PADANG", "BIBIMBAP", "CARROT CAKE", "MALA"] },
    "green":  { "label": "Our interests",        "words": ["YOU", "ME", "CATS", "GAMES"] },
    "blue":   { "label": "KC''s favourite food", "words": ["FRIED CHICKEN", "STEAK", "BCM", "ROASTED DELICACIES"] },
    "purple": { "label": "Our first date",       "words": ["TRIP", "LIGHTS", "PHOTO", "AFTER WORK"] }
  }'::jsonb),
  ('meow-meow', 'Meow Meow', '{
    "yellow": { "label": "Sounds a cat makes",      "words": ["MEOW", "PURR", "HISS", "YOWL"] },
    "green":  { "label": "Colors of cats",          "words": ["BLACK", "WHITE", "GINGER", "GREY"] },
    "blue":   { "label": "Breeds of cats",          "words": ["PERSIAN", "SIAMESE", "SPHYNX", "BENGAL"] },
    "purple": { "label": "Cute things about cats",  "words": ["ZOOMIES", "LOAF", "TOE BEANS", "WHISKERS"] }
  }'::jsonb)
on conflict (id) do update set title = excluded.title, data = excluded.data;
