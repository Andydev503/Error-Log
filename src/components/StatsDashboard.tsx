"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SUBJECTS, SUBJECT_MAP, type SubjectId } from "@/lib/constants";
import type { Problem } from "@/lib/types";

const SUBJECT_COLOR: Record<SubjectId, string> = {
  methods: "#3b82f6",
  specialist: "#8b5cf6",
  physics: "#10b981",
};

const STATUS_COLOR: Record<string, string> = {
  todo: "#f59e0b",
  learning: "#0ea5e9",
  mastered: "#10b981",
};

export function StatsDashboard({
  problems,
  accuracy,
}: {
  problems: Problem[];
  accuracy: { correct: number; total: number };
}) {
  const bySubject = useMemo(
    () =>
      SUBJECTS.map((s) => ({
        name: s.short,
        id: s.id,
        value: problems.filter((p) => p.subject === s.id).length,
      })).filter((d) => d.value > 0),
    [problems],
  );

  const byStatus = useMemo(() => {
    const counts = { todo: 0, learning: 0, mastered: 0 } as Record<
      string,
      number
    >;
    problems.forEach((p) => (counts[p.status] = (counts[p.status] ?? 0) + 1));
    return [
      { name: "To review", id: "todo", value: counts.todo },
      { name: "Learning", id: "learning", value: counts.learning },
      { name: "Mastered", id: "mastered", value: counts.mastered },
    ].filter((d) => d.value > 0);
  }, [problems]);

  const topTopics = useMemo(() => {
    const counts = new Map<string, number>();
    problems.forEach((p) => {
      const key = p.topic?.trim();
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [problems]);

  const accuracyPct =
    accuracy.total > 0
      ? Math.round((accuracy.correct / accuracy.total) * 100)
      : null;

  if (problems.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border py-20 text-sm text-muted">
        Add some problems to see your stats.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total logged" value={problems.length} />
        <StatCard
          label="To review"
          value={problems.filter((p) => p.status === "todo").length}
        />
        <StatCard
          label="Mastered"
          value={problems.filter((p) => p.status === "mastered").length}
        />
        <StatCard
          label="Review accuracy"
          value={accuracyPct === null ? "—" : `${accuracyPct}%`}
          hint={accuracy.total > 0 ? `${accuracy.total} reviews` : "no reviews yet"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Errors by subject">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={bySubject}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {bySubject.map((d) => (
                  <Cell
                    key={d.id}
                    fill={SUBJECT_COLOR[d.id as SubjectId]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <Legend
            items={bySubject.map((d) => ({
              label: SUBJECT_MAP[d.id as SubjectId].short,
              color: SUBJECT_COLOR[d.id as SubjectId],
              value: d.value,
            }))}
          />
        </ChartCard>

        <ChartCard title="Progress">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={byStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {byStatus.map((d) => (
                  <Cell key={d.id} fill={STATUS_COLOR[d.id]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <Legend
            items={byStatus.map((d) => ({
              label: d.name,
              color: STATUS_COLOR[d.id],
              value: d.value,
            }))}
          />
        </ChartCard>
      </div>

      {topTopics.length > 0 && (
        <ChartCard title="Topics you get wrong most">
          <ResponsiveContainer width="100%" height={Math.max(180, topTopics.length * 36)}>
            <BarChart
              data={topTopics}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 12, fill: "currentColor" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#6366f1" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--foreground)",
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Legend({
  items,
}: {
  items: { label: string; color: string; value: number }[];
}) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-muted">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: i.color }}
          />
          {i.label} ({i.value})
        </span>
      ))}
    </div>
  );
}
