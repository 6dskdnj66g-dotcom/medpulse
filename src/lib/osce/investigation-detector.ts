// src/lib/osce/investigation-detector.ts
// Detects when a student requests an investigation based on their message

import type { Investigation, OSCEStation } from "./types";

const REQUEST_VERBS = [
  "order", "request", "get", "do", "perform", "obtain",
  "send", "check", "run", "arrange", "would like", "need",
  "let's get", "can we have", "i'd like", "show me",
  "i'd order", "i would order", "next i would", "i want to",
  "please do", "can you do", "can you get", "please get",
  "please send", "take a", "take an", "do a", "do an",
  "get a", "get an", "order a", "order an",
];

export class InvestigationDetector {
  private station: OSCEStation;
  private released: Set<string> = new Set();

  constructor(station: OSCEStation) {
    this.station = station;
  }

  detect(studentMessage: string): Investigation | null {
    const message = studentMessage.toLowerCase();

    for (const inv of this.station.patient.investigations) {
      if (this.released.has(inv.id)) continue;

      const keywordMatched = inv.triggerKeywords.some(kw =>
        message.includes(kw.toLowerCase())
      );

      if (keywordMatched && this.isActualRequest(message)) {
        this.released.add(inv.id);
        return inv;
      }
    }

    return null;
  }

  detectMultiple(studentMessage: string): Investigation[] {
    const message = studentMessage.toLowerCase();
    const results: Investigation[] = [];

    if (!this.isActualRequest(message)) return results;

    for (const inv of this.station.patient.investigations) {
      if (this.released.has(inv.id)) continue;

      const keywordMatched = inv.triggerKeywords.some(kw =>
        message.includes(kw.toLowerCase())
      );

      if (keywordMatched) {
        this.released.add(inv.id);
        results.push(inv);
      }
    }

    return results;
  }

  private isActualRequest(message: string): boolean {
    return REQUEST_VERBS.some(verb => message.includes(verb));
  }

  reset(): void {
    this.released.clear();
  }

  getReleased(): string[] {
    return Array.from(this.released);
  }

  markReleased(investigationId: string): void {
    this.released.add(investigationId);
  }
}
