// src/app/api/osce/turn/route.ts
// Single-turn patient response endpoint for the Phase 7 OSCE engine

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callGrok } from "@/core/ai/providers/grok";
import { buildPatientSystemPrompt } from "@/lib/osce/patient-engine";
import { getStation } from "@/lib/osce/station-loader";
import type { SessionMessage } from "@/lib/osce/types";

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "patient", "system", "examiner", "investigation"]),
  content: z.string(),
  timestamp: z.number(),
  metadata: z.any().optional(),
});

const requestSchema = z.object({
  stationId: z.string().min(1).max(100),
  studentMessage: z.string().min(1).max(2000),
  conversationHistory: z.array(messageSchema).max(60).default([]),
});

function sanitizeInput(input: string): string {
  return input
    .replace(/(\[SYSTEM\]|\[INSTRUCTION\]|<\|.*?\|>)/gi, "")
    .replace(/ignore\s+(all\s+)?previous\s+(instructions?|prompts?)/gi, "")
    .replace(/you are now/gi, "")
    .replace(/forget\s+(your|all)\s+(instructions?|rules?)/gi, "")
    .trim()
    .slice(0, 2000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { stationId, studentMessage, conversationHistory } = parsed.data;

    const station = getStation(stationId);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const sanitized = sanitizeInput(studentMessage);
    const recentHistory = conversationHistory.slice(-30) as SessionMessage[];

    const systemPrompt = buildPatientSystemPrompt(station.patient, recentHistory);

    const result = await callGrok(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: sanitized },
      ],
      {
        temperature: 0.5,
        maxTokens: 250,
        addDisclaimer: false,
      }
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.message ?? "AI service unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      patientResponse: (result.content ?? "").trim(),
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("OSCE turn error:", err);
    return NextResponse.json({ error: "Server error processing OSCE turn" }, { status: 500 });
  }
}
