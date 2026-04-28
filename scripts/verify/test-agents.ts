import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
dotenv.config({ path: join(process.cwd(), '.env.local') });

const root = process.cwd();
interface AgentTest { name: string; passed: boolean; duration: number; error?: string; output?: unknown; }
const tests: AgentTest[] = [];

async function runTest(name: string, fn: () => Promise<unknown>): Promise<void> {
  const start = Date.now();
  process.stdout.write(`  Testing: ${name}... `);
  try {
    const output = await fn();
    const duration = Date.now() - start;
    tests.push({ name, passed: true, duration, output });
    console.log(`✅ ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - start;
    tests.push({ name, passed: false, duration, error: error instanceof Error ? error.message : 'Unknown' });
    console.log(`❌ ${duration}ms — ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

async function main() {
  console.log('🤖 Testing AI Agents\n');

  const hasClassifier = existsSync(join(root, 'src/lib/services/ai/query-classifier.ts'));
  const hasSynthesizer = existsSync(join(root, 'src/lib/services/ai/medical-synthesizer.ts'));
  const hasGroqClient = existsSync(join(root, 'src/lib/services/ai/groq-client.ts'));

  console.log('📁 Agent files:');
  console.log(`   ${hasGroqClient ? '✅' : '❌'} groq-client.ts`);
  console.log(`   ${hasClassifier ? '✅' : '❌'} query-classifier.ts`);
  console.log(`   ${hasSynthesizer ? '✅' : '❌'} medical-synthesizer.ts`);

  // Detect additional agents
  const agentRegistry = existsSync(join(root, 'src/lib/ai/agent-registry.ts'));
  const osceRubric = existsSync(join(root, 'src/lib/osce/rubric-analyzer.ts'));
  console.log(`   ${agentRegistry ? '✅' : '❌'} agent-registry.ts`);
  console.log(`   ${osceRubric ? '✅' : '❌'} osce/rubric-analyzer.ts`);
  console.log('');

  if (!hasGroqClient) { console.log('❌ STAGE 3 FAILED: groq-client.ts is required'); process.exit(1); }

  if (hasClassifier) {
    await runTest('Classifier handles Arabic question', async () => {
      const { classifyQuery } = await import('@/lib/services/ai/query-classifier');
      const result = await classifyQuery('ما أحدث علاج لارتفاع ضغط الدم؟');
      if (!result.englishTerms?.length) throw new Error('No English terms extracted from Arabic');
      if (!result.primaryIntent) throw new Error('No primary intent');
      return { intent: result.primaryIntent, terms: result.englishTerms.slice(0, 3), specialty: result.specialty };
    });

    await runTest('Classifier identifies drug questions', async () => {
      const { classifyQuery } = await import('@/lib/services/ai/query-classifier');
      const result = await classifyQuery('What are the side effects of metformin?');
      if (!result.drugNames?.length) throw new Error('Failed to extract drug name "metformin"');
      return { drugs: result.drugNames };
    });

    await runTest('Classifier handles English — guideline question', async () => {
      const { classifyQuery } = await import('@/lib/services/ai/query-classifier');
      const result = await classifyQuery('Latest atrial fibrillation guidelines');
      if (!result.specialty) throw new Error('No specialty detected');
      if (!result.needsGuidelines) throw new Error('Failed to detect guidelines need');
      return { specialty: result.specialty, needsGuidelines: result.needsGuidelines };
    });
  }

  if (hasSynthesizer) {
    await runTest('Synthesizer generates Arabic answer with citations', async () => {
      const { synthesizeAnswer } = await import('@/lib/services/ai/medical-synthesizer');
      const mockSources = [
        { id: 't1', source: 'pubmed' as const, category: 'research' as const, title: 'Hypertension management 2024 guidelines', abstract: 'ACE inhibitors recommended as first-line therapy. Lifestyle modifications essential.', authors: ['Smith J'], year: 2024, journal: 'NEJM', doi: '10.1056/test', url: 'https://pubmed.ncbi.nlm.nih.gov/t1', isOpenAccess: false, studyType: 'guideline' as const, language: 'en' as const, qualityScore: 9.0 },
        { id: 't2', source: 'openalex' as const, category: 'research' as const, title: 'DASH diet reduces blood pressure meta-analysis', abstract: 'DASH diet reduces systolic BP by 11 mmHg across 50 RCTs.', authors: ['Brown K'], year: 2023, journal: 'Lancet', doi: '10.1016/test', url: 'https://example.org/t2', isOpenAccess: true, studyType: 'meta-analysis' as const, language: 'en' as const, qualityScore: 8.5, citationCount: 250 },
      ];
      const result = await synthesizeAnswer('ما هو أفضل علاج لارتفاع ضغط الدم؟', mockSources);
      if (!result.answer || result.answer.length < 50) throw new Error(`Answer too short: ${result.answer?.length || 0} chars`);
      if (!/[؀-ۿ]/.test(result.answer)) throw new Error('Answer not in Arabic');
      const citations = result.answer.match(/\[\d+\]/g);
      if (!citations?.length) throw new Error('No [N] citations found');
      if (!result.disclaimer) throw new Error('Missing disclaimer');
      if (!['high','medium','low'].includes(result.confidence)) throw new Error(`Invalid confidence: ${result.confidence}`);
      return { answerLength: result.answer.length, citationsFound: citations.length, confidence: result.confidence, sample: result.answer.substring(0, 120) + '...' };
    });

    await runTest('Synthesizer handles empty sources gracefully', async () => {
      const { synthesizeAnswer } = await import('@/lib/services/ai/medical-synthesizer');
      const result = await synthesizeAnswer('Test question', []);
      if (!result.answer) throw new Error('No answer for empty sources');
      if (result.confidence !== 'low') throw new Error(`Expected low confidence, got: ${result.confidence}`);
      return { confidence: result.confidence };
    });
  }

  // Agent registry — existence check only (avoid loading heavy OSCE dataset in test runner)
  if (agentRegistry) {
    await runTest('Agent registry file exists', async () => {
      return { path: 'src/lib/ai/agent-registry.ts', status: 'present' };
    });
  }

  console.log('\n' + '═'.repeat(70));
  const passed = tests.filter(t => t.passed).length;
  const failed = tests.filter(t => !t.passed).length;
  console.log(`\n✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  if (failed > 0) {
    tests.filter(t => !t.passed).forEach(t => console.log(`  ❌ ${t.name}: ${t.error}`));
    process.exit(1);
  }
  console.log('\n✅ STAGE 3 PASSED\n');
}

main().catch(e => { console.error('Crashed:', e); process.exit(1); });
