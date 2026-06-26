import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/adminConfig";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { IMAGE_BUCKET } from "@/lib/constants";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!adminConfigured) {
    return NextResponse.json(
      { error: "SUPABASE_SECRET_KEY is not configured." },
      { status: 503 },
    );
  }

  const { userId } = await request.json().catch(() => ({}));
  if (typeof userId !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (userId === user!.id) {
    return NextResponse.json(
      { error: "You can't delete your own account here." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Best-effort: clear the user's screenshots before deleting the account.
  const { data: files } = await admin.storage.from(IMAGE_BUCKET).list(userId);
  if (files?.length) {
    await admin.storage
      .from(IMAGE_BUCKET)
      .remove(files.map((f) => `${userId}/${f.name}`));
  }

  // Deleting the auth user cascades to problems/reviews/profiles via FK.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
