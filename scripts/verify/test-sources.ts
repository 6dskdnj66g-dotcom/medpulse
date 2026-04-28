import * as dotenv from 'dotenv';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
dotenv.config({ path: join(process.cwd(), '.env.local') });

const root = process.cwd();
interface SourceTestResult { source: string; available: boolean; passed: boolean; count: number; duration: number; error?: string; warnings: string[]; }
const results: SourceTestResult[] = [];

function validateSource(s: Record<string, unknown>, name: string): string[] {
  const w: string[] = [];
  if (!s.id) w.push('missing id');
  if (!s.title || s.title === 'No title') w.push('missing/default title');
  if (!s.url || !(s.url as string).startsWith('http')) w.push('invalid url');
  const y = s.year as number;
  if (y !== undefined && (y < 1900 || y > new Date().getFullYear() + 2)) w.push(`invalid year: ${y}`);
  if (typeof s.isOpenAccess !== 'boolean') w.push('isOpenAccess not boolean');
  if (!s.studyType) w.push('missing studyType');
  return w;
}

async function runSource<T extends object>(name: string, file: string, fn: () => Promise<T[]>) {
  const available = existsSync(join(root, file));
  if (!available) {
    console.log(`  ${name}: ⏭️  SKIPPED`);
    results.push({ source: name, available: false, passed: false, count: 0, duration: 0, warnings: [] });
    return;
  }
  const start = Date.now();
  try {
    const data = await fn();
    const duration = Date.now() - start;
    const warnings: string[] = [];
    if (!Array.isArray(data)) throw new Error('Not an array');
    if (data.length === 0) warnings.push('Empty results');
    else data.slice(0, 2).forEach(item => warnings.push(...validateSource(item as Record<string, unknown>, name)));
    const passed = data.length > 0;
    console.log(`  ${name}: ${passed && warnings.length === 0 ? '✅' : passed ? '⚠️' : '⚠️'} ${data.length} results in ${duration}ms${warnings.length > 0 ? ` (${warnings.length} warnings)` : ''}`);
    results.push({ source: name, available: true, passed, count: data.length, duration, warnings });
  } catch (error) {
    const duration = Date.now() - start;
    const msg = error instanceof Error ? error.message : 'Unknown';
    console.log(`  ${name}: ❌ ${msg}`);
    results.push({ source: name, available: true, passed: false, count: 0, duration, error: msg, warnings: [] });
  }
}

async function main() {
  console.log('🔬 Testing Medical Source Adapters\n');

  await runSource('PubMed', 'src/lib/services/medical-sources/sources/pubmed.ts', async () => {
    const m = await import('@/lib/services/medical-sources/sources/pubmed');
    return m.searchPubMed('hypertension treatment', { maxResults: 2 });
  });
  await runSource('OpenAlex', 'src/lib/services/medical-sources/sources/openalex.ts', async () => {
    const m = await import('@/lib/services/medical-sources/sources/openalex');
    return m.searchOpenAlex('diabetes type 2', { maxResults: 2 });
  });
  await runSource('EuropePMC', 'src/lib/services/medical-sources/sources/europepmc.ts', async () => {
    const m = await import('@/lib/services/medical-sources/sources/europepmc');
    return m.searchEuropePMC('covid vaccine', { maxResults: 2 });
  });
  await runSource('ClinicalTrials', 'src/lib/services/medical-sources/sources/clinicaltrials.ts', async () => {
    const m = await import('@/lib/services/medical-sources/sources/clinicaltrials');
    return m.searchClinicalTrials('cancer immunotherapy', { maxResults: 2 });
  });
  await runSource('StatPearls', 'src/lib/services/medical-sources/sources/statpearls.ts', async () => {
    const m = await import('@/lib/services/medical-sources/sources/statpearls');
    return m.searchStatPearls('asthma', { maxResults: 2 });
  });
  await runSource('RxNorm', 'src/lib/services/medical-sources/sources/rxnorm.ts', async () => {
    const m = await import('@/lib/services/medical-sources/sources/rxnorm');
    return m.searchDrug('metformin');
  });
  await runSource('OpenFDA', 'src/lib/services/medical-sources/sources/openfda.ts', async () => {
    const m = await import('@/lib/services/medical-sources/sources/openfda');
    return m.searchFDADrugLabel('aspirin');
  });

  console.log('\n' + '═'.repeat(70));
  const available = results.filter(r => r.available);
  const passed = available.filter(r => r.passed);
  const errored = available.filter(r => !!r.error);
  console.log(`\nAvailable: ${available.length}/7 | ✅ Working: ${passed.length} | ❌ Errored: ${errored.length}`);
  console.log('\n⚡ Performance:');
  for (const r of available) console.log(`  ${r.duration < 3000 ? '✅' : r.duration < 8000 ? '⚠️' : '❌'} ${r.source}: ${r.duration}ms`);

  const withWarnings = results.filter(r => r.warnings.length > 0);
  if (withWarnings.length > 0) {
    console.log('\n📋 Warnings:');
    for (const r of withWarnings) { console.log(`\n  ${r.source}:`); r.warnings.slice(0, 3).forEach(w => console.log(`    - ${w}`)); }
  }

  writeFileSync(join(root, 'scripts/verify/.sources-report.json'), JSON.stringify(results, null, 2));

  if (errored.length > 0) { console.log('\n❌ STAGE 2 FAILED'); process.exit(1); }
  if (passed.length < 3) { console.log('\n⚠️  STAGE 2 WARNING: < 3 sources working'); process.exit(1); }
  console.log('\n✅ STAGE 2 PASSED\n');
}

main().catch(e => { console.error('Crashed:', e); process.exit(1); });
