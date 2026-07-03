import type { Achievement } from "../types";

// Mock / offline fallback for the achievement catalogue. The real source of
// truth is the database (db/seed/achievements.sql); this list is used only when
// there's no backend (or the achievements table is empty). Keep the ids in sync
// with the AchievementId union in types.ts and the coded `unlock("...")` calls.

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "flawless",
    glyph: "✦",
    title: "Flawless",
    description: "Solved a puzzle without a single mistake.",
  },
  {
    id: "completionist",
    glyph: "♛",
    title: "Completionist",
    description: "Solved every puzzle in the parlour.",
  },
  {
    id: "back_to_it",
    glyph: "↻",
    title: "Back to the drawing board",
    description: "Ran out of guesses. It happens to everyone.",
  },
  {
    id: "meow",
    glyph: "🐱",
    title: "Meow?",
    description: "Solved the cat puzzle.",
  },
  {
    id: "you_remembered",
    glyph: "❤️",
    title: "You remembered!",
    description: "Solved The First One.",
  },
];
