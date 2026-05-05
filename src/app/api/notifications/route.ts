import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/core/database/supabase";

/**
 * GET  /api/notifications?user_id=xxx        → fetch user's notifications
 * POST /api/notifications                     → create a new notification
 * PATCH /api/notifications?id=xxx             → mark as read
 */

// ── GET: Fetch notifications for a user ────────────────────────────
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[Notifications GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifications: data || [] });
}

// ── POST: Create a notification ────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, title, message, type, icon } = body;

    if (!user_id || !title || !message) {
      return NextResponse.json(
        { error: "user_id, title, message are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id,
        title,
        message,
        type: type || "info",      // info | reminder | update | achievement
        icon: icon || "🔔",
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[Notifications POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notification: data });
  } catch (err) {
    console.error("[Notifications POST Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PATCH: Mark notification(s) as read ────────────────────────────
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const userId = req.nextUrl.searchParams.get("user_id");

  const supabase = createSupabaseAdmin();

  // Mark single notification as read
  if (id) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  // Mark ALL as read for a user
  if (userId) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "id or user_id required" }, { status: 400 });
}
