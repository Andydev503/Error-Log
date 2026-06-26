import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProblemForm } from "@/components/ProblemForm";

export const metadata = { title: "Add problem · Error Log" };

export default async function AddPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        Add a problem
      </h1>
      <p className="mb-6 text-sm text-muted">
        Paste a screenshot (Ctrl/Cmd+V works anywhere on this page), then fill in
        the details.
      </p>
      <ProblemForm userId={user.id} />
    </div>
  );
}
