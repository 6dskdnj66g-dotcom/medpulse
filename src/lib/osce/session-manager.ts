// src/lib/osce/session-manager.ts
// localStorage-backed OSCE session persistence with recovery support

import type {
  OSCESession, OSCEStation, SessionMessage, SessionScores, RubricItemProgress
} from "./types";

const SESSION_PREFIX = "osce_v2_session_";
const ACTIVE_SESSION_KEY = "osce_v2_active_session_id";

const EMPTY_SCORES: SessionScores = {
  dataGathering: { earned: 0, max: 0, percentage: 0 },
  clinicalManagement: { earned: 0, max: 0, percentage: 0 },
  interpersonalSkills: { earned: 0, max: 0, percentage: 0 },
  total: 0,
};

export class SessionManager {
  private session: OSCESession;

  constructor(stationOrSession: OSCEStation | OSCESession) {
    if ("startedAt" in stationOrSession) {
      this.session = stationOrSession;
    } else {
      this.session = this.createNew(stationOrSession);
    }
    this.persist();
  }

  private createNew(station: OSCEStation): OSCESession {
    return {
      sessionId: crypto.randomUUID(),
      stationId: station.id,
      startedAt: Date.now(),
      status: "reading",
      messages: [],
      rubricProgress: {},
      releasedInvestigations: [],
      scores: { ...EMPTY_SCORES },
    };
  }

  startActive(): void {
    this.session.status = "active";
    this.session.startedAt = Date.now();
    this.persist();
  }

  addMessage(message: Omit<SessionMessage, "id" | "timestamp">): SessionMessage {
    const full: SessionMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    this.session.messages.push(full);
    this.persist();
    return full;
  }

  recordInvestigation(investigationId: string): void {
    if (!this.session.releasedInvestigations.includes(investigationId)) {
      this.session.releasedInvestigations.push(investigationId);
      this.persist();
    }
  }

  updateRubricProgress(progress: Record<string, RubricItemProgress>): void {
    this.session.rubricProgress = progress;
    this.persist();
  }

  updateScores(scores: SessionScores): void {
    this.session.scores = scores;
    this.persist();
  }

  complete(feedback?: string): void {
    this.session.status = "completed";
    this.session.completedAt = Date.now();
    if (feedback) this.session.finalFeedback = feedback;
    this.persist();
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }

  timeOut(): void {
    this.session.status = "timed-out";
    this.session.completedAt = Date.now();
    this.persist();
  }

  getElapsedSeconds(): number {
    return Math.floor((Date.now() - this.session.startedAt) / 1000);
  }

  getRemainingSeconds(durationMinutes: number): number {
    return Math.max(0, durationMinutes * 60 - this.getElapsedSeconds());
  }

  getSession(): OSCESession {
    return { ...this.session };
  }

  getRecentMessages(count = 30): SessionMessage[] {
    return this.session.messages.slice(-count);
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `${SESSION_PREFIX}${this.session.sessionId}`,
        JSON.stringify(this.session)
      );
      if (this.session.status === "active" || this.session.status === "reading") {
        localStorage.setItem(ACTIVE_SESSION_KEY, this.session.sessionId);
      }
    } catch {
      // localStorage may be full — silently ignore
    }
  }

  static loadActive(): OSCESession | null {
    if (typeof window === "undefined") return null;
    try {
      const id = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!id) return null;
      const raw = localStorage.getItem(`${SESSION_PREFIX}${id}`);
      if (!raw) return null;
      const session = JSON.parse(raw) as OSCESession;
      if (session.status !== "active" && session.status !== "reading") return null;
      return session;
    } catch {
      return null;
    }
  }

  static loadAll(): OSCESession[] {
    if (typeof window === "undefined") return [];
    const sessions: OSCESession[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(SESSION_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) sessions.push(JSON.parse(raw) as OSCESession);
        }
      }
    } catch {
      return [];
    }
    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  }

  static delete(sessionId: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${SESSION_PREFIX}${sessionId}`);
  }
}
