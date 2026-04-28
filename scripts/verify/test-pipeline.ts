import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();

const TEST_QUERIES = [
  {
    name: 'Arabic — Disease question',
    question: 'ما أحدث علاج لارتفاع ضغط الدم؟',
    expectations: { minSources: 3, requiresArabic: true, requiresCitations: true, maxDuration: 45000 },
  },
  {
    name: 'English — Drug question',
    question: 'What are the side effects of metformin?',
    expectations: { minSources: 2, requiresArabic: true, requiresCitations: true, maxDuration: 45000 },
  },
  {
    name: 'Mixed — Comparative question',
    question: 'الفرق بين apixaban و warfarin',
    expectations: { minSources: 2, requiresArabic: true, requiresCitations: true, maxDuration: 45000 },
  },
];

interface PipelineResult {
  query: string; passed: boolean; duration: number; sourcesCount: number;
  hasArabic: boolean; citationsCount: number; confidence: string; cost: number;
  error?: string; sample?: string;
}
const results: PipelineResult[] = [];

async function runPipeline(query: string) {
  const aggregatorPath = join(root, 'src/lib/services/medical-sources/aggregator.ts');
  const classifierPath = join(root, 'src/lib/services/ai/query-classifier.ts');
  const synthesizerPath = join(root, 'src/lib/services/ai/medical-synthesizer.ts');

  if (!existsSync(aggregatorPath) || !existsSync(classifierPath) || !existsSync(synthesizerPath)) {
    throw new Error('Required pipeline components missing');
  }

  const { classifyQuery } = await import('../../src/lib/services/ai/query-classifier');
  const { aggregateSources } = await import('../../src/lib/services/medical-sources/aggregator');
  const { synthesizeAnswer } = await import('../../src/lib/services/ai/medical-synthesizer');

  const classification = await classifyQuery(query);
  const sources = await aggregateSources(classification, { maxTotal: 8 });
  const result = await synthesizeAnswer(query, sources);
  return { classification, sources, result };
}

async function testQuery(config: typeof TEST_QUERIES[number]): Promise<void> {
  console.log(`\n📝 ${config.name}`);
  console.log(`   Q: "${config.question}"`);
  const start = Date.now();
  const result: PipelineResult = {
    query: config.question, passed: false, duration: 0,
    sourcesCount: 0, hasArabic: false, citationsCount: 0, confidence: 'unknown', cost: 0,
  };
  try {
    const pipeline = await runPipeline(config.question);
    result.duration = Date.now() - start;
    result.sourcesCount = pipeline.sources.length;
    result.hasArabic = /[؀-ۿ]/.test(pipeline.result.answer);
    result.citationsCount = (pipeline.result.answer.match(/\[\d+\]/g) || []).length;
    result.confidence = pipeline.result.confidence;
    result.cost = pipeline.result.cost ?? 0;
    result.sample = pipeline.result.answer.substring(0, 200);

    const errors: string[] = [];
    if (result.sourcesCount < config.expectations.minSources)
      errors.push(`Expected ${config.expectations.minSources}+ sources, got ${result.sourcesCount}`);
    if (config.expectations.requiresArabic && !result.hasArabic)
      errors.push('Answer not in Arabic');
    if (config.expectations.requiresCitations && result.citationsCount === 0)
      errors.push('No citations found');
    if (result.duration > config.expectations.maxDuration)
      errors.push(`Too slow: ${result.duration}ms > ${config.expectations.maxDuration}ms`);
    if (errors.length > 0) throw new Error(errors.join('; '));

    result.passed = true;
    console.log(`   ✅ ${result.duration}ms | ${result.sourcesCount} sources | ${result.citationsCount} citations | ${result.confidence} confidence`);
    console.log(`   Preview: ${result.sample?.substring(0, 120)}...`);
  } catch (error) {
    result.duration = Date.now() - start;
    result.error = error instanceof Error ? error.message : 'Unknown';
    console.log(`   ❌ ${result.error}`);
  }
  results.push(result);
}

async function main() {
  console.log('🔄 Testing Hybrid Pipeline (End-to-End)\n');
  console.log(`Running ${TEST_QUERIES.length} test queries...`);
  for (const config of TEST_QUERIES) await testQuery(config);

  console.log('\n' + '═'.repeat(70));
  console.log('PIPELINE INTEGRATION SUMMARY');
  console.log('═'.repeat(70));
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  const avgDuration = results.reduce((s, r) => s + r.duration, 0) / results.length;
  const avgSources = results.reduce((s, r) => s + r.sourcesCount, 0) / results.length;
  console.log('\n📊 Statistics:');
  console.log(`   Avg duration: ${avgDuration.toFixed(0)}ms`);
  console.log(`   Avg sources:  ${avgSources.toFixed(1)}`);
  if (failed > 0) {
    results.filter((r) => !r.passed).forEach((r) => console.log(`\n   ❌ "${r.query}"\n   Error: ${r.error}`));
    process.exit(1);
  }
  console.log('\n✅ STAGE 4 PASSED\n');
}

main().catch((error) => { console.error('Pipeline test crashed:', error); process.exit(1); });
