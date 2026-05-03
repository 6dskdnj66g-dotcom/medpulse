import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/core/database/supabase";
import webpush, { type PushSubscription as WebPushSubscription } from "web-push";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:support@medpulse.ai";
const CRON_SECRET = process.env.CRON_SECRET;
const IS_PROD = process.env.NODE_ENV === "production";

const BATCH_SIZE = 50;

let vapidConfigured = false;
function ensureVapid(): boolean {
  if (vapidConfigured) return true;
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  vapidConfigured = true;
  return true;
}

interface ClaimedReminder {
  id: string;
  user_id: string;
  title: string;
  body: string;
  action_url: string | null;
}

interface SubscriptionRow {
  endpoint: string;
  subscription: WebPushSubscription;
}

export async function GET(req: NextRequest) {
  // ── 1. SECURITY ───────────────────────────────────────────────────────
  // In prod we require a CRON_SECRET match. In dev/preview without secret
  // the route is open for local testing. We explicitly bail if the env var
  // is missing in prod so that a malformed `Bearer undefined` request can
  // never accidentally authenticate.
  if (IS_PROD) {
    if (!CRON_SECRET) {
      console.error("[cron/process-reminders] CRON_SECRET not configured");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!ensureVapid()) {
    return NextResponse.json({ error: "VAPID keys missing" }, { status: 500 });
  }

  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();

  // ── 2. ATOMIC CLAIM ───────────────────────────────────────────────────
  // Two-phase optimistic claim:
  //   a) SELECT a batch of pending+due ids
  //   b) UPDATE those ids to 'sent' WHERE status is still 'pending'
  // The .eq("status", "pending") on the UPDATE is the race guard: if two
  // cron invocations overlap, only one's UPDATE matches each row — the
  // second sees 0 rows updated for racing rows. RETURNING (.select) then
  // gives us the actual claimed set to dispatch.
  const { data: candidates, error: pickErr } = await supabase
    .from("reminders")
    .select("id")
    .eq("status", "pending")
    .lte("send_at", now)
    .order("send_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (pickErr) {
    console.error("[cron/process-reminders] candidate fetch error:", pickErr);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ processed: 0, claimed: 0 });
  }

  const ids = candidates.map((c) => c.id);
  const { data: claimedRaw, error: claimErr } = await supabase
    .from("reminders")
    .update({ status: "sent" })
    .in("id", ids)
    .eq("status", "pending")
    .select("id, user_id, title, body, action_url");

  if (claimErr) {
    console.error("[cron/process-reminders] claim error:", claimErr);
    return NextResponse.json(
      { error: "Failed to claim reminders" },
      { status: 500 }
    );
  }
  const claimed = (claimedRaw ?? []) as ClaimedReminder[];
  if (claimed.length === 0) {
    return NextResponse.json({ processed: 0, claimed: 0 });
  }

  // ── 3. DISPATCH ───────────────────────────────────────────────────────
  let sent = 0;
  let failed = 0;
  let staleRemoved = 0;
  const failedIds: string[] = [];

  await Promise.all(
    claimed.map(async (reminder) => {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, subscription")
        .eq("user_id", reminder.user_id);

      const subRows = (subs ?? []) as SubscriptionRow[];
      if (subRows.length === 0) {
        failed += 1;
        failedIds.push(reminder.id);
        return;
      }

      const payload = JSON.stringify({
        title: reminder.title,
        body: reminder.body,
        action_url: reminder.action_url ?? "/",
      });

      let anySent = false;
      const staleEndpoints: string[] = [];

      await Promise.all(
        subRows.map(async (s) => {
          try {
            await webpush.sendNotification(s.subscription, payload);
            anySent = true;
          } catch (err) {
            const status = (err as { statusCode?: number }).statusCode;
            if (status === 404 || status === 410) {
              staleEndpoints.push(s.endpoint);
            } else {
              console.error(
                "[cron/process-reminders] dispatch error:",
                err
              );
            }
          }
        })
      );

      if (staleEndpoints.length > 0) {
        const { error: delErr } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", reminder.user_id)
          .in("endpoint", staleEndpoints);
        if (delErr) {
          console.error(
            "[cron/process-reminders] stale cleanup error:",
            delErr
          );
        } else {
          staleRemoved += staleEndpoints.length;
        }
      }

      if (anySent) {
        sent += 1;
      } else {
        failed += 1;
        failedIds.push(reminder.id);
      }
    })
  );

  // ── 4. ROLLBACK FAILURES ──────────────────────────────────────────────
  // Reminders we claimed (status='sent') but that delivered to no device
  // are flipped to 'failed' so they aren't lost in the 'sent' bucket.
  if (failedIds.length > 0) {
    const { error: rollbackErr } = await supabase
      .from("reminders")
      .update({ status: "failed" })
      .in("id", failedIds);
    if (rollbackErr) {
      console.error("[cron/process-reminders] rollback error:", rollbackErr);
    }
  }

  return NextResponse.json({
    claimed: claimed.length,
    sent,
    failed,
    stale_endpoints_removed: staleRemoved,
  });
}
