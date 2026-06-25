"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ProblemImage } from "./ProblemImage";

export function AnswerReveal({
  imageUrl,
  text,
}: {
  imageUrl: string | null;
  text: string | null;
}) {
  const [shown, setShown] = useState(false);

  if (!imageUrl && !text) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Answer</h3>
        <button
          onClick={() => setShown((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
        >
          {shown ? <EyeOff size={14} /> : <Eye size={14} />}
          {shown ? "Hide answer" : "Reveal answer"}
        </button>
      </div>

      {shown ? (
        <div className="flex flex-col gap-3">
          {text && (
            <p className="rounded-xl border border-border bg-surface p-3 text-sm">
              {text}
            </p>
          )}
          {imageUrl && <ProblemImage url={imageUrl} alt="Answer" />}
        </div>
      ) : (
        <button
          onClick={() => setShown(true)}
          className="grid h-24 w-full place-items-center rounded-xl border border-dashed border-border bg-surface-2 text-sm text-muted transition hover:text-foreground"
        >
          Tap to reveal
        </button>
      )}
    </div>
  );
}
