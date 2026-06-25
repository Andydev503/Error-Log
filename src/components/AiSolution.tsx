"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Markdown } from "./Markdown";

export function AiSolution({
  problemId,
  initial,
}: {
  problemId: string;
  initial: string | null;
}) {
  const [solution, setSolution] = useState<string | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(regenerate = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, regenerate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSolution(data.solution);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-violet-500" />
          AI worked solution
        </h3>
        {solution && (
          <button
            onClick={() => generate(true)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Regenerate
          </button>
        )}
      </div>

      {solution ? (
        <div className="rounded-xl border border-border bg-surface p-4">
          <Markdown>{solution}</Markdown>
        </div>
      ) : (
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
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
