import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

interface DiscoveryReport {
  aiServices: string[];
  agents: string[];
  sources: string[];
  apiRoutes: string[];
  repositories: string[];
  schemas: string[];
  hasGroqClient: boolean;
  hasOpenAIClient: boolean;
  hasAnthropicClient: boolean;
  envVarsFound: string[];
  totalFiles: number;
}

const root = process.cwd();
const report: DiscoveryReport = {
  aiServices: [], agents: [], sources: [], apiRoutes: [],
  repositories: [], schemas: [], hasGroqClient: false,
  hasOpenAIClient: false, hasAnthropicClient: false,
  envVarsFound: [], totalFiles: 0,
};

function walk(dir: string, callback: (path: string) => void): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, callback);
    else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) callback(full);
  }
}

console.log('🔍 Discovering project structure...\n');

walk(join(root, 'src', 'lib'), (file) => {
  report.totalFiles++;
  const rel = relative(root, file).replace(/\\/g, '/');
  const content = readFileSync(file, 'utf-8');
  if (rel.includes('services/ai/')) report.aiServices.push(rel);
  if (rel.includes('agent') || rel.includes('professor') || rel.includes('specialist') || rel.toLowerCase().includes('osce')) report.agents.push(rel);
  if (rel.includes('services/medical-sources/sources/')) report.sources.push(rel);
  if (rel.includes('repositories/')) report.repositories.push(rel);
  if (rel.includes('schemas/')) report.schemas.push(rel);
  if (content.includes('api.groq.com') || content.includes('groq-sdk') || content.includes('GROQ_API_KEY')) report.hasGroqClient = true;
  if (content.includes('api.openai.com')) report.hasOpenAIClient = true;
  if (content.includes('api.anthropic.com')) report.hasAnthropicClient = true;
});

walk(join(root, 'src', 'app'), (file) => {
  report.totalFiles++;
  const rel = relative(root, file).replace(/\\/g, '/');
  if (rel.endsWith('route.ts')) report.apiRoutes.push(rel);
});

if (existsSync(join(root, '.env.local'))) {
  const envContent = readFileSync(join(root, '.env.local'), 'utf-8');
  for (const v of ['GROQ_API_KEY','OPENAI_API_KEY','ANTHROPIC_API_KEY','XAI_API_KEY','PUBMED_API_KEY','OPENALEX_EMAIL','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']) {
    if (new RegExp(`^${v}=.+`, 'm').test(envContent)) report.envVarsFound.push(v);
  }
}

console.log('═'.repeat(70));
console.log('📊 PROJECT DISCOVERY REPORT');
console.log('═'.repeat(70));
console.log(`\nTotal TypeScript files scanned: ${report.totalFiles}\n`);

console.log('🤖 AI Services:');
report.aiServices.length === 0 ? console.log('   ⚠️  None found') : report.aiServices.forEach(s => console.log(`   ✅ ${s}`));

console.log('\n🎓 Agents/Professors/OSCE:');
report.agents.length === 0 ? console.log('   ℹ️  None detected') : report.agents.forEach(a => console.log(`   ✅ ${a}`));

console.log('\n🔬 Medical Sources:');
report.sources.length === 0 ? console.log('   ❌ None found!') : report.sources.forEach(s => console.log(`   ✅ ${s}`));

console.log('\n🗄️  Repositories:');
report.repositories.length === 0 ? console.log('   ⚠️  None found') : report.repositories.forEach(r => console.log(`   ✅ ${r}`));

console.log('\n🛣️  API Routes:');
report.apiRoutes.forEach(r => console.log(`   ✅ ${r}`));

console.log('\n🔌 AI Providers Detected:');
console.log(`   Groq:      ${report.hasGroqClient ? '✅' : '❌'}`);
console.log(`   OpenAI:    ${report.hasOpenAIClient ? '✅' : '❌'}`);
console.log(`   Anthropic: ${report.hasAnthropicClient ? '✅' : '❌'}`);

console.log('\n🔑 Environment Variables:');
report.envVarsFound.forEach(v => console.log(`   ✅ ${v}`));

console.log('\n' + '═'.repeat(70));

writeFileSync(join(root, 'scripts/verify/.discovery.json'), JSON.stringify(report, null, 2));
console.log('\n💾 Report saved to scripts/verify/.discovery.json\n');
