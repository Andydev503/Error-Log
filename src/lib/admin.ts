import { createClient } from "./supabase/server";
import { getCurrentUser } from "./auth";
import { isAdminEmail } from "./adminConfig";

/**
 * Whether the *current* signed-in user is allowed to generate AI solutions:
 * admins always can; everyone else needs `profiles.ai_enabled = true`.
 */
export async function canUseAi(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  if (isAdminEmail(user.email)) return true;
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("ai_enabled")
    .eq("id", user.id)
    .maybeSingle();
  return Boolean(data?.ai_enabled);
}
