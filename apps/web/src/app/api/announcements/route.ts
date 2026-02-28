// Tag: core
// Path: apps/web/src/app/api/announcements/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/user/auth-utils";

export async function POST(request: Request) {
  // 1. Parse request
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const title = body.title as Record<string, string> | undefined;
  const content = body.content as Record<string, string> | undefined;
  const summary = body.summary as Record<string, string> | undefined;
  const pinned = body.pinned === true;
  const published = body.published !== false;
  const targetLocales = body.targetLocales as string[] | null | undefined;
  const metadata = (body.metadata as Record<string, unknown>) ?? {};

  if (!title || !content) {
    return NextResponse.json({ error: "title and content required" }, { status: 400 });
  }

  // 2. Auth + admin check
  const supabase = await createClient();
  const admin = await isAdmin(supabase);
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 3. Insert
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title,
      content,
      summary: summary ?? {},
      pinned,
      published,
      target_locales: targetLocales ?? null,
      metadata,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }

  // 4. Fire-and-forget translation (전체 대상인 경우만)
  if (targetLocales === null || targetLocales === undefined) {
    const origin = request.headers.get("origin") ?? "";
    fetch(`${origin}/api/translate-announcement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ announcementId: data.id }),
    }).catch(() => {
      // fire-and-forget: 번역 실패해도 공지 생성은 성공
    });
  }

  return NextResponse.json({ id: data.id });
}
