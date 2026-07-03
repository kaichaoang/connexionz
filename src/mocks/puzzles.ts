import type { PuzzleEntry } from "../types";

// Mock / offline fallback puzzles — used only when there's no Supabase backend
// (or the puzzles table is empty). The real source of truth is the database
// (db/seed/puzzles.sql); keep the ids/titles here in sync with it so features
// keyed on a puzzle id (like the "meow" achievement) work offline too.

export const PUZZLES: PuzzleEntry[] = [
  {
    id: "the-first-one",
    title: "The First One",
    puzzle: {
      yellow: { label: "HK's favourite food", words: ["NASI PADANG", "BIBIMBAP", "CARROT CAKE", "MALA"] },
      green: { label: "Our interests", words: ["YOU", "ME", "CATS", "GAMES"] },
      blue: { label: "KC's favourite food", words: ["FRIED CHICKEN", "STEAK", "BCM", "ROASTED DELICACIES"] },
      purple: { label: "Our first date", words: ["TRIP", "LIGHTS", "PHOTO", "AFTER WORK"] },
    },
  },
  {
    id: "meow-meow",
    title: "Meow Meow",
    puzzle: {
      yellow: { label: "Sounds a cat makes", words: ["MEOW", "PURR", "HISS", "YOWL"] },
      green: { label: "Colors of cats", words: ["BLACK", "WHITE", "GINGER", "GREY"] },
      blue: { label: "Breeds of cats", words: ["PERSIAN", "SIAMESE", "SPHYNX", "BENGAL"] },
      purple: { label: "Cute things about cats", words: ["ZOOMIES", "LOAF", "TOE BEANS", "WHISKERS"] },
    },
  },
];
