import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/core/database/supabase";

export const dynamic = "force-dynamic";

const ScoreBucket = z.object({
  earned: z.number().finite(),
  max: z.number().finite(),
  percentage: z.number().finite(),
});

const SessionPayload = z.object({
  sessionId: z.string().uuid(),
  stationId: z.string().min(1).max(128),
  status: z.enum(["reading", "active", "completed", "timed-out"]),
  startedAt: z.number().int().nonnegative(),
  completedAt: z.number().int().nonnegative().optional(),
  scores: z
    .object({
      dataGathering: ScoreBucket,
      clinicalManagement: ScoreBucket,
      interpersonalSkills: ScoreBucket,
      total: z.number().finite(),
    })
    .partial()
    .passthrough(),
  rubricProgress: z.record(z.string(), z.unknown()),
  releasedInvestigations: z.array(z.string()),
  messages: z.array(z.unknown()).max(500),
  finalFeedback: z.string().max(20_000).optional(),
});

export async function POST(request: NextRequest) {
  const cookieResponse = NextResponse.next();
  const supabase = createSupabaseServerClient(request, cookieResponse);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SessionPayload.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid session payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const session = parsed.data;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("osce_sessions").upsert(
    {
      session_id: session.sessionId,
      user_id: user.id,
      station_id: session.stationId,
      status: session.status,
      started_at: new Date(session.startedAt).toISOString(),
      completed_at: session.completedAt
        ? new Date(session.completedAt).toISOString()
        : null,
      scores: session.scores,
      rubric_progress: session.rubricProgress,
      released_investigations: session.releasedInvestigations,
      messages: session.messages,
      final_feedback: session.finalFeedback ?? null,
    },
    { onConflict: "session_id" }
  );

  if (error) {
    console.error("[osce/sessions] upsert error:", error);
    return NextResponse.json(
      { error: "Failed to persist session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const cookieResponse = NextResponse.next();
  const supabase = createSupabaseServerClient(request, cookieResponse);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("osce_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[osce/sessions] fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }

  return NextResponse.json({ sessions: data ?? [] });
}
