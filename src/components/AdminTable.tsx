"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface AdminRow {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  aiEnabled: boolean;
  aiIsAdmin: boolean;
  aiGenerations: number;
  problemCount: number;
}

export function AdminTable({
  rows,
  currentUserId,
}: {
  rows: AdminRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleAi(row: AdminRow) {
    if (row.aiIsAdmin) return; // admins always have AI
    setBusyId(row.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/set-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: row.id, enabled: !row.aiEnabled }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setConfirmId(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      {error && (
        <p className="border-b border-border bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-500/10">
          {error}
        </p>
      )}
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Account</th>
            <th className="px-4 py-3 font-medium">Signed up</th>
            <th className="px-4 py-3 font-medium">Last active</th>
            <th className="px-4 py-3 text-center font-medium">Problems</th>
            <th className="px-4 py-3 text-center font-medium">AI used</th>
            <th className="px-4 py-3 text-center font-medium">AI access</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 font-medium">
                  {row.email}
                  {row.aiIsAdmin && (
                    <span
                      title="Admin"
                      className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                    >
                      <Shield size={11} /> admin
                    </span>
                  )}
                  {row.id === currentUserId && (
                    <span className="text-[11px] text-muted">(you)</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-muted">{formatDate(row.createdAt)}</td>
              <td className="px-4 py-3 text-muted">
                {formatDate(row.lastSignInAt)}
              </td>
              <td className="px-4 py-3 text-center">{row.problemCount}</td>
              <td className="px-4 py-3 text-center">{row.aiGenerations}</td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => toggleAi(row)}
                  disabled={row.aiIsAdmin || busyId === row.id}
                  title={row.aiIsAdmin ? "Admins always have AI" : "Toggle AI access"}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition disabled:opacity-60 ${
                    row.aiEnabled ? "bg-emerald-500" : "bg-surface-2 border border-border"
                  }`}
                >
                  <span
                    className={`inline-block size-4 rounded-full bg-white shadow transition ${
                      row.aiEnabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </td>
              <td className="px-4 py-3 text-right">
                {row.id === currentUserId ? (
                  <span className="text-xs text-muted">—</span>
                ) : confirmId === row.id ? (
                  <span className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => deleteUser(row.id)}
                      disabled={busyId === row.id}
                      className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white"
                    >
                      {busyId === row.id && (
                        <Loader2 size={12} className="animate-spin" />
                      )}
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-xs text-muted"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmId(row.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-red-500"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
