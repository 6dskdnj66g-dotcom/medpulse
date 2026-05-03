import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/core/database/supabase";
import webpush, { type PushSubscription as WebPushSubscription } from "web-push";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:support@medpulse.ai";
const ADMIN_TOKEN = process.env.NOTIFICATIONS_ADMIN_TOKEN;

let vapidConfigured = false;
function ensureVapid(): boolean {
  if (vapidConfigured) return true;
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  vapidConfigured = true;
  return true;
}

interface SendBody {
  userId: string;
  title: string;
  body: string;
  action_url?: string;
}

function isSendBody(x: unknown): x is SendBody {
  if (!x || typeof x !== "object") return false;
  const b = x as Record<string, unknown>;
  return (
    typeof b.userId === "string" &&
    b.userId.length > 0 &&
    typeof b.title === "string" &&
    b.title.length > 0 &&
    typeof b.body === "string" &&
    b.body.length > 0 &&
    (b.action_url === undefined || typeof b.action_url === "string")
  );
}

export async function POST(request: NextRequest) {
  if (!ADMIN_TOKEN) {
    return NextResponse.json(
      { error: "Server not configured (admin token missing)" },
      { status: 503 }
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ensureVapid()) {
    return NextResponse.json(
      { error: "Server not configured (VAPID keys missing)" },
      { status: 503 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!isSendBody(raw)) {
    return NextResponse.json(
      { error: "Missing or invalid fields (need userId, title, body)" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();
  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, subscription")
    .eq("user_id", raw.userId);

  if (error) {
    console.error("[notifications/send] subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load subscriptions" },
      { status: 500 }
    );
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, removed: 0 });
  }

  const message = JSON.stringify({
    title: raw.title,
    body: raw.body,
    action_url: raw.action_url ?? "/",
  });

  let sent = 0;
  const stale: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          s.subscription as WebPushSubscription,
          message
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          stale.push(s.endpoint);
        } else {
          console.error("[notifications/send] dispatch error:", err);
        }
      }
    })
  );

  if (stale.length > 0) {
    const { error: delErr } = await admin
      .from("push_subscriptions")
      .delete()
      .in("endpoint", stale)
      .eq("user_id", raw.userId);
    if (delErr) {
      console.error("[notifications/send] stale cleanup error:", delErr);
    }
  }

  return NextResponse.json({ sent, removed: stale.length });
}
