import { createClient } from "./supabase/server";
import type { Problem } from "./types";

/** All of the current user's problems, newest first. */
export async function getProblems(): Promise<Problem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Problem[] | null) ?? [];
}

export async function getProblem(id: string): Promise<Problem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Problem | null) ?? null;
}
