import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getProblem } from "@/lib/data";
import { ProblemForm } from "@/components/ProblemForm";

export default async function EditProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const problem = await getProblem(id);
  if (!problem) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/review/${id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={16} /> Back to problem
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Edit problem
      </h1>
      <ProblemForm userId={user.id} existing={problem} />
    </div>
  );
}
