import type { ProblemStatus, SubjectId } from "./constants";

/** A logged problem (one row in the `problems` table). */
export interface Problem {
  id: string;
  user_id: string;
  subject: SubjectId;
  topic: string | null;
  source: string | null;
  source_url: string | null;
  cas_active: boolean;
  times_reviewed: number;
  status: ProblemStatus;
  problem_image_path: string | null;
  answer_image_path: string | null;
  answer_text: string | null;
  ai_solution: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_reviewed_at: string | null;
}

/** Fields the user can set when creating/editing a problem. */
export type ProblemInput = Pick<
  Problem,
  | "subject"
  | "topic"
  | "source"
  | "source_url"
  | "cas_active"
  | "status"
  | "problem_image_path"
  | "answer_image_path"
  | "answer_text"
  | "notes"
>;

/** One review event (one row in the `reviews` table). */
export interface ReviewEvent {
  id: string;
  user_id: string;
  problem_id: string;
  reviewed_at: string;
  got_correct: boolean | null;
}
