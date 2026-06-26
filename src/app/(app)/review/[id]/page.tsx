import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProblem } from "@/lib/data";
import { canUseAi } from "@/lib/admin";
import { ProblemDetail } from "@/components/ProblemDetail";

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [problem, canGenerate] = await Promise.all([getProblem(id), canUseAi()]);
  if (!problem) notFound();

  return (
    <div>
      <Link
        href="/review"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={16} /> Back to review
      </Link>
      <ProblemDetail problem={problem} canGenerate={canGenerate} />
    </div>
  );
}
