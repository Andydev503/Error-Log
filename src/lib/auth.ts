import { cache } from "react";
import { createClient } from "./supabase/server";

/**
 * The current authenticated user, validated against Supabase Auth.
 *
 * Wrapped in React `cache()` so that the layout, the page, and helpers like
 * `canUseAi()` all share a single auth round-trip per request instead of each
 * making their own network call.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
