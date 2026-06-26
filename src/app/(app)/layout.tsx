import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/adminConfig";
import { Nav } from "@/components/Nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Nav email={user.email ?? null} isAdmin={isAdminEmail(user.email)} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
