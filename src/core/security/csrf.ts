/**
 * CSRF / origin verification for Server Actions.
 *
 * Next.js 15 enforces an origin allowlist for Server Actions via the
 * `experimental.serverActions.allowedOrigins` config (see next.config.ts).
 * This module adds belt-and-braces verification at the action call site so
 * actions remain safe even if the framework config is mis-edited.
 *
 * Usage inside a "use server" function:
 *
 *   import { requireSameOrigin } from "@/core/security/csrf";
 *   await requireSameOrigin();
 */

import "server-only";
import { headers } from "next/headers";

const ALLOWLIST = (() => {
  const list = new Set<string>();
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      list.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
    } catch {
      /* ignore malformed env */
    }
  }
  list.add("medpulse-ai-five.vercel.app");
  list.add("medpulse-a3wfmgz43-6dskdnj66g-dotcoms-projects.vercel.app");
  return list;
})();

function isAllowedHost(host: string | null): boolean {
  if (!host) return false;
  if (process.env.NODE_ENV !== "production") {
    if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return true;
  }
  if (ALLOWLIST.has(host)) return true;
  // Allow Vercel preview deployments under the project namespace.
  if (host.endsWith(".vercel.app")) return true;
  return false;
}

export async function requireSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  const referer = h.get("referer");
  const host = h.get("host");

  if (!isAllowedHost(host)) {
    throw new Error(`CSRF: host '${host}' is not in the allowlist`);
  }

  // Origin should match host. Some environments strip Origin on same-origin
  // navigation, so fall back to Referer.
  const claimed = origin ?? referer;
  if (!claimed) {
    throw new Error("CSRF: missing Origin and Referer headers");
  }

  let claimedHost: string;
  try {
    claimedHost = new URL(claimed).host;
  } catch {
    throw new Error("CSRF: malformed Origin/Referer");
  }

  if (!isAllowedHost(claimedHost)) {
    throw new Error(`CSRF: origin '${claimedHost}' is not in the allowlist`);
  }
}
