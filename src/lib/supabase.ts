import { createClient } from "@supabase/supabase-js";
import { sessionStorageAdapter } from "./sessionStorageAdapter";

// Read from environment (client-safe keys must start with NEXT_PUBLIC_)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Use sessionStorage instead of localStorage to ensure each tab has independent sessions
    // This allows users to log in with different accounts in different tabs
    storage: sessionStorageAdapter,
  },
});
