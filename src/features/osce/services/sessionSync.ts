/**
 * Best-effort OSCE session synchronisation to Supabase.
 *
 * Local-first: localStorage remains the canonical store on the client so
 * the simulator keeps working offline. This module mirrors a session to the
 * server in the background; failures are swallowed and never block UX.
 *
 * Authentication is cookie-based (Supabase SSR), so no token plumbing is
 * needed here — the API route resolves the user from the session cookie.
 */

import type { OSCESession } from "@/lib/osce/types";

const ENDPOINT = "/api/osce/sessions";

let inFlight: Promise<void> | null = null;
let pending: OSCESession | null = null;

async function postSession(session: OSCESession): Promise<void> {
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
      credentials: "same-origin",
      keepalive: true,
    });
  } catch {
    // Offline / network error / 401 — ignore, localStorage is canonical.
  }
}

/**
 * Schedule a coalesced sync. If a sync is already in flight, the latest
 * payload is queued and sent immediately after the previous request lands.
 */
export function syncOSCESession(session: OSCESession): void {
  if (typeof window === "undefined") return;

  pending = session;

  if (inFlight) return;

  inFlight = (async () => {
    while (pending) {
      const next = pending;
      pending = null;
      await postSession(next);
    }
  })().finally(() => {
    inFlight = null;
  });
}

export async function fetchRemoteOSCESessions(): Promise<unknown[]> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "GET",
      credentials: "same-origin",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { sessions?: unknown[] };
    return data.sessions ?? [];
  } catch {
    return [];
  }
}
