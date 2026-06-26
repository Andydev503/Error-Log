"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ExternalLink,
  Loader2,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_BUCKET, STATUSES, type ProblemStatus } from "@/lib/constants";
import { subjectTheme, statusBadge } from "@/lib/theme";
import type { Problem } from "@/lib/types";
import { publicImageUrl } from "@/lib/images";
import { logReview } from "@/lib/reviews";
import { cn, formatDate } from "@/lib/utils";
import { SubjectBadge, CasBadge } from "./Badges";
import { ProblemImage } from "./ProblemImage";
import { AnswerReveal } from "./AnswerReveal";
import { AiSolution } from "./AiSolution";

export function ProblemDetail({
  problem,
  canGenerate,
}: {
  problem: Problem;
  canGenerate: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ProblemStatus>(problem.status);
  const [reviews, setReviews] = useState(problem.times_reviewed);
  const [lastReviewed, setLastReviewed] = useState(problem.last_reviewed_at);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const theme = subjectTheme[problem.subject];
  const problemUrl = publicImageUrl(problem.problem_image_path);
  const answerUrl = publicImageUrl(problem.answer_image_path);

  async function changeStatus(next: ProblemStatus) {
    setStatus(next);
    const supabase = createClient();
    await supabase.from("problems").update({ status: next }).eq("id", problem.id);
    router.refresh();
  }

  async function handleReview(gotCorrect: boolean) {
    setBusy(true);
    const supabase = createClient();
    const result = await logReview(
      supabase,
      { ...problem, status, times_reviewed: reviews },
      gotCorrect,
    );
    setReviews(result.timesReviewed);
    setLastReviewed(result.reviewedAt);
    setStatus(result.status);
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    setDeleting(true);
    const supabase = createClient();
    const paths = [problem.problem_image_path, problem.answer_image_path].filter(
      Boolean,
    ) as string[];
    if (paths.length) await supabase.storage.from(IMAGE_BUCKET).remove(paths);
    await supabase.from("problems").delete().eq("id", problem.id);
    router.push("/review");
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      {/* Left: problem + answer + AI */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SubjectBadge subject={problem.subject} />
            {problem.subject !== "physics" && (
              <CasBadge active={problem.cas_active} />
            )}
            {problem.topic && (
              <span className="text-sm font-medium">{problem.topic}</span>
            )}
          </div>
          {problemUrl ? (
            <ProblemImage url={problemUrl} maxHeightClass="max-h-[28rem]" />
          ) : (
            <div className="grid h-48 place-items-center rounded-xl border border-border text-sm text-muted">
              No screenshot
            </div>
          )}
        </div>

        <AnswerReveal imageUrl={answerUrl} text={problem.answer_text} />

        {problem.notes && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Your notes</h3>
            <p className="rounded-xl border border-border bg-surface p-3 text-sm leading-relaxed">
              {problem.notes}
            </p>
          </div>
        )}

        <AiSolution
          problemId={problem.id}
          initial={problem.ai_solution}
          canGenerate={canGenerate}
        />
      </div>

      {/* Right: review controls + meta */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold">Did you get it this time?</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleReview(true)}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Got it
            </button>
            <button
              onClick={() => handleReview(false)}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition hover:bg-surface-2 disabled:opacity-60"
            >
              <X size={15} /> Missed
            </button>
          </div>
          <p className="mt-3 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <RotateCcw size={12} /> Reviewed {reviews}×
            </span>
            <span>Last: {formatDate(lastReviewed)}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold">Status</h3>
          <div className="flex flex-col gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => changeStatus(s.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-left text-sm font-medium transition",
                  status === s.id
                    ? statusBadge[s.id]
                    : "text-muted hover:bg-surface-2",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
          <h3 className="mb-3 font-semibold">Details</h3>
          <dl className="flex flex-col gap-2 text-muted">
            <Row label="Paper">{problem.source || "—"}</Row>
            <Row label="Added">{formatDate(problem.created_at)}</Row>
            {problem.source_url && (
              <a
                href={problem.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "mt-1 inline-flex items-center gap-1.5 font-medium",
                  theme.text,
                )}
              >
                <ExternalLink size={14} /> Open source link
              </a>
            )}
          </dl>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/review/${problem.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:text-foreground"
          >
            <Pencil size={14} /> Edit
          </Link>
          {deleting ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">Delete?</span>
              <button
                onClick={remove}
                className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white"
              >
                Yes
              </button>
              <button
                onClick={() => setDeleting(false)}
                className="rounded-lg px-2 py-1.5 text-muted"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleting(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:text-red-500"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="text-right font-medium text-foreground">{children}</dd>
    </div>
  );
}
