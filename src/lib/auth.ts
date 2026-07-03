import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export type { User };

// Where email links (magic link + signup confirmation) return to. Respects the
// Vite base path so links land back on the app under the Pages sub-path too.
function redirectTo(): string {
  return window.location.origin + import.meta.env.BASE_URL;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

// Create an account with email + password. If the project requires email
// confirmation there's no session yet — `needsConfirm` tells the UI to say so.
export async function signUpWithPassword(
  email: string,
  password: string
): Promise<{ error: string | null; needsConfirm: boolean }> {
  if (!supabase) return { error: "Login isn't configured.", needsConfirm: false };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo() },
  });
  if (error) return { error: error.message, needsConfirm: false };
  return { error: null, needsConfirm: !data.session };
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Login isn't configured." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

// Passwordless option: sends a one-time login link to the given email.
export async function sendMagicLink(
  email: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Login isn't configured." };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo() },
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// Subscribe to sign-in / sign-out. Returns an unsubscribe function.
export function onAuthChange(cb: (user: User | null) => void): () => void {
  if (!supabase) return () => {};
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}
