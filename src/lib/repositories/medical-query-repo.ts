import { createSupabaseAdmin as createClient } from '@/core/database/supabase';
import {
  MedicalSource,
  QueryClassification,
  SynthesizedAnswer,
  Confidence,
} from '@/lib/services/medical-sources/types';

interface CachedQuery {
  id: string;
  question: string;
  answer: string;
  sources: MedicalSource[];
  classification?: QueryClassification;
  confidence: Confidence;
  similarity?: number;
}

export const medicalQueryRepo = {
  /**
   * Find similar cached queries using vector similarity.
   * Note: For now, uses simple text match. Upgrade to embeddings later.
   */
  async findSimilar(
    question: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    threshold: number = 0.85
  ): Promise<CachedQuery | null> {
    const supabase = await createClient();

    // Simple exact match for now (upgrade to embeddings in Phase 6)
    const { data, error } = await supabase
      .from('medical_queries')
      .select('*')
      .ilike('question_text', question)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;

    const row = data[0];
    return {
      id: row.id,
      question: row.question_text,
      answer: row.answer_text,
      sources: row.sources_json as MedicalSource[],
      classification: row.classification_json as QueryClassification | undefined,
      confidence: row.confidence as Confidence,
    };
  },

  /**
   * Save a new query to cache.
   */
  async save(
    question: string,
    result: SynthesizedAnswer,
    userId?: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from('medical_queries').insert({
      question_text: question,
      answer_text: result.answer,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sources_json: result.sources as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      classification_json: result.classification as any,
      confidence: result.confidence,
      cost_usd: result.cost,
      user_id: userId || null,
    });

    if (error) {
      console.error('[medical-query-repo] Save failed:', error);
      // Non-fatal — don't throw, just log
    }
  },

  /**
   * Increment hit count for popular questions tracking.
   */
  async incrementHitCount(queryId: string): Promise<void> {
    const supabase = await createClient();
    await supabase.rpc('increment_hit_count', { query_id: queryId });
  },
};
