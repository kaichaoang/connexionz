import { useState, useEffect, useCallback } from "react";
import { isRemoteEnabled } from "../lib/supabase";
import {
  getCurrentUser,
  signUpWithPassword,
  signInWithPassword,
  sendMagicLink,
  signOut,
  onAuthChange,
  type User,
} from "../lib/auth";

// Identity model: you're either signed in (a real email/password account) or a
// "guest" (no session). Guests still play — their progress just saves in this
// browser only (see usePuzzles / useAchievements, which skip the database when
// there's no userId). No anonymous accounts are created.

export interface AuthApi {
  userId: string | null;
  email: string | null;
  isGuest: boolean; // true when not signed in
  ready: boolean; // false until the initial session is resolved
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirm: boolean }>;
  logIn: (email: string, password: string) => Promise<{ error: string | null }>;
  sendLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthApi {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isRemoteEnabled);

  useEffect(() => {
    if (!isRemoteEnabled) return;
    let cancelled = false;

    // React to future sign-in / sign-out (including magic-link completion).
    const unsub = onAuthChange((u) => {
      if (!cancelled) setUser(u);
    });

    // Resolve the initial identity: an existing session, or guest (null).
    (async () => {
      const u = await getCurrentUser();
      if (cancelled) return;
      setUser(u);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const signUp = useCallback(
    (email: string, password: string) =>
      signUpWithPassword(email.trim(), password),
    []
  );

  const logIn = useCallback(
    (email: string, password: string) =>
      signInWithPassword(email.trim(), password),
    []
  );

  const sendLink = useCallback((email: string) => sendMagicLink(email.trim()), []);

  const doSignOut = useCallback(async () => {
    await signOut();
    setUser(null); // back to guest
  }, []);

  return {
    userId: user?.id ?? null,
    email: user?.email ?? null,
    isGuest: !user,
    ready,
    signUp,
    logIn,
    sendLink,
    signOut: doSignOut,
  };
}
