import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The publishable key is meant to ship in the browser bundle — it's safe to
// expose *as long as Row Level Security is enabled on every table* (it is; see
// db/schema/). If these env vars are absent, `supabase` is null and
// the app falls back to localStorage-only, so it still runs with no config.

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const isRemoteEnabled = supabase !== null;
