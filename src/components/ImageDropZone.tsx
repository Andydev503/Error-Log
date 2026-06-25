"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_BUCKET } from "@/lib/constants";
import { resizeImage, imageFromClipboard, publicImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  /** Current stored path (controlled). */
  value: string | null;
  onChange: (path: string | null) => void;
  label: string;
  /** When true, paste anywhere on the page drops the image here. */
  captureGlobalPaste?: boolean;
}

export function ImageDropZone({
  userId,
  value,
  onChange,
  label,
  captureGlobalPaste = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | Blob) => {
      setError(null);
      setUploading(true);
      try {
        const { blob } = await resizeImage(file);
        const path = `${userId}/${crypto.randomUUID()}.webp`;
        const supabase = createClient();
        const { error: upErr } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(path, blob, { contentType: "image/webp", upsert: false });
        if (upErr) throw upErr;
        onChange(path);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [userId, onChange],
  );

  // Global paste capture for the primary (problem) zone.
  useEffect(() => {
    if (!captureGlobalPaste) return;
    function onPaste(e: ClipboardEvent) {
      const img = imageFromClipboard(e.clipboardData?.items ?? null);
      if (img) {
        e.preventDefault();
        handleFile(img);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [captureGlobalPaste, handleFile]);

  const url = publicImageUrl(value);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1 text-xs text-muted hover:text-red-500"
          >
            <X size={13} /> Remove
          </button>
        )}
      </div>

      {url ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="mx-auto max-h-64 w-full object-contain"
          />
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file?.type.startsWith("image/")) handleFile(file);
          }}
          onPaste={(e) => {
            const img = imageFromClipboard(e.clipboardData.items);
            if (img) {
              e.preventDefault();
              handleFile(img);
            }
          }}
          tabIndex={0}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center text-sm transition outline-none",
            dragOver
              ? "border-ring bg-surface-2"
              : "border-border text-muted hover:border-ring/60 hover:bg-surface-2",
          )}
        >
          {uploading ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            <ImagePlus size={22} />
          )}
          <span>
            {uploading ? (
              "Uploading…"
            ) : (
              <>
                <span className="font-medium text-foreground">
                  Paste, drop, or click
                </span>
                <br />
                to add a screenshot
              </>
            )}
          </span>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
