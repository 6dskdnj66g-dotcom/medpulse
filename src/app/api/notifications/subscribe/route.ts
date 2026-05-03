import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/core/database/supabase";

export const dynamic = "force-dynamic";

interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: { p256dh: string; auth: string };
}

function isValidSubscription(s: unknown): s is PushSubscriptionJSON {
  if (!s || typeof s !== "object") return false;
  const sub = s as Record<string, unknown>;
  if (typeof sub.endpoint !== "string" || !sub.endpoint.startsWith("https://")) {
    return false;
  }
  if (!sub.keys || typeof sub.keys !== "object") return false;
  const keys = sub.keys as Record<string, unknown>;
  return typeof keys.p256dh === "string" && typeof keys.auth === "string";
}

export async function POST(request: NextRequest) {
  const cookieResponse = NextResponse.next();
  const supabase = createSupabaseServerClient(request, cookieResponse);

  let body: { subscription?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidSubscription(body.subscription)) {
    return NextResponse.json(
      { error: "Invalid subscription payload" },
      { status: 400 }
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userAgent = request.headers.get("user-agent") ?? null;

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: body.subscription.endpoint,
      subscription: body.subscription,
      user_agent: userAgent,
    },
    { onConflict: "user_id,endpoint" }
  );

  if (error) {
    console.error("[notifications/subscribe] upsert error:", error);
    return NextResponse.json(
      { error: "Failed to persist subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const cookieResponse = NextResponse.next();
  const supabase = createSupabaseServerClient(request, cookieResponse);

  let body: { endpoint?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", body.endpoint);

  if (error) {
    console.error("[notifications/subscribe] delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
