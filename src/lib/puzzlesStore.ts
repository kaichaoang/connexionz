import { supabase } from "./supabase";
import type { Puzzle, PuzzleEntry, PuzzleCompletion } from "../types";

// Remote data access for puzzles and per-user completion. Puzzles are shared,
// read-only content; completions are private rows guarded by RLS (see
// db/schema/). Every function is a no-op returning empty/void when Supabase
// isn't configured, so the app still runs on its in-code fallback.

const PUZZLES_TABLE = "puzzles";
const COMPLETIONS_TABLE = "puzzle_completions";

interface PuzzleRow {
  id: string;
  title: string;
  data: Puzzle;
}

interface CompletionRow {
  puzzle_id: string;
  won: boolean;
  mistakes: number;
}

// Every puzzle, in the order they were added (oldest first); the caller treats
// the first as the default.
export async function fetchPuzzles(): Promise<PuzzleEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(PUZZLES_TABLE)
    .select("id, title, data")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Failed to load puzzles:", error.message);
    return [];
  }
  return (data as PuzzleRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    puzzle: r.data,
  }));
}

// The signed-in user's completion records, one per finished puzzle.
export async function fetchCompletions(): Promise<PuzzleCompletion[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(COMPLETIONS_TABLE)
    .select("puzzle_id, won, mistakes");
  if (error) {
    console.error("Failed to load completions:", error.message);
    return [];
  }
  return (data as CompletionRow[]).map((r) => ({
    id: r.puzzle_id,
    won: r.won,
    mistakes: r.mistakes,
  }));
}

// Record (or overwrite) a completion. Upsert makes replaying a puzzle update
// the stored result rather than erroring on the (user, puzzle) primary key.
export async function pushCompletion(
  userId: string,
  c: PuzzleCompletion
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(COMPLETIONS_TABLE).upsert(
    {
      user_id: userId,
      puzzle_id: c.id,
      won: c.won,
      mistakes: c.mistakes,
    },
    { onConflict: "user_id,puzzle_id" }
  );
  if (error) console.error("Failed to save completion:", error.message);
}

// Delete one completion (used by reset), letting the user replay it fresh.
export async function clearCompletion(
  userId: string,
  id: string
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from(COMPLETIONS_TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("puzzle_id", id);
  if (error) console.error("Failed to reset completion:", error.message);
}

// Delete all of the user's completions (used by "play from the top").
export async function clearAllCompletions(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from(COMPLETIONS_TABLE)
    .delete()
    .eq("user_id", userId);
  if (error) console.error("Failed to reset completions:", error.message);
}
