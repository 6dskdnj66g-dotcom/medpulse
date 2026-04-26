// src/lib/osce/station-loader.ts
// Server-side station loader — reads JSON files from data/osce-stations/
// Only call from API routes or server components

import * as fs from "fs";
import * as path from "path";
import type { OSCEStation } from "./types";

const STATIONS_DIR = path.join(process.cwd(), "data", "osce-stations");
const stationCache = new Map<string, OSCEStation>();
let allStationsCache: OSCEStation[] | null = null;

export function getStation(id: string): OSCEStation | null {
  if (stationCache.has(id)) return stationCache.get(id)!;

  // Try direct filename match first (filename = id.json)
  try {
    const directPath = path.join(STATIONS_DIR, `${id}.json`);
    if (fs.existsSync(directPath)) {
      const station = JSON.parse(fs.readFileSync(directPath, "utf-8")) as OSCEStation;
      stationCache.set(id, station);
      return station;
    }
  } catch {
    // fall through to search
  }

  // Search all files for matching id field
  try {
    const files = fs.readdirSync(STATIONS_DIR).filter(f => f.endsWith(".json"));
    for (const file of files) {
      try {
        const station = JSON.parse(
          fs.readFileSync(path.join(STATIONS_DIR, file), "utf-8")
        ) as OSCEStation;
        stationCache.set(station.id, station);
        if (station.id === id) return station;
      } catch {
        // skip malformed files
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getAllStations(): OSCEStation[] {
  if (allStationsCache) return allStationsCache;

  const stations: OSCEStation[] = [];
  try {
    const files = fs.readdirSync(STATIONS_DIR).filter(f => f.endsWith(".json"));
    for (const file of files) {
      try {
        const station = JSON.parse(
          fs.readFileSync(path.join(STATIONS_DIR, file), "utf-8")
        ) as OSCEStation;
        stations.push(station);
        stationCache.set(station.id, station);
      } catch {
        // skip malformed files
      }
    }
  } catch {
    return [];
  }

  allStationsCache = stations;
  return stations;
}

export function getStationsByCategory(category: string): OSCEStation[] {
  return getAllStations().filter(s => s.category === category);
}

export function getStationsByExam(exam: string): OSCEStation[] {
  return getAllStations().filter(s => s.exam === exam);
}

export function clearCache(): void {
  stationCache.clear();
  allStationsCache = null;
}
