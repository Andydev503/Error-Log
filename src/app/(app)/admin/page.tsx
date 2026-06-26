import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/adminConfig";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { AdminTable, type AdminRow } from "@/components/AdminTable";

export const metadata = { title: "Admin · Error Log" };

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Hide the page's existence from non-admins.
  if (!isAdminEmail(user?.email)) notFound();

  if (!adminConfigured) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Admin</h1>
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="font-medium">Add your Supabase secret key to enable this page.</p>
          <p className="mt-1 text-muted">
            Set <code>SUPABASE_SECRET_KEY</code> (the <code>sb_secret_…</code> key
            from Supabase → Project Settings → API Keys) in your environment, then
            redeploy. It is server-only and never sent to the browser.
          </p>
        </div>
      </div>
    );
  }

  const admin = createAdminClient();
  const [{ data: usersData }, { data: profiles }, { data: problemRows }] =
    await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from("profiles").select("id, ai_enabled, ai_generations"),
      admin.from("problems").select("user_id"),
    ]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id as string, p]),
  );
  const problemCounts = new Map<string, number>();
  (problemRows ?? []).forEach((r) => {
    const uid = r.user_id as string;
    problemCounts.set(uid, (problemCounts.get(uid) ?? 0) + 1);
  });

  const rows: AdminRow[] = (usersData?.users ?? []).map((u) => {
    const profile = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "—",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      aiEnabled: isAdminEmail(u.email) || Boolean(profile?.ai_enabled),
      aiIsAdmin: isAdminEmail(u.email),
      aiGenerations: Number(profile?.ai_generations ?? 0),
      problemCount: problemCounts.get(u.id) ?? 0,
    };
  });
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted">
          {rows.length} account{rows.length === 1 ? "" : "s"} · manage access and
          usage.
        </p>
      </div>
      <AdminTable rows={rows} currentUserId={user!.id} />
    </div>
  );
}
