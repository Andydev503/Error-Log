import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSolution, geminiConfigured } from "@/lib/gemini";
import { isGeminiModel } from "@/lib/constants";
import { isAdminEmail } from "@/lib/adminConfig";
import { publicImageUrl } from "@/lib/images";
import type { Problem } from "@/lib/types";

export async function POST(request: Request) {
  if (!geminiConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI is not configured. Add a free GEMINI_API_KEY to enable worked solutions.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // AI generation is a per-account privilege (admins always allowed).
  let allowed = isAdminEmail(user.email);
  if (!allowed) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_enabled")
      .eq("id", user.id)
      .maybeSingle();
    allowed = Boolean(profile?.ai_enabled);
  }
  if (!allowed) {
    return NextResponse.json(
      { error: "AI solutions aren't enabled for your account." },
      { status: 403 },
    );
  }

  let problemId: string | undefined;
  let regenerate = false;
  let model: string | undefined;
  try {
    const body = await request.json();
    problemId = body.problemId;
    regenerate = Boolean(body.regenerate);
    if (typeof body.model === "string" && isGeminiModel(body.model)) {
      model = body.model;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!problemId) {
    return NextResponse.json(
      { error: "Missing problemId." },
      { status: 400 },
    );
  }

  // RLS ensures the user can only read their own problem.
  const { data: problem, error } = await supabase
    .from("problems")
    .select("*")
    .eq("id", problemId)
    .single<Problem>();

  if (error || !problem) {
    return NextResponse.json({ error: "Problem not found." }, { status: 404 });
  }

  if (problem.ai_solution && !regenerate) {
    return NextResponse.json({ solution: problem.ai_solution, cached: true });
  }

  const imageUrl = publicImageUrl(problem.problem_image_path);
  if (!imageUrl) {
    return NextResponse.json(
      { error: "This problem has no screenshot to read." },
      { status: 400 },
    );
  }

  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("Could not load the problem image.");
    const mimeType = imgRes.headers.get("content-type") || "image/webp";
    const bytes = new Uint8Array(await imgRes.arrayBuffer());

    const solution = await generateSolution(
      bytes,
      mimeType,
      {
        subject: problem.subject,
        topic: problem.topic,
        source: problem.source,
        casActive: problem.cas_active,
      },
      model,
    );

    await supabase
      .from("problems")
      .update({ ai_solution: solution })
      .eq("id", problem.id);
    await supabase.rpc("increment_ai_usage");

    return NextResponse.json({ solution, cached: false });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to generate a solution.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
