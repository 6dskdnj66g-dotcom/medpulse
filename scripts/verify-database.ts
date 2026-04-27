import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) { console.error('❌ Supabase credentials missing'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

interface SchemaCheck { table: string; status: 'pass' | 'fail'; error?: string; }
const results: SchemaCheck[] = [];

async function checkTable(tableName: string): Promise<void> {
  try {
    const { error } = await supabase.from(tableName).select('*').limit(1);
    if (error) results.push({ table: tableName, status: 'fail', error: error.message });
    else results.push({ table: tableName, status: 'pass' });
  } catch (error) {
    results.push({ table: tableName, status: 'fail', error: error instanceof Error ? error.message : 'Unknown' });
  }
}

async function checkPgVector(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('match_medical_queries', {
      query_embedding: new Array(1536).fill(0),
      similarity_threshold: 0.99,
      match_count: 1,
    });
    if (error && error.message.includes('does not exist')) return false;
    return true;
  } catch { return false; }
}

async function main() {
  console.log('Verifying Supabase schema...\n');
  await checkTable('medical_queries');
  await checkTable('rate_limits');
  for (const r of results) {
    if (r.status === 'pass') console.log(`✅ Table '${r.table}' exists`);
    else { console.log(`❌ Table '${r.table}' missing or inaccessible`); console.log(`   Error: ${r.error}`); }
  }
  console.log('\nChecking pgvector function...');
  const vectorOk = await checkPgVector();
  if (vectorOk) console.log('✅ match_medical_queries function exists');
  else console.log('⚠️  match_medical_queries function not found (vector search disabled)');
  const failed = results.filter((r) => r.status === 'fail').length;
  console.log('\n' + '═'.repeat(60));
  if (failed > 0) { console.log('❌ STAGE 8 FAILED: Database schema incomplete'); process.exit(1); }
  console.log('✅ STAGE 8 PASSED');
}

main().catch((e) => { console.error('Database verification crashed:', e); process.exit(1); });
