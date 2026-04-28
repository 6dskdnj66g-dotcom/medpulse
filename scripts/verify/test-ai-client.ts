import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

interface TestResult { name: string; passed: boolean; duration: number; error?: string; details?: Record<string, unknown>; }
const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void | Record<string, unknown>>): Promise<void> {
  const start = Date.now();
  process.stdout.write(`  Testing: ${name}... `);
  try {
    const details = await fn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, duration, details: details || undefined });
    console.log(`✅ ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - start;
    results.push({ name, passed: false, duration, error: error instanceof Error ? error.message : 'Unknown' });
    console.log(`❌ ${duration}ms — ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

async function main() {
  console.log('🤖 Testing AI Client (Groq)\n');

  await test('GROQ_API_KEY is set', async () => {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not found');
    if (!process.env.GROQ_API_KEY.startsWith('gsk_')) throw new Error('Key format invalid (must start with gsk_)');
    return { keyPrefix: process.env.GROQ_API_KEY.substring(0, 7) + '...' };
  });

  await test('Groq API is reachable', async () => {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json() as { data: unknown[] };
    return { modelsAvailable: data.data?.length || 0 };
  });

  await test('Basic completion (llama-3.1-8b-instant)', async () => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: 'Reply with exactly: TEST_OK' }], temperature: 0, max_tokens: 10 }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Completion failed: ${res.status}`);
    const data = await res.json() as { model: string; choices: { message: { content: string } }[]; usage: { prompt_tokens: number; completion_tokens: number } };
    const content = data.choices?.[0]?.message?.content || '';
    if (!content.includes('TEST_OK')) throw new Error(`Unexpected response: ${content.substring(0, 50)}`);
    return { model: data.model, promptTokens: data.usage?.prompt_tokens, completionTokens: data.usage?.completion_tokens };
  });

  await test('Arabic generation (llama-3.3-70b-versatile)', async () => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: 'You are a medical assistant. Respond ONLY in Arabic.' }, { role: 'user', content: 'ما هو ارتفاع ضغط الدم في جملة واحدة؟' }],
        temperature: 0.1, max_tokens: 100,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json() as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content || '';
    if (!/[؀-ۿ]/.test(content)) throw new Error(`Response not in Arabic: ${content.substring(0, 100)}`);
    return { sample: content.substring(0, 80), length: content.length };
  });

  await test('JSON response format works', async () => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: 'Return JSON: {"valid": true}' }, { role: 'user', content: 'test' }],
        response_format: { type: 'json_object' }, temperature: 0, max_tokens: 50,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json() as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content || '';
    try { return { parsed: JSON.parse(content) }; } catch { throw new Error(`Invalid JSON: ${content}`); }
  });

  console.log('\n' + '═'.repeat(70));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  if (failed > 0) {
    results.filter(r => !r.passed).forEach(r => console.log(`  ❌ ${r.name}: ${r.error}`));
    process.exit(1);
  }
  console.log('\n✅ STAGE 1 PASSED\n');
}

main().catch(e => { console.error('Crashed:', e); process.exit(1); });
