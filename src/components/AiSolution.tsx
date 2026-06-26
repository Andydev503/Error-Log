"use client";

import { useState } from "react";
import { Eye, Loader2, RefreshCw, Sparkles } from "lucide-react";
import {
  GEMINI_MODELS,
  DEFAULT_GEMINI_MODEL,
  type GeminiModelId,
} from "@/lib/constants";
import { Markdown } from "./Markdown";

export function AiSolution({
  problemId,
  initial,
  canGenerate,
}: {
  problemId: string;
  initial: string | null;
  canGenerate: boolean;
}) {
  const [solution, setSolution] = useState<string | null>(initial);
  // Cached solutions start hidden so you don't see the answer by accident.
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<GeminiModelId>(DEFAULT_GEMINI_MODEL);
  const [error, setError] = useState<string | null>(null);

  async function generate(regenerate = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, regenerate, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSolution(data.solution);
      setRevealed(true); // just generated → show it now
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate.");
    } finally {
      setLoading(false);
    }
  }

  const modelSelect = (
    <select
      value={model}
      onChange={(e) => setModel(e.target.value as GeminiModelId)}
      disabled={loading}
      title="Choose the Gemini model"
      className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted outline-none focus:ring-2 focus:ring-ring"
    >
      {GEMINI_MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label} — {m.hint}
        </option>
      ))}
    </select>
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-violet-500" />
          AI worked solution
        </h3>
        {solution && revealed && canGenerate && (
          <div className="flex items-center gap-2">
            {modelSelect}
            <button
              onClick={() => generate(true)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Regenerate
            </button>
          </div>
        )}
      </div>

      {solution ? (
        revealed ? (
          <div className="rounded-xl border border-border bg-surface p-4">
            <Markdown>{solution}</Markdown>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-2 px-4 py-6 text-sm font-medium text-muted transition hover:text-foreground"
          >
            <Eye size={16} /> Reveal AI solution
          </button>
        )
      ) : canGenerate ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>Model</span>
            {modelSelect}
          </div>
          <button
            onClick={() => generate(false)}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50 px-4 py-6 text-sm font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-60 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate a step-by-step solution
              </>
            )}
          </button>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-surface-2 px-4 py-6 text-center text-sm text-muted">
          AI solutions aren&apos;t enabled for your account.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
