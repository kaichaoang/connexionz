import { useState, useCallback, useRef, useEffect } from "react";
import type { Achievement, AchievementId } from "../types";
import { isRemoteEnabled } from "../lib/supabase";
import {
  fetchRemote,
  pushRemote,
  clearRemote,
  fetchAchievementDefs,
} from "../lib/achievementsStore";
import { ACHIEVEMENTS } from "../mocks/achievements";

// Tracks unlocked achievements. Writes hit localStorage immediately (instant,
// offline) and mirror to Supabase when a user id is available. Whenever the
// signed-in user changes (e.g. anonymous -> logged in on a new device), the
// local and remote sets are merged both ways so trophies are never lost.
//
// Pass the current user id from useAuth. unlock(id) is idempotent.

const STORAGE_KEY = "connexionz.achievements.v1";

interface AchievementsApi {
  definitions: Achievement[]; // the catalogue (from the DB, or the mock fallback)
  unlocked: Set<AchievementId>;
  justUnlocked: AchievementId | null;
  unlock: (id: AchievementId) => void;
  dismissToast: () => void;
  reset: () => void;
}

function localLoad(): Set<AchievementId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as AchievementId[]) : new Set();
  } catch {
    return new Set();
  }
}

function localSave(set: Set<AchievementId>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* storage unavailable — remote (if on) still persists */
  }
}

export function useAchievements(userId: string | null): AchievementsApi {
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(() => localLoad());
  const [justUnlocked, setJustUnlocked] = useState<AchievementId | null>(null);
  // Start from the in-code catalogue so the rail is never empty; replace with the
  // database's definitions once they load (they're the source of truth).
  const [definitions, setDefinitions] = useState<Achievement[]>(ACHIEVEMENTS);

  const unlockedRef = useRef<Set<AchievementId>>(unlocked);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the achievement catalogue once on mount (public content — no sign-in
  // needed). Keeps the fallback if the fetch is empty or fails.
  useEffect(() => {
    if (!isRemoteEnabled) return;
    let cancelled = false;
    (async () => {
      const remote = await fetchAchievementDefs();
      if (!cancelled && remote.length) setDefinitions(remote);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // On any identity change, pull that user's rows and merge with local.
  useEffect(() => {
    if (!isRemoteEnabled || !userId) return;
    let cancelled = false;

    (async () => {
      const remote = new Set(await fetchRemote());
      if (cancelled) return;

      const local = unlockedRef.current;
      const merged = new Set<AchievementId>([...local, ...remote]);
      unlockedRef.current = merged;
      setUnlocked(merged);
      localSave(merged);

      // Push anything this device earned that the account didn't have yet.
      const localOnly = [...local].filter((x) => !remote.has(x));
      if (localOnly.length) void pushRemote(userId, localOnly);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const unlock = useCallback(
    (id: AchievementId): void => {
      if (unlockedRef.current.has(id)) return;

      const next = new Set(unlockedRef.current);
      next.add(id);
      unlockedRef.current = next;
      setUnlocked(next);
      localSave(next);

      setJustUnlocked(id);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setJustUnlocked(null), 3600);

      if (userId) void pushRemote(userId, [id]);
    },
    [userId]
  );

  const dismissToast = useCallback((): void => setJustUnlocked(null), []);

  const reset = useCallback((): void => {
    const empty = new Set<AchievementId>();
    unlockedRef.current = empty;
    setUnlocked(empty);
    localSave(empty);
    if (userId) void clearRemote(userId);
  }, [userId]);

  return { definitions, unlocked, justUnlocked, unlock, dismissToast, reset };
}
