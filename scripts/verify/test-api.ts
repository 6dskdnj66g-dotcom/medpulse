import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

interface ApiTestResult { name: string; passed: boolean; statusCode: number; duration: number; error?: string; }
const results: ApiTestResult[] = [];
const BASE = 'http://localhost:3000';

async function testEndpoint(name: string, path: string, body: unknown, expectedStatus: number | number[]): Promise<void> {
  const start = Date.now();
  process.stdout.write(`  ${name}... `);
  try {
    const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    const duration = Date.now() - start;
    const ok = expected.includes(res.status);
    results.push({ name, passed: ok, statusCode: res.status, duration });
    if (ok) console.log(`✅ HTTP ${res.status} in ${duration}ms`);
    else {
      const text = (await res.text()).substring(0, 200);
      console.log(`❌ Expected ${expected.join('|')}, got HTTP ${res.status}: ${text}`);
    }
  } catch (error) {
    const duration = Date.now() - start;
    const msg = error instanceof Error ? error.message : 'Unknown';
    results.push({ name, passed: false, statusCode: 0, duration, error: msg });
    console.log(`❌ ${msg}`);
  }
}

async function checkServerRunning(): Promise<boolean> {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(3000) });
    return res.status < 600;
  } catch { return false; }
}

async function main() {
  console.log('🌐 Testing API Endpoints\n');

  const running = await checkServerRunning();
  if (!running) {
    console.log('⚠️  Dev server not running at http://localhost:3000');
    console.log('   Start it with: npm run dev');
    console.log('\n⏭️  STAGE 5 SKIPPED (server not running)\n');
    process.exit(0);
  }
  console.log('✅ Dev server is running\n');

  // Test medical-query (primary endpoint)
  await testEndpoint('Valid Arabic query → /api/ai/medical-query', '/api/ai/medical-query',
    { question: 'ما هو علاج ارتفاع ضغط الدم؟' }, 200);

  await testEndpoint('Empty question → /api/ai/medical-query (should reject)', '/api/ai/medical-query',
    { question: '' }, [400, 422]);

  await testEndpoint('Valid English query → /api/ai/medical-query', '/api/ai/medical-query',
    { question: 'What is atrial fibrillation?' }, 200);

  // Test legacy endpoint if it exists
  await testEndpoint('Valid query → /api/medical-query', '/api/medical-query',
    { question: 'hypertension treatment' }, [200, 400, 404, 405]);

  // Test professor endpoint
  await testEndpoint('POST /api/ai/professor (should respond)', '/api/ai/professor',
    { question: 'explain hypertension pathophysiology', specialty: 'cardiology' }, [200, 400, 422]);

  console.log('\n' + '═'.repeat(70));
  console.log('API ENDPOINT SUMMARY');
  console.log('═'.repeat(70));
  const coreTests = results.filter(r => r.name.includes('medical-query'));
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log('\n⚡ Response times:');
  results.forEach(r => {
    const icon = r.duration < 30000 ? '✅' : '⚠️';
    console.log(`  ${icon} ${r.name}: ${r.duration}ms`);
  });

  const criticalFailed = coreTests.filter(r => !r.passed).length;
  if (criticalFailed > 0) {
    console.log('\n❌ STAGE 5 FAILED: Core API endpoint failures');
    process.exit(1);
  }
  console.log('\n✅ STAGE 5 PASSED\n');
}

main().catch((error) => { console.error('API test crashed:', error); process.exit(1); });
