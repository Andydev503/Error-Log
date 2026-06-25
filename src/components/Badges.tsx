import { SUBJECT_MAP, STATUS_MAP, type SubjectId } from "@/lib/constants";
import { subjectTheme, statusBadge } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function SubjectBadge({ subject }: { subject: SubjectId }) {
  const meta = SUBJECT_MAP[subject];
  const t = subjectTheme[subject];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        t.bgSoft,
        t.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", t.dot)} />
      {meta.short}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusBadge[status] ?? "bg-surface-2 text-muted",
      )}
    >
      {STATUS_MAP[status as keyof typeof STATUS_MAP] ?? status}
    </span>
  );
}

export function CasBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        active
          ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
          : "bg-surface-2 text-muted",
      )}
    >
      {active ? "CAS" : "Tech-free"}
    </span>
  );
}
