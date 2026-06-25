"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SUBJECTS,
  SUBJECT_MAP,
  STATUSES,
  type SubjectId,
  type ProblemStatus,
} from "@/lib/constants";
import { subjectTheme } from "@/lib/theme";
import type { Problem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ImageDropZone } from "./ImageDropZone";

interface Props {
  userId: string;
  /** When provided, the form edits this problem instead of creating a new one. */
  existing?: Problem;
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const labelClass = "mb-1.5 block text-sm font-medium";

export function ProblemForm({ userId, existing }: Props) {
  const router = useRouter();
  const editing = Boolean(existing);

  const [subject, setSubject] = useState<SubjectId>(
    existing?.subject ?? "methods",
  );
  const [topic, setTopic] = useState(existing?.topic ?? "");
  const [source, setSource] = useState(existing?.source ?? "");
  const [sourceUrl, setSourceUrl] = useState(existing?.source_url ?? "");
  const [casActive, setCasActive] = useState(existing?.cas_active ?? false);
  const [status, setStatus] = useState<ProblemStatus>(
    existing?.status ?? "todo",
  );
  const [problemImage, setProblemImage] = useState<string | null>(
    existing?.problem_image_path ?? null,
  );
  const [answerImage, setAnswerImage] = useState<string | null>(
    existing?.answer_image_path ?? null,
  );
  const [answerText, setAnswerText] = useState(existing?.answer_text ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = SUBJECT_MAP[subject];
  const theme = subjectTheme[subject];
  const topics = useMemo(() => meta.topics, [meta]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!problemImage) {
      setError("Add a screenshot of the problem first.");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      subject,
      topic: topic || null,
      source: source || null,
      source_url: sourceUrl || null,
      cas_active: meta.usesCas ? casActive : false,
      status,
      problem_image_path: problemImage,
      answer_image_path: answerImage,
      answer_text: answerText || null,
      notes: notes || null,
    };

    if (editing && existing) {
      const { error } = await supabase
        .from("problems")
        .update(payload)
        .eq("id", existing.id);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      router.push(`/review/${existing.id}`);
    } else {
      const { data, error } = await supabase
        .from("problems")
        .insert({ ...payload, user_id: userId })
        .select("id")
        .single();
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      router.push(`/review/${data.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Subject picker */}
      <div>
        <span className={labelClass}>Subject</span>
        <div className="grid grid-cols-3 gap-2">
          {SUBJECTS.map((s) => {
            const active = s.id === subject;
            const t = subjectTheme[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubject(s.id)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? cn(t.bgSoft, t.text, t.border)
                    : "border-border text-muted hover:bg-surface-2",
                )}
              >
                {s.short}
              </button>
            );
          })}
        </div>
      </div>

      <ImageDropZone
        userId={userId}
        value={problemImage}
        onChange={setProblemImage}
        label="Problem screenshot"
        captureGlobalPaste
      />

      {/* Metadata grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Topic</label>
          <input
            list="topic-options"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Transformation"
            className={inputClass}
          />
          <datalist id="topic-options">
            {topics.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClass}>Paper / source</label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. 2023 exam 1"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Source link (optional)</label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProblemStatus)}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {meta.usesCas && (
          <div>
            <span className={labelClass}>Calculator</span>
            <div className="flex gap-2">
              {[
                { v: false, label: "Tech-free" },
                { v: true, label: "CAS active" },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => setCasActive(o.v)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm transition",
                    casActive === o.v
                      ? cn(theme.bgSoft, theme.text, theme.border)
                      : "border-border text-muted hover:bg-surface-2",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Answer + notes */}
      <ImageDropZone
        userId={userId}
        value={answerImage}
        onChange={setAnswerImage}
        label="Answer / solution screenshot (optional, hidden until revealed)"
      />

      <div>
        <label className={labelClass}>Answer notes (optional)</label>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          rows={2}
          placeholder="Final answer or key step…"
          className={cn(inputClass, "resize-y")}
        />
      </div>

      <div>
        <label className={labelClass}>Your notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="What went wrong / what to remember…"
          className={cn(inputClass, "resize-y")}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60",
            theme.bg,
          )}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {editing ? "Save changes" : "Add problem"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2.5 text-sm text-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
