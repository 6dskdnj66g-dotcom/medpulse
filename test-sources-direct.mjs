import { searchPubMed } from './src/lib/services/medical-sources/sources/pubmed.js';
import { searchOpenAlex } from './src/lib/services/medical-sources/sources/openalex.js';

async function test() {
  console.log('Testing PubMed...');
  const pm = await searchPubMed('hypertension treatment', { maxResults: 2 });
  console.log(`✅ PubMed: ${pm.length} results`);

  console.log('\nTesting OpenAlex...');
  const oa = await searchOpenAlex('hypertension treatment', { maxResults: 2 });
  console.log(`✅ OpenAlex: ${oa.length} results`);
}

test().catch(console.error);