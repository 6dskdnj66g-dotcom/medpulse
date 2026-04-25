// SM-2 spaced repetition algorithm (SuperMemo 2)
// Quality ratings: 0=blackout, 1=wrong, 2=wrong but familiar, 3=correct (hard), 4=correct, 5=perfect

export interface SRSCard {
  id: string;
  front: string;
  back: string;
  ease: number;        // starts at 2.5
  interval: number;   // days until next review
  repetitions: number;
  nextReview: Date;
  source: { type: "usmle" | "encyclopedia" | "manual"; id: string };
  tags?: string[];
  createdAt: Date;
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export function calculateNextReview(card: SRSCard, quality: Quality): SRSCard {
  let { ease, interval, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
  }

  ease = Math.max(
    1.3,
    ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { ...card, ease, interval, repetitions, nextReview };
}

export function isDue(card: SRSCard): boolean {
  return new Date() >= new Date(card.nextReview);
}

export function getDueCards(cards: SRSCard[]): SRSCard[] {
  return cards.filter(isDue).sort(
    (a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
  );
}

export function createCard(
  front: string,
  back: string,
  source: SRSCard["source"],
  tags?: string[]
): SRSCard {
  return {
    id: `srs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    front,
    back,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date(),
    source,
    tags,
    createdAt: new Date(),
  };
}

export function getRetentionStats(cards: SRSCard[]) {
  const total = cards.length;
  const due = cards.filter(isDue).length;
  const mature = cards.filter((c) => c.interval >= 21).length;
  const young = cards.filter((c) => c.interval > 0 && c.interval < 21).length;
  const newCards = cards.filter((c) => c.repetitions === 0).length;
  return { total, due, mature, young, newCards };
}
