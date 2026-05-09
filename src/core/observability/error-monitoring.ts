/**
 * Lightweight error-monitoring client.
 *
 * Goals:
 *   - Zero runtime dependencies (works in Node and Edge runtimes).
 *   - Env-gated: if SENTRY_DSN is not set, falls back to console.
 *   - Sentry envelope-compatible (sentry.io / self-hosted / Glitchtip).
 *   - Fire-and-forget, never throws.
 *
 * The full @sentry/nextjs SDK is intentionally NOT used to avoid pulling
 * in a multi-megabyte dependency for a feature most local devs disable.
 *
 * Set SENTRY_DSN in production to enable. Format:
 *   https://<publicKey>@<host>/<projectId>
 */

const DSN = process.env.SENTRY_DSN;
const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
const RELEASE = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12);

interface ParsedDSN {
  host: string;
  projectId: string;
  publicKey: string;
  envelopeUrl: string;
}

function parseDSN(dsn: string): ParsedDSN | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace(/^\//, "");
    if (!publicKey || !projectId) return null;
    return {
      host: url.host,
      projectId,
      publicKey,
      envelopeUrl: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
    };
  } catch {
    return null;
  }
}

const parsed = DSN ? parseDSN(DSN) : null;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

interface CaptureContext {
  user?: { id?: string; email?: string };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: "fatal" | "error" | "warning" | "info" | "debug";
  route?: string;
}

function buildEnvelope(eventId: string, payload: object): string {
  const header = JSON.stringify({
    event_id: eventId,
    sent_at: new Date().toISOString(),
  });
  const itemHeader = JSON.stringify({ type: "event" });
  const body = JSON.stringify(payload);
  return `${header}\n${itemHeader}\n${body}\n`;
}

function frameStack(stack: string | undefined) {
  if (!stack) return undefined;
  return {
    frames: stack
      .split("\n")
      .slice(1, 30)
      .map(line => ({ filename: line.trim() })),
  };
}

async function send(payload: object): Promise<void> {
  if (!parsed) return;

  const eventId = uuid();
  const envelope = buildEnvelope(eventId, { event_id: eventId, ...payload });

  try {
    await fetch(parsed.envelopeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth":
          `Sentry sentry_version=7,sentry_key=${parsed.publicKey},sentry_client=medpulse/1.0`,
      },
      body: envelope,
      keepalive: true,
    });
  } catch {
    // Swallow — error monitoring must never crash the app.
  }
}

function basePayload(context: CaptureContext = {}) {
  return {
    timestamp: Date.now() / 1000,
    platform: "javascript",
    level: context.level ?? "error",
    environment: ENV,
    release: RELEASE,
    server_name: typeof process !== "undefined" ? process.env.HOSTNAME : undefined,
    user: context.user,
    tags: { ...(context.route ? { route: context.route } : {}), ...context.tags },
    extra: context.extra,
  };
}

export function captureException(error: unknown, context?: CaptureContext): void {
  const err = error instanceof Error ? error : new Error(String(error));

  if (!parsed) {
    console.error("[error-monitoring]", err.message, context ?? "");
    return;
  }

  void send({
    ...basePayload(context),
    exception: {
      values: [
        {
          type: err.name ?? "Error",
          value: err.message,
          stacktrace: frameStack(err.stack),
        },
      ],
    },
  });
}

export function captureMessage(
  message: string,
  level: CaptureContext["level"] = "info",
  context?: CaptureContext
): void {
  if (!parsed) {
    console.log(`[error-monitoring][${level}]`, message, context ?? "");
    return;
  }

  void send({
    ...basePayload({ ...context, level }),
    message: { formatted: message },
  });
}

export function isErrorMonitoringEnabled(): boolean {
  return Boolean(parsed);
}
