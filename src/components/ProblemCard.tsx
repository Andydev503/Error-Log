import Link from "next/link";
import { Eye, RotateCcw } from "lucide-react";
import type { Problem } from "@/lib/types";
import { publicImageUrl } from "@/lib/images";
import { formatDate } from "@/lib/utils";
import { SubjectBadge, StatusBadge, CasBadge } from "./Badges";

export function ProblemCard({ problem }: { problem: Problem }) {
  const url = publicImageUrl(problem.problem_image_path);
  return (
    <Link
      href={`/review/${problem.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-md hover:shadow-black/5"
    >
      <div className="aspect-[4/3] overflow-hidden bg-surface-2">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Problem"
            loading="lazy"
            className="size-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid size-full place-items-center text-xs text-muted">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <SubjectBadge subject={problem.subject} />
          <StatusBadge status={problem.status} />
          {problem.subject !== "physics" && (
            <CasBadge active={problem.cas_active} />
          )}
        </div>
        {problem.topic && (
          <p className="text-sm font-medium leading-snug">{problem.topic}</p>
        )}
        <div className="mt-auto flex items-center justify-between text-xs text-muted">
          <span className="truncate">{problem.source || formatDate(problem.created_at)}</span>
          <span className="flex shrink-0 items-center gap-2.5">
            <span className="flex items-center gap-1" title="Times reviewed">
              <RotateCcw size={12} /> {problem.times_reviewed}
            </span>
            <span className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <Eye size={12} /> Open
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
