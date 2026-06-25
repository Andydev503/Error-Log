import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getProblems } from "@/lib/data";
import { ReviewBrowser } from "@/components/ReviewBrowser";

export const metadata = { title: "Review · Error Log" };

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const problems = await getProblems();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review</h1>
          <p className="text-sm text-muted">
            Browse, filter, and work back through your mistakes.
          </p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <PlusCircle size={16} />
          <span className="hidden sm:inline">Add problem</span>
        </Link>
      </div>
      <ReviewBrowser problems={problems} initialSubject={subject ?? "all"} />
    </div>
  );
}
