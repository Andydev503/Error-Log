import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** True when the Supabase secret key is configured (required for admin ops). */
export const adminConfigured = Boolean(process.env.SUPABASE_SECRET_KEY);

/**
 * Privileged Supabase client using the SECRET key. Bypasses Row Level Security,
 * so it must ONLY ever be created in server code, behind an admin check.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
