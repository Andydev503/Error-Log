import Link from "next/link";
import { ArrowRight, PlusCircle } from "lucide-react";
import { getProblems } from "@/lib/data";
import { SUBJECTS } from "@/lib/constants";
import { subjectTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ProblemCard } from "@/components/ProblemCard";

export const metadata = { title: "Dashboard · Error Log" };

export default async function DashboardPage() {
  const problems = await getProblems();
  const toReview = problems.filter((p) => p.status !== "mastered");
  const recent = problems.slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">
            {problems.length === 0
              ? "Log your first wrong answer to get started."
              : `${problems.length} problems logged · ${toReview.length} still to master.`}
          </p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background"
        >
          <PlusCircle size={16} /> Add problem
        </Link>
      </div>

      {/* Subject cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {SUBJECTS.map((s) => {
          const t = subjectTheme[s.id];
          const count = problems.filter((p) => p.subject === s.id).length;
          const open = problems.filter(
            (p) => p.subject === s.id && p.status !== "mastered",
          ).length;
          return (
            <Link
              key={s.id}
              href={`/review?subject=${s.id}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-5 transition hover:shadow-md hover:shadow-black/5",
                t.border,
                t.bgSoft,
              )}
            >
              <div
                className={cn(
                  "mb-6 inline-flex size-9 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white",
                  t.gradient,
                )}
              >
                {s.short[0]}
              </div>
              <p className="text-sm font-semibold">{s.label}</p>
              <p className={cn("mt-1 text-sm", t.text)}>
                {count} logged · {open} to master
              </p>
              <ArrowRight
                size={18}
                className="absolute right-4 top-5 text-muted transition group-hover:translate-x-0.5"
              />
            </Link>
          );
        })}
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recently added</h2>
            <Link
              href="/review"
              className="flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
