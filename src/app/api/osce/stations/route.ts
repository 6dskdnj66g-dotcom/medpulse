// src/app/api/osce/stations/route.ts
// Returns all OSCE stations (metadata only, no patient history)

import { NextResponse } from "next/server";
import { getAllStations } from "@/lib/osce/station-loader";

export async function GET() {
  const stations = getAllStations();

  // Return safe metadata only (no patient history or rubric details)
  const metadata = stations.map(s => ({
    id: s.id,
    exam: s.exam,
    title: s.title,
    category: s.category,
    specialty: s.specialty,
    difficulty: s.difficulty,
    durationMinutes: s.durationMinutes,
    readingTimeMinutes: s.readingTimeMinutes,
    primaryDiagnosis: s.primaryDiagnosis,
    tags: s.tags,
    patientName: s.patient.name,
    patientAge: s.patient.age,
    patientGender: s.patient.gender,
    rubricTotalMaxScore: s.rubric.totalMaxScore,
    rubricPassingScore: s.rubric.passingScore,
  }));

  return NextResponse.json(metadata);
}
