import { createClient } from "@/lib/supabase/server";
import { getProblems } from "@/lib/data";
import { StatsDashboard } from "@/components/StatsDashboard";

export const metadata = { title: "Stats · Error Log" };

export default async function StatsPage() {
  const problems = await getProblems();

  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("got_correct");
  const total = reviews?.length ?? 0;
  const correct = reviews?.filter((r) => r.got_correct === true).length ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        <p className="text-sm text-muted">
          Where your mistakes cluster, and how you&apos;re progressing.
        </p>
      </div>
      <StatsDashboard problems={problems} accuracy={{ correct, total }} />
    </div>
  );
}
