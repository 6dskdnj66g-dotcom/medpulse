import { medicalQueryRepo } from '@/lib/repositories/medical-query-repo';
import { SynthesizedAnswer } from '../medical-sources/types';

const SIMILARITY_THRESHOLD = parseFloat(
  process.env.CACHE_SIMILARITY_THRESHOLD || '0.85'
);

export const queryCache = {
  async get(question: string): Promise<SynthesizedAnswer | null> {
    const cached = await medicalQueryRepo.findSimilar(
      question,
      SIMILARITY_THRESHOLD
    );

    if (!cached) return null;

    // Update hit count async (don't wait)
    void medicalQueryRepo.incrementHitCount(cached.id);

    return {
      answer: cached.answer,
      sources: cached.sources,
      classification: cached.classification,
      disclaimer:
        'هذه المعلومات لأغراض تعليمية فقط، وليست بديلاً عن الاستشارة الطبية المتخصصة.',
      confidence: cached.confidence,
      cached: true,
      cost: 0,
    };
  },

  async set(
    question: string,
    result: SynthesizedAnswer,
    userId?: string
  ): Promise<void> {
    await medicalQueryRepo.save(question, result, userId);
  },
};
