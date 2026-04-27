import { NextRequest, NextResponse } from 'next/server';
import { MedicalQueryRequestSchema } from '@/lib/schemas/medical-query-schema';
import { classifyQuery } from '@/lib/services/ai/query-classifier';
import { aggregateSources } from '@/lib/services/medical-sources/aggregator';
import { synthesizeAnswer } from '@/lib/services/ai/medical-synthesizer';
import { queryCache } from '@/lib/services/cache/query-cache';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import { AppError, ValidationError } from '@/lib/utils/errors';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const isDev = process.env.NODE_ENV === 'development';

  try {
    // 1. Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    await checkRateLimit(ip);

    // 2. Validate input
    const body = await req.json();
    const parsed = MedicalQueryRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('مدخلات غير صحيحة', parsed.error.flatten());
    }

    const { question, forceRefresh } = parsed.data;

    // 3. Check cache
    if (!forceRefresh) {
      const cached = await queryCache.get(question);
      if (cached) {
        return NextResponse.json({
          ...cached,
          responseTimeMs: Date.now() - startTime,
        });
      }
    }

    // 4. Classify the query
    const classification = await classifyQuery(question);

    // 5. Aggregate sources from multiple medical APIs
    const sources = await aggregateSources(classification, { maxTotal: 10 });

    // 6. Synthesize Arabic answer with citations
    const result = await synthesizeAnswer(question, sources);
    result.classification = classification;

    // 7. Cache for future similar questions (async, don't wait)
    void queryCache.set(question, result);

    return NextResponse.json({
      ...result,
      responseTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('[medical-query] Error:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          ...(isDev && error.details ? { _debug: error.details } : {}),
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء معالجة طلبك',
        code: 'INTERNAL_ERROR',
        ...(isDev && error instanceof Error
          ? { _debug: error.message }
          : {}),
      },
      { status: 500 }
    );
  }
}
