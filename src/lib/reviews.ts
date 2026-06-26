import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProblemStatus } from "./constants";
import type { Problem } from "./types";

/** A correct answer nudges a problem forward: todo → learning → mastered. */
export function nextStatusAfterReview(
  status: ProblemStatus,
  gotCorrect: boolean,
): ProblemStatus {
  if (!gotCorrect || status === "mastered") return status;
  return status === "todo" ? "learning" : "mastered";
}

/** Record one review attempt: bump count, timestamp, status, and log the event. */
export async function logReview(
  supabase: SupabaseClient,
  problem: Pick<Problem, "id" | "user_id" | "status" | "times_reviewed">,
  gotCorrect: boolean,
): Promise<{ status: ProblemStatus; reviewedAt: string; timesReviewed: number }> {
  const reviewedAt = new Date().toISOString();
  const status = nextStatusAfterReview(problem.status, gotCorrect);
  const timesReviewed = problem.times_reviewed + 1;

  await supabase
    .from("problems")
    .update({
      times_reviewed: timesReviewed,
      last_reviewed_at: reviewedAt,
      status,
    })
    .eq("id", problem.id);
  await supabase.from("reviews").insert({
    problem_id: problem.id,
    user_id: problem.user_id,
    got_correct: gotCorrect,
  });

  return { status, reviewedAt, timesReviewed };
}
