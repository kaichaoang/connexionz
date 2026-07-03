import { supabase } from "./supabase";
import type { Achievement, AchievementId } from "../types";

// Reads/writes the signed-in user's own rows. RLS (see db/schema/)
// enforces the "own rows only" rule in the database itself. Identity is managed
// in lib/auth.ts; these functions rely on the current session.

const TABLE = "user_achievements";
const DEFS_TABLE = "achievements";

interface Row {
  achievement_id: AchievementId;
}

interface DefRow {
  id: string;
  glyph: string;
  title: string;
  description: string;
}

// Load the achievement catalogue (display definitions). Public content, so this
// works for guests too. Empty on error — the caller falls back to the in-code list.
export async function fetchAchievementDefs(): Promise<Achievement[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(DEFS_TABLE)
    .select("id, glyph, title, description")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("Failed to load achievement definitions:", error.message);
    return [];
  }
  return (data as DefRow[]).map((r) => ({
    id: r.id as AchievementId,
    glyph: r.glyph,
    title: r.title,
    description: r.description,
  }));
}

// Load the current user's unlocked achievement ids.
export async function fetchRemote(): Promise<AchievementId[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from(TABLE).select("achievement_id");
  if (error) {
    console.error("Failed to load achievements:", error.message);
    return [];
  }
  return (data as Row[]).map((r) => r.achievement_id);
}

// Persist newly unlocked ids. Idempotent: duplicates are ignored.
export async function pushRemote(
  userId: string,
  ids: AchievementId[]
): Promise<void> {
  if (!supabase || ids.length === 0) return;
  const rows = ids.map((id) => ({ user_id: userId, achievement_id: id }));
  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });
  if (error) console.error("Failed to save achievements:", error.message);
}

// Wipe the user's achievements (used by reset()).
export async function clearRemote(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(TABLE).delete().eq("user_id", userId);
  if (error) console.error("Failed to clear achievements:", error.message);
}
