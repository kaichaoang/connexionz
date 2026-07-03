import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Puzzle, PuzzleEntry, PuzzleCompletion } from "../types";
import { isRemoteEnabled } from "../lib/supabase";
import { PUZZLES } from "../mocks/puzzles";
import {
  fetchPuzzles,
  fetchCompletions,
  pushCompletion,
  clearCompletion,
  clearAllCompletions,
} from "../lib/puzzlesStore";

// Owns "which puzzles exist" and "which the user has completed".
//
// Puzzle content comes from Supabase (the `puzzles` table, each identified by a
// custom string key). When there's no backend — or the table is empty — it
// falls back to the in-code PUZZLES. Completion records write
// to localStorage immediately and mirror to Supabase, merging both ways on
// identity changes, exactly like useAchievements.
//
// Pass the current user id from useAuth.

const STORAGE_KEY = "connexionz.completions.v2";

interface PuzzlesApi {
  ready: boolean; // false until the puzzle list is resolved
  entries: PuzzleEntry[]; // in added order; entries[0] is the default
  activeId: string | null;
  activePuzzle: Puzzle | null;
  completions: Map<string, PuzzleCompletion>;
  allCompleted: boolean;
  selectPuzzle: (id: string) => void;
  markCompleted: (c: PuzzleCompletion) => void;
  resetPuzzle: (id: string) => void;
  resetAll: () => void;
}

// The in-code puzzles already carry their real ids/titles.
function fallbackEntries(): PuzzleEntry[] {
  return PUZZLES;
}

function localLoad(): Map<string, PuzzleCompletion> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const arr = JSON.parse(raw) as PuzzleCompletion[];
    return new Map(arr.map((c) => [c.id, c]));
  } catch {
    return new Map();
  }
}

function localSave(map: Map<string, PuzzleCompletion>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...map.values()]));
  } catch {
    /* storage unavailable — remote (if on) still persists */
  }
}

export function usePuzzles(userId: string | null): PuzzlesApi {
  const [entries, setEntries] = useState<PuzzleEntry[]>(() =>
    isRemoteEnabled ? [] : fallbackEntries()
  );
  const [ready, setReady] = useState(!isRemoteEnabled);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completions, setCompletions] = useState<Map<string, PuzzleCompletion>>(
    () => localLoad()
  );

  const completionsRef = useRef(completions);

  // Load the puzzle list once, on mount. Puzzles are world-readable (the `anon`
  // role can read them — see db/schema/02_puzzles.sql), so this works for guests
  // too and doesn't wait on sign-in. Falls back to the in-code puzzles if the
  // table is empty or unreadable, so the app never hangs on "Loading…".
  useEffect(() => {
    if (!isRemoteEnabled) return;
    let cancelled = false;

    // Don't let a slow/unreachable backend hang the app on "Loading…": if the
    // fetch hasn't answered in a few seconds, fall back to the in-code puzzles.
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));

    (async () => {
      const remote = await Promise.race([fetchPuzzles(), timeout]);
      if (cancelled) return;
      setEntries(remote && remote.length ? remote : fallbackEntries());
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // On any identity change, pull that user's completions and merge with local.
  useEffect(() => {
    if (!isRemoteEnabled || !userId) return;
    let cancelled = false;

    (async () => {
      const remote = await fetchCompletions();
      if (cancelled) return;

      const local = completionsRef.current;
      const merged = new Map(local);
      for (const r of remote) if (!merged.has(r.id)) merged.set(r.id, r);
      completionsRef.current = merged;
      setCompletions(merged);
      localSave(merged);

      // Push anything this device recorded that the account didn't have yet.
      const localOnly = [...local.values()].filter(
        (c) => !remote.some((r) => r.id === c.id)
      );
      for (const c of localOnly) void pushCompletion(userId, c);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Default to the first puzzle, and keep the selection valid if the list
  // arrives or changes underneath it.
  useEffect(() => {
    if (!entries.length) return;
    setActiveId((cur) =>
      cur && entries.some((e) => e.id === cur) ? cur : entries[0].id
    );
  }, [entries]);

  const activePuzzle = useMemo(
    () => entries.find((e) => e.id === activeId)?.puzzle ?? null,
    [entries, activeId]
  );

  const allCompleted =
    entries.length > 0 && entries.every((e) => completions.has(e.id));

  const selectPuzzle = useCallback((id: string): void => {
    setActiveId(id);
  }, []);

  const markCompleted = useCallback(
    (c: PuzzleCompletion): void => {
      const next = new Map(completionsRef.current);
      next.set(c.id, c);
      completionsRef.current = next;
      setCompletions(next);
      localSave(next);
      if (userId) void pushCompletion(userId, c);
    },
    [userId]
  );

  const resetPuzzle = useCallback(
    (id: string): void => {
      const next = new Map(completionsRef.current);
      next.delete(id);
      completionsRef.current = next;
      setCompletions(next);
      localSave(next);
      if (userId) void clearCompletion(userId, id);
    },
    [userId]
  );

  const resetAll = useCallback((): void => {
    const empty = new Map<string, PuzzleCompletion>();
    completionsRef.current = empty;
    setCompletions(empty);
    localSave(empty);
    if (userId) void clearAllCompletions(userId);
  }, [userId]);

  return {
    ready,
    entries,
    activeId,
    activePuzzle,
    completions,
    allCompleted,
    selectPuzzle,
    markCompleted,
    resetPuzzle,
    resetAll,
  };
}
