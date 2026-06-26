import { getProblems } from "@/lib/data";
import { canUseAi } from "@/lib/admin";
import { RapidReview } from "@/components/RapidReview";

export const metadata = { title: "Rapid review · Error Log" };

export default async function RapidPage() {
  const [problems, canGenerate] = await Promise.all([getProblems(), canUseAi()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Rapid review</h1>
        <p className="text-sm text-muted">
          Pick a subject or topic and blitz through your mistakes one by one.
        </p>
      </div>
      <RapidReview problems={problems} canGenerate={canGenerate} />
    </div>
  );
}
