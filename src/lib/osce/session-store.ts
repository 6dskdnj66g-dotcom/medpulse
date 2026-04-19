// src/lib/osce/session-store.ts
// localStorage-backed OSCE session persistence — no backend required

export interface OSCEMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface OSCESession {
  sessionId: string;
  scenarioId: string;
  patientName: string;      // stored at session start — never re-fetched
  startedAt: number;
  lastActivityAt: number;
  messages: OSCEMessage[];
  rubricProgress: Record<string, boolean>;  // itemId → covered
  currentScore: number;
  status: "active" | "completed" | "abandoned";
  result?: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    passFail: "pass" | "borderline" | "fail";
    breakdown: { name: string; earned: number; max: number; comments: string }[];
    positives: string[];
    improvements: string[];
    aiFeedback: string;
  };
}

// ── Storage key helpers ───────────────────────────────────────────────────────
const KEY = (id: string) => `osce_session_${id}`;
const ACTIVE_KEY = "osce_active_session_id";
const MAX_SESSIONS = 50; // keep last 50 sessions

// ── Store API ─────────────────────────────────────────────────────────────────
export const oscSessionStore = {
  save(session: OSCESession): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEY(session.sessionId), JSON.stringify({
        ...session,
        lastActivityAt: Date.now(),
      }));
      if (session.status === "active") {
        localStorage.setItem(ACTIVE_KEY, session.sessionId);
      }
      this._prune();
    } catch {
      // localStorage full — clear oldest and retry
      this._pruneAggressive();
      try { localStorage.setItem(KEY(session.sessionId), JSON.stringify(session)); } catch { /* silent */ }
    }
  },

  load(sessionId: string): OSCESession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(KEY(sessionId));
      return raw ? (JSON.parse(raw) as OSCESession) : null;
    } catch { return null; }
  },

  loadActive(): OSCESession | null {
    if (typeof window === "undefined") return null;
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (!activeId) return null;
    const session = this.load(activeId);
    // Only return if actually active
    if (session?.status === "active") return session;
    localStorage.removeItem(ACTIVE_KEY);
    return null;
  },

  clearActive(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACTIVE_KEY);
  },

  complete(sessionId: string, result: OSCESession["result"]): void {
    const session = this.load(sessionId);
    if (!session) return;
    this.save({ ...session, status: "completed", result, lastActivityAt: Date.now() });
    this.clearActive();
  },

  abandon(sessionId: string): void {
    const session = this.load(sessionId);
    if (!session) return;
    this.save({ ...session, status: "abandoned", lastActivityAt: Date.now() });
    this.clearActive();
  },

  listAll(): OSCESession[] {
    if (typeof window === "undefined") return [];
    const sessions: OSCESession[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("osce_session_")) {
        const id = k.replace("osce_session_", "");
        const s = this.load(id);
        if (s) sessions.push(s);
      }
    }
    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  },

  listCompleted(): OSCESession[] {
    return this.listAll().filter(s => s.status === "completed");
  },

  addMessage(sessionId: string, message: OSCEMessage): OSCESession | null {
    const session = this.load(sessionId);
    if (!session) return null;
    const updated = {
      ...session,
      messages: [...session.messages, message],
      lastActivityAt: Date.now(),
    };
    this.save(updated);
    return updated;
  },

  updateRubricProgress(sessionId: string, itemId: string): void {
    const session = this.load(sessionId);
    if (!session) return;
    this.save({
      ...session,
      rubricProgress: { ...session.rubricProgress, [itemId]: true },
    });
  },

  createNew(scenarioId: string, patientName: string): OSCESession {
    const session: OSCESession = {
      sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      scenarioId,
      patientName,
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
      messages: [],
      rubricProgress: {},
      currentScore: 0,
      status: "active",
    };
    this.save(session);
    return session;
  },

  _prune(): void {
    const all = this.listAll();
    if (all.length > MAX_SESSIONS) {
      // Remove oldest abandoned/completed sessions
      const toRemove = all
        .filter(s => s.status !== "active")
        .slice(MAX_SESSIONS);
      toRemove.forEach(s => localStorage.removeItem(KEY(s.sessionId)));
    }
  },

  _pruneAggressive(): void {
    const all = this.listAll();
    all.slice(10).forEach(s => localStorage.removeItem(KEY(s.sessionId)));
  },
};

// ── Helper: generate session ID ───────────────────────────────────────────────
export function newSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
