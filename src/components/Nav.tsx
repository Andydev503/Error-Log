"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/add", label: "Add problem", icon: PlusCircle, exact: false },
  { href: "/review", label: "Review", icon: BookOpen, exact: false },
  { href: "/stats", label: "Stats", icon: BarChart3, exact: false },
];

export function Nav({ email }: { email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface px-3 py-5 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
            E
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Error Log
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {LINKS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(href, exact)
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-center justify-between px-1">
            <span className="truncate text-xs text-muted" title={email ?? ""}>
              {email}
            </span>
            <ThemeToggle />
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex flex-col gap-2 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
              E
            </span>
            <span className="font-semibold">Error Log</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="grid size-9 place-items-center rounded-lg border border-border text-muted"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <nav className="-mx-1 flex gap-1 overflow-x-auto">
          {LINKS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition",
                isActive(href, exact)
                  ? "bg-surface-2 text-foreground"
                  : "text-muted",
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
