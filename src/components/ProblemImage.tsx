"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  url: string;
  alt?: string;
  /** Max display height in the inline view. The lightbox always shows full size. */
  maxHeightClass?: string;
  className?: string;
}

/**
 * Displays a screenshot scaled to a sensible size (object-contain, capped
 * height) and opens a full-screen lightbox on click so handwriting is legible.
 */
export function ProblemImage({
  url,
  alt = "Problem screenshot",
  maxHeightClass = "max-h-80",
  className,
}: Props) {
  const [zoom, setZoom] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setZoom(true)}
        className={cn(
          "group relative block w-full overflow-hidden rounded-xl border border-border bg-surface-2",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className={cn(
            "mx-auto w-full object-contain",
            maxHeightClass,
          )}
        />
        <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-md bg-black/55 text-white opacity-0 transition group-hover:opacity-100">
          <ZoomIn size={15} />
        </span>
      </button>

      {zoom && (
        <div
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <button
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}
