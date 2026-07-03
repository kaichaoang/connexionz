// Shared domain types used across the app.

export type Tier = "yellow" | "green" | "blue" | "purple";

export type GameStatus = "playing" | "won" | "lost";

export interface TierInfo {
  color: string;
  ink: string;
  name: string;
}

// A category within a puzzle: its hidden label and the four member words.
export interface Group {
  label: string;
  words: string[];
}

// A full puzzle is one Group per difficulty tier.
export type Puzzle = Record<Tier, Group>;

// A puzzle plus its custom string key (`id`) and human-friendly display title.
export interface PuzzleEntry {
  id: string;
  title: string;
  puzzle: Puzzle;
}

// A user's record of finishing one puzzle, keyed by the puzzle's id. `won` is
// false if they ran out of guesses. Absence of a record means "not yet completed".
export interface PuzzleCompletion {
  id: string;
  won: boolean;
  mistakes: number;
}

// A single word on the board, tagged with the tier it belongs to.
export interface Tile {
  word: string;
  tier: Tier;
}

// A group the player has cleared (or that was revealed on a loss).
export interface SolvedGroup {
  tier: Tier;
  label: string;
  words: string[];
}

export type AchievementId =
  | "flawless"
  | "completionist"
  | "back_to_it"
  | "meow"
  | "you_remembered";

export interface Achievement {
  id: AchievementId;
  glyph: string;
  title: string;
  description: string;
}
