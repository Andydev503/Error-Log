"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import type { Problem } from "@/lib/types";
import {
  SUBJECTS,
  STATUSES,
  isSubjectId,
  type SubjectId,
  type ProblemStatus,
} from "@/lib/constants";
import { subjectTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ProblemCard } from "./ProblemCard";

type SubjectFilter = SubjectId | "all";
type StatusFilter = ProblemStatus | "all";

export function ReviewBrowser({
  problems,
  initialSubject = "all",
}: {
  problems: Problem[];
  initialSubject?: string;
}) {
  const [subject, setSubject] = useState<SubjectFilter>(
    isSubjectId(initialSubject) ? initialSubject : "all",
  );
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (subject !== "all" && p.subject !== subject) return false;
      if (status !== "all" && p.status !== status) return false;
      if (q) {
        const hay = `${p.topic ?? ""} ${p.source ?? ""} ${p.notes ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [problems, subject, status, query]);

  return (
    <div>
      {/* Subject tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip active={subject === "all"} onClick={() => setSubject("all")}>
          All subjects
        </FilterChip>
        {SUBJECTS.map((s) => (
          <FilterChip
            key={s.id}
            active={subject === s.id}
            onClick={() => setSubject(s.id)}
            dotClass={subjectTheme[s.id].dot}
          >
            {s.short}
          </FilterChip>
        ))}
      </div>

      {/* Search + status */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topic, paper, notes…"
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <FilterChip active={status === "all"} onClick={() => setStatus("all")}>
            All
          </FilterChip>
          {STATUSES.map((s) => (
            <FilterChip
              key={s.id}
              active={status === s.id}
              onClick={() => setStatus(s.id)}
            >
              {s.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="mb-3 text-sm text-muted">
            {problems.length === 0
              ? "No problems logged yet."
              : "Nothing matches these filters."}
          </p>
          {problems.length === 0 && (
            <Link
              href="/add"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              <PlusCircle size={16} /> Add your first problem
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted">
            {filtered.length} problem{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({
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
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition",
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
