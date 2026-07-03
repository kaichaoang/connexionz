import { TIER_ORDER } from "../theme";
import type { Puzzle, Tile, SolvedGroup } from "../types";

// Fisher–Yates shuffle, returns a new array.
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Flatten a puzzle into 16 shuffled tiles.
export function buildTiles(puzzle: Puzzle): Tile[] {
  const tiles: Tile[] = [];
  for (const tier of TIER_ORDER) {
    for (const word of puzzle[tier].words) tiles.push({ word, tier });
  }
  return shuffle(tiles);
}

// Order-independent key for a set of four words, used to detect repeat guesses.
export function setKey(words: string[]): string {
  return [...words].sort().join("|");
}

// Sort solved groups by difficulty so bands always stack easiest-first.
export function byTier(a: SolvedGroup, b: SolvedGroup): number {
  return TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
}
