const { classifyQuery } = require('./src/lib/services/ai/query-classifier.ts');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' }); // Make sure we have the GROK API KEY

async function test() {
  console.log('Testing Classifier...');
  const result = await classifyQuery('ما أحدث علاج لارتفاع ضغط الدم؟');
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.dir);
