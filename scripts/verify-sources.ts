import { searchPubMed } from '@/lib/services/medical-sources/sources/pubmed';
import { searchOpenAlex } from '@/lib/services/medical-sources/sources/openalex';
import { searchEuropePMC } from '@/lib/services/medical-sources/sources/europepmc';
import { searchClinicalTrials } from '@/lib/services/medical-sources/sources/clinicaltrials';
import { searchStatPearls } from '@/lib/services/medical-sources/sources/statpearls';
import { searchDrug } from '@/lib/services/medical-sources/sources/rxnorm';
import { searchFDADrugLabel } from '@/lib/services/medical-sources/sources/openfda';
import { MedicalSource } from '@/lib/services/medical-sources/types';

interface TestResult {
  source: string;
  status: 'pass' | 'fail' | 'warn';
  count: number;
  duration: number;
  error?: string;
  warnings?: string[];
}

const results: TestResult[] = [];

function validateSource(source: MedicalSource, sourceName: string): string[] {
  const warnings: string[] = [];
  if (!source.id) warnings.push(`${sourceName}: missing id`);
  if (!source.title || source.title === 'No title') warnings.push(`${sourceName}: missing title`);
  if (!source.url || !source.url.startsWith('http')) warnings.push(`${sourceName}: invalid url`);
  if (source.year < 2000 || source.year > new Date().getFullYear() + 1)
    warnings.push(`${sourceName}: invalid year (${source.year})`);
  if (typeof source.isOpenAccess !== 'boolean') warnings.push(`${sourceName}: isOpenAccess must be boolean`);
  if (!source.studyType) warnings.push(`${sourceName}: missing studyType`);
  if (!source.category) warnings.push(`${sourceName}: missing category`);
  return warnings;
}

async function testSource(name: string, fn: () => Promise<MedicalSource[]>): Promise<void> {
  const start = Date.now();
  try {
    const data = await fn();
    const duration = Date.now() - start;
    if (data.length === 0) {
      results.push({ source: name, status: 'warn', count: 0, duration, warnings: ['No results returned'] });
      return;
    }
    const allWarnings: string[] = [];
    for (const source of data) allWarnings.push(...validateSource(source, name));
    results.push({
      source: name,
      status: allWarnings.length === 0 ? 'pass' : 'warn',
      count: data.length,
      duration,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
    });
  } catch (error) {
    results.push({
      source: name,
      status: 'fail',
      count: 0,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function main() {
  console.log('Testing all medical sources...\n');

  const tests: Array<[string, () => Promise<MedicalSource[]>]> = [
    ['PubMed', () => searchPubMed('hypertension treatment', { maxResults: 2 })],
    ['OpenAlex', () => searchOpenAlex('hypertension treatment', { maxResults: 2 })],
    ['EuropePMC', () => searchEuropePMC('hypertension', { maxResults: 2 })],
    ['ClinicalTrials', () => searchClinicalTrials('diabetes', { maxResults: 2 })],
    ['StatPearls', () => searchStatPearls('hypertension', { maxResults: 2 })],
    ['RxNorm', () => searchDrug('aspirin')],
    ['OpenFDA', () => searchFDADrugLabel('aspirin')],
  ];

  for (const [name, fn] of tests) {
    process.stdout.write(`Testing ${name}... `);
    await testSource(name, fn);
    const result = results[results.length - 1];
    if (result.status === 'pass') console.log(`✅ ${result.count} results in ${result.duration}ms`);
    else if (result.status === 'warn') console.log(`⚠️  ${result.count} results in ${result.duration}ms (${result.warnings?.length} warnings)`);
    else console.log(`❌ FAILED: ${result.error}`);
  }

  console.log('\n' + '═'.repeat(80));
  const passed = results.filter((r) => r.status === 'pass').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`⚠️  Warnings: ${warned}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  console.log('\n⚡ Performance:');
  for (const r of results) {
    const status = r.duration < 3000 ? '✅' : r.duration < 8000 ? '⚠️' : '❌';
    console.log(`  ${status} ${r.source}: ${r.duration}ms`);
  }

  const withWarnings = results.filter((r) => r.warnings && r.warnings.length > 0);
  if (withWarnings.length > 0) {
    console.log('\n📋 Detailed Warnings:');
    for (const r of withWarnings) {
      console.log(`\n  ${r.source}:`);
      for (const w of (r.warnings ?? []).slice(0, 5)) console.log(`    - ${w}`);
    }
  }

  if (failed > 0) { console.log('\n❌ STAGE 6 FAILED: Some sources are not working'); process.exit(1); }
  if (warned > 3) console.log('\n⚠️  STAGE 6 PASSED WITH WARNINGS');
  else console.log('\n✅ STAGE 6 PASSED');
}

main().catch((e) => { console.error('Verification crashed:', e); process.exit(1); });
