// src/lib/osce/rubric-tracker.ts
// Live rubric scoring engine — separate AI call from patient, temperature 0

import type { OSCERubric, RubricItem, RubricItemProgress, SessionScores } from "./types";
import { askGrok } from "@/lib/ai/grok";

export class RubricTracker {
  private rubric: OSCERubric;
  private progress: Map<string, RubricItemProgress> = new Map();

  constructor(rubric: OSCERubric) {
    this.rubric = rubric;
    this.initializeProgress();
  }

  private initializeProgress(): void {
    const allItems = this.getAllItems();
    for (const item of allItems) {
      this.progress.set(item.id, {
        itemId: item.id,
        triggered: false,
        quality: null,
        pointsAwarded: 0,
      });
    }
  }

  private getAllItems(): RubricItem[] {
    return [
      ...this.rubric.domains.dataGathering,
      ...this.rubric.domains.clinicalManagement,
      ...this.rubric.domains.interpersonalSkills,
    ];
  }

  async analyzeMessage(
    message: string,
    messageId: string,
    investigationsReleased: string[]
  ): Promise<{ triggered: string[]; quality: Record<string, string> }> {
    const allItems = this.getAllItems();
    const newlyTriggered: string[] = [];
    const qualityMap: Record<string, string> = {};

    for (const item of allItems) {
      const current = this.progress.get(item.id)!;
      if (current.triggered) continue;

      let isTriggered = false;

      switch (item.detectionMethod) {
        case "keyword":
          isTriggered = this.checkKeywordMatch(message, item);
          break;

        case "investigation-requested":
          isTriggered = item.investigationId
            ? investigationsReleased.includes(item.investigationId)
            : false;
          break;

        case "diagnosis-stated":
          isTriggered = this.checkDiagnosisStated(message, item);
          break;

        case "ai-evaluation":
          isTriggered = await this.aiEvaluate(message, item);
          break;
      }

      if (isTriggered) {
        const quality = await this.assessQuality(message, item);

        this.progress.set(item.id, {
          ...current,
          triggered: true,
          triggeredAt: Date.now(),
          triggerMessageId: messageId,
          quality,
          pointsAwarded: this.calculatePoints(item, quality),
        });

        newlyTriggered.push(item.id);
        qualityMap[item.id] = quality;
      }
    }

    return { triggered: newlyTriggered, quality: qualityMap };
  }

  private checkKeywordMatch(message: string, item: RubricItem): boolean {
    if (!item.keywordMatchers) return false;
    const lower = message.toLowerCase();

    const hasPrimary = item.keywordMatchers.primary.some(kw =>
      lower.includes(kw.toLowerCase())
    );
    if (!hasPrimary) return false;

    if (item.keywordMatchers.exclusions) {
      const hasExclusion = item.keywordMatchers.exclusions.some(kw =>
        lower.includes(kw.toLowerCase())
      );
      if (hasExclusion) return false;
    }

    return true;
  }

  private checkDiagnosisStated(message: string, item: RubricItem): boolean {
    if (!item.keywordMatchers) return false;
    const lower = message.toLowerCase();
    const diagnosisVerbs = [
      "diagnosis is", "i think", "this is", "looks like", "consistent with",
      "suggests", "likely", "probably", "i believe", "my impression",
    ];
    const hasVerb = diagnosisVerbs.some(v => lower.includes(v));
    if (!hasVerb) return false;

    return item.keywordMatchers.primary.some(kw =>
      lower.includes(kw.toLowerCase())
    );
  }

  private async aiEvaluate(message: string, item: RubricItem): Promise<boolean> {
    try {
      const response = await askGrok({
        systemPrompt: "You are a strict OSCE examiner. Reply with ONLY the word YES or NO.",
        userMessage: `Does this student utterance clearly demonstrate the criterion?

CRITERION: ${item.criterion}
EXPECTED: ${item.detailedExpectation}
STUDENT SAID: "${message}"

Reply YES or NO only.`,
        temperature: 0,
        maxTokens: 5,
      });
      return response.trim().toUpperCase().startsWith("YES");
    } catch {
      return false;
    }
  }

  private async assessQuality(
    message: string,
    item: RubricItem
  ): Promise<"excellent" | "good" | "adequate" | "poor"> {
    try {
      const response = await askGrok({
        systemPrompt: "You are a strict OSCE examiner. Reply with ONE word only: EXCELLENT, GOOD, ADEQUATE, or POOR.",
        userMessage: `Rate how well this utterance demonstrates the criterion.

CRITERION: "${item.criterion}"
STUDENT SAID: "${message}"

EXCELLENT = comprehensive, clinically excellent
GOOD = covers criterion well, minor gaps
ADEQUATE = meets minimum requirement
POOR = barely passes or significant issues

Reply with ONE word.`,
        temperature: 0,
        maxTokens: 10,
      });
      const word = response.trim().toUpperCase();
      if (word.includes("EXCELLENT")) return "excellent";
      if (word.includes("GOOD")) return "good";
      if (word.includes("ADEQUATE")) return "adequate";
      return "poor";
    } catch {
      return "adequate";
    }
  }

  private calculatePoints(item: RubricItem, quality: string): number {
    const multiplier: Record<string, number> = {
      excellent: 1.0,
      good: 0.85,
      adequate: 0.7,
      poor: 0.4,
    };
    return Math.round(item.weight * (multiplier[quality] ?? 0.7) * 10) / 10;
  }

  getCurrentScores(): SessionScores {
    const dg = this.calcDomain(this.rubric.domains.dataGathering);
    const cm = this.calcDomain(this.rubric.domains.clinicalManagement);
    const is_ = this.calcDomain(this.rubric.domains.interpersonalSkills);

    return {
      dataGathering: dg,
      clinicalManagement: cm,
      interpersonalSkills: is_,
      total: Math.round((dg.earned + cm.earned + is_.earned) * 10) / 10,
    };
  }

  private calcDomain(items: RubricItem[]) {
    const earned = items.reduce((sum, item) => {
      const p = this.progress.get(item.id);
      return sum + (p?.pointsAwarded ?? 0);
    }, 0);
    const max = items.reduce((sum, item) => sum + item.weight, 0);
    return {
      earned: Math.round(earned * 10) / 10,
      max,
      percentage: max > 0 ? Math.round((earned / max) * 1000) / 10 : 0,
    };
  }

  getProgress(): Record<string, RubricItemProgress> {
    return Object.fromEntries(this.progress);
  }

  getTriggeredItemIds(): string[] {
    return Array.from(this.progress.entries())
      .filter(([, p]) => p.triggered)
      .map(([id]) => id);
  }

  getMissedRequired(): string[] {
    return this.getAllItems()
      .filter(item => item.required && !this.progress.get(item.id)?.triggered)
      .map(item => item.criterion);
  }
}
