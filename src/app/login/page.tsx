"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/config";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  if (!supabaseConfigured) return <SetupNotice />;
  return <LoginForm />;
}

function SetupNotice() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Almost there — finish setup</h1>
        <p className="mt-1 text-sm text-muted">
          Add your free Supabase keys, then restart the dev server.
        </p>
        <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm">
          <li>
            Create a free project at{" "}
            <a
              className="font-medium text-blue-500 underline"
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
            >
              supabase.com
            </a>
            .
          </li>
          <li>
            Run <code>supabase/schema.sql</code> in the Supabase SQL Editor.
          </li>
          <li>
            Copy the Project URL + anon key into <code>.env.local</code>.
          </li>
          <li>
            (Optional) Add a free <code>GEMINI_API_KEY</code> for AI solutions.
          </li>
        </ol>
        <p className="mt-4 text-xs text-muted">
          See <code>README.md</code> for the full walkthrough.
        </p>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setInfo("Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 grid size-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-xl font-bold text-white">
            E
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">Error Log</h1>
          <p className="mt-1 text-sm text-muted">
            Track the problems you get wrong, and master them.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <label className="text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
            />
          </label>
          <label className="text-sm font-medium">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {info && <p className="text-sm text-emerald-500">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="text-center text-xs text-muted hover:text-foreground"
          >
            {mode === "signin"
              ? "No account yet? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
