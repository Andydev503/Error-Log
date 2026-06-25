import type { SubjectId } from "./constants";

/**
 * Static Tailwind class strings per subject accent. Kept as full literals so
 * Tailwind's JIT can see them (no dynamic `bg-${color}` construction).
 */
export const subjectTheme: Record<
  SubjectId,
  {
    text: string;
    bg: string;
    bgSoft: string;
    border: string;
    ring: string;
    dot: string;
    gradient: string;
  }
> = {
  methods: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-600",
    bgSoft: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/30",
    ring: "ring-blue-500",
    dot: "bg-blue-500",
    gradient: "from-blue-500 to-sky-400",
  },
  specialist: {
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-600",
    bgSoft: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-200 dark:border-violet-500/30",
    ring: "ring-violet-500",
    dot: "bg-violet-500",
    gradient: "from-violet-500 to-purple-400",
  },
  physics: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-600",
    bgSoft: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    ring: "ring-emerald-500",
    dot: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-400",
  },
};

export const statusBadge: Record<string, string> = {
  todo: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  learning: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  mastered:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};
