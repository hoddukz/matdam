// Tag: core
// Path: apps/web/src/app/api/announcements/[id]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/user/auth-utils";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "invalid id format" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const supabase = await createClient();
  const admin = await isAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Build update payload (only provided fields)
  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.content !== undefined) update.content = body.content;
  if (body.summary !== undefined) update.summary = body.summary;
  if (body.pinned !== undefined) update.pinned = body.pinned;
  if (body.published !== undefined) update.published = body.published;
  if (body.metadata !== undefined) update.metadata = body.metadata;
  if ("targetLocales" in body) {
    update.target_locales = body.targetLocales ?? null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from("announcements").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }

  // Fire-and-forget translation if content changed and target is all locales
  const targetLocales = "targetLocales" in body ? body.targetLocales : undefined;
  const contentChanged =
    body.title !== undefined || body.content !== undefined || body.summary !== undefined;

  if (contentChanged && (targetLocales === null || targetLocales === undefined)) {
    const origin = request.headers.get("origin") ?? "";
    fetch(`${origin}/api/translate-announcement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ announcementId: id }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "invalid id format" }, { status: 400 });
  }

  const supabase = await createClient();
  const admin = await isAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
