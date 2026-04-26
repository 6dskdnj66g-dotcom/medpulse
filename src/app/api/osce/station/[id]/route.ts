// src/app/api/osce/station/[id]/route.ts
// Serves a single OSCE station by ID

import { NextRequest, NextResponse } from "next/server";
import { getStation } from "@/lib/osce/station-loader";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const station = getStation(id);
  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  return NextResponse.json(station);
}
