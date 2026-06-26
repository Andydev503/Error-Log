"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Shuffle, X, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SUBJECTS,
  type SubjectId,
} from "@/lib/constants";
import { subjectTheme } from "@/lib/theme";
import type { Problem } from "@/lib/types";
import { publicImageUrl } from "@/lib/images";
import { logReview } from "@/lib/reviews";
import { cn } from "@/lib/utils";
import { SubjectBadge, CasBadge } from "./Badges";
import { ProblemImage } from "./ProblemImage";
import { AnswerReveal } from "./AnswerReveal";
import { AiSolution } from "./AiSolution";

type SubjectFilter = SubjectId | "all";
type Scope = "all" | "unmastered" | "todo";

const SCOPES: { id: Scope; label: string }[] = [
  { id: "unmastered", label: "Needs work" },
  { id: "todo", label: "To review" },
  { id: "all", label: "Everything" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RapidReview({
  problems,
  canGenerate,
}: {
  problems: Problem[];
  canGenerate: boolean;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState<SubjectFilter>("all");
  const [topic, setTopic] = useState<string>("");
  const [scope, setScope] = useState<Scope>("unmastered");
  const [shuffle, setShuffle] = useState(true);

  // Session state (null = on the setup screen).
  const [queue, setQueue] = useState<Problem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState(0);
  const [busy, setBusy] = useState(false);

  const topics = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (subject !== "all" && p.subject !== subject) return;
      if (p.topic) set.add(p.topic);
    });
    return [...set].sort();
  }, [problems, subject]);

  const matching = useMemo(() => {
    return problems.filter((p) => {
      if (subject !== "all" && p.subject !== subject) return false;
      if (topic && p.topic !== topic) return false;
      if (scope === "unmastered" && p.status === "mastered") return false;
      if (scope === "todo" && p.status !== "todo") return false;
      return true;
    });
  }, [problems, subject, topic, scope]);

  function start() {
    if (matching.length === 0) return;
    setQueue(shuffle ? shuffleArray(matching) : matching);
    setIndex(0);
    setCorrect(0);
    setMissed(0);
  }

  async function answer(gotCorrect: boolean) {
    if (!queue || busy) return;
    setBusy(true);
    const current = queue[index];
    const supabase = createClient();
    await logReview(supabase, current, gotCorrect);
    if (gotCorrect) setCorrect((c) => c + 1);
    else setMissed((m) => m + 1);
    setIndex((i) => i + 1);
    setBusy(false);
  }

  function exit() {
    setQueue(null);
    router.refresh();
  }

  // ---- Setup screen ----------------------------------------------------
  if (!queue) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-5">
            <span className="mb-1.5 block text-sm font-medium">Subject</span>
            <div className="grid grid-cols-4 gap-2">
              <Chip active={subject === "all"} onClick={() => { setSubject("all"); setTopic(""); }}>
                All
              </Chip>
              {SUBJECTS.map((s) => (
                <Chip
                  key={s.id}
                  active={subject === s.id}
                  onClick={() => { setSubject(s.id); setTopic(""); }}
                  dotClass={subjectTheme[s.id].dot}
                >
                  {s.short}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Any topic</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <span className="mb-1.5 block text-sm font-medium">Include</span>
            <div className="grid grid-cols-3 gap-2">
              {SCOPES.map((s) => (
                <Chip key={s.id} active={scope === s.id} onClick={() => setScope(s.id)}>
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShuffle((v) => !v)}
            className="mb-5 flex items-center gap-2 text-sm text-muted hover:text-foreground"
          >
            <span
              className={cn(
                "grid size-5 place-items-center rounded border",
                shuffle ? "border-ring bg-ring text-white" : "border-border",
              )}
            >
              {shuffle && <Check size={13} />}
            </span>
            <Shuffle size={14} /> Shuffle order
          </button>

          <button
            onClick={start}
            disabled={matching.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
          >
            <Zap size={16} />
            {matching.length === 0
              ? "No matching problems"
              : `Start — ${matching.length} problem${matching.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    );
  }

  // ---- Summary screen --------------------------------------------------
  if (index >= queue.length) {
    const total = correct + missed;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
            <Check size={26} />
          </div>
          <h2 className="text-xl font-semibold">Session complete</h2>
          <p className="mt-1 text-sm text-muted">
            You got <span className="font-semibold text-foreground">{correct}</span> of{" "}
            {total} right ({pct}%).
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={start}
              className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background"
            >
              <RotateCcw size={15} /> Run it again
            </button>
            <button
              onClick={exit}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-surface-2"
            >
              New session
            </button>
            <Link
              href="/review"
              className="rounded-lg px-4 py-2.5 text-sm text-muted hover:text-foreground"
            >
              Back to review
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- Active question -------------------------------------------------
  const current = queue[index];
  const problemUrl = publicImageUrl(current.problem_image_path);
  const answerUrl = publicImageUrl(current.answer_image_path);
  const progress = ((index + 1) / queue.length) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-muted">
          {index + 1} / {queue.length}
        </span>
        <button
          onClick={exit}
          className="shrink-0 text-xs text-muted hover:text-foreground"
        >
          End
        </button>
      </div>

      {/* The card remounts per problem (key) so reveals reset automatically. */}
      <div key={current.id} className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <SubjectBadge subject={current.subject} />
          {current.subject !== "physics" && (
            <CasBadge active={current.cas_active} />
          )}
          {current.topic && (
            <span className="text-sm font-medium">{current.topic}</span>
          )}
          {current.source && (
            <span className="text-xs text-muted">· {current.source}</span>
          )}
        </div>

        {problemUrl ? (
          <ProblemImage url={problemUrl} maxHeightClass="max-h-[26rem]" />
        ) : (
          <div className="grid h-40 place-items-center rounded-xl border border-border text-sm text-muted">
            No screenshot
          </div>
        )}

        <AnswerReveal imageUrl={answerUrl} text={current.answer_text} />

        {(current.ai_solution || canGenerate) && (
          <AiSolution
            problemId={current.id}
            initial={current.ai_solution}
            canGenerate={canGenerate}
          />
        )}

        <div className="sticky bottom-3 flex gap-3">
          <button
            onClick={() => answer(false)}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-surface-2 disabled:opacity-60"
          >
            <X size={16} /> Missed it
          </button>
          <button
            onClick={() => answer(true)}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
          >
            <Check size={16} /> Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  dotClass,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dotClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-sm font-medium transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted hover:bg-surface-2 hover:text-foreground",
      )}
    >
      {dotClass && <span className={cn("size-1.5 rounded-full", dotClass)} />}
      {children}
    </button>
  );
}
