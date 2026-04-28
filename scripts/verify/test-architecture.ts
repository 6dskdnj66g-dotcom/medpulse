import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

interface Violation { file: string; line: number; rule: string; context: string; }
const violations: Violation[] = [];
const root = process.cwd();

function walk(dir: string, fn: (path: string) => void) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const full = join(dir, entry);
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) walk(full, fn);
    else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) fn(full);
  }
}

function check(file: string) {
  const rel = relative(root, file).replace(/\\/g, '/');
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  // Rule 1: Only groq-client.ts can call api.groq.com directly
  const isGroqClient = rel.endsWith('groq-client.ts');
  if (!isGroqClient) {
    lines.forEach((line, i) => {
      if ((line.includes('api.groq.com') || (line.includes('GROQ_API_KEY') && line.includes('fetch')))
        && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        violations.push({ file: rel, line: i + 1, rule: 'Only groq-client.ts can call Groq API directly', context: line.trim().substring(0, 80) });
      }
    });
  }

  // Rule 2: No direct AI API calls outside lib/services/ai/ or lib/ai/
  const isAiService = rel.includes('src/lib/services/ai/') || rel.includes('src/lib/ai/');
  if (!isAiService) {
    lines.forEach((line, i) => {
      for (const pattern of ['api.openai.com', 'api.anthropic.com', 'api.x.ai']) {
        if (line.includes(pattern) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          violations.push({ file: rel, line: i + 1, rule: `External AI API call (${pattern}) outside ai/ services`, context: line.trim().substring(0, 80) });
        }
      }
    });
  }

  // Rule 3: Source adapters must use AbortSignal.timeout on fetch calls
  if (rel.includes('src/lib/services/medical-sources/sources/') || rel.includes('src/lib/medical-sources/sources/')) {
    lines.forEach((line, i) => {
      if ((line.includes('await fetch(') || line.includes('return fetch(')) && !line.trim().startsWith('//')) {
        const surrounding = lines.slice(Math.max(0, i - 2), i + 10).join('\n');
        if (!surrounding.includes('AbortSignal.timeout') && !surrounding.includes('signal:')) {
          violations.push({ file: rel, line: i + 1, rule: 'External fetch must use AbortSignal.timeout', context: line.trim().substring(0, 80) });
        }
      }
    });
  }

  // Rule 4: File size (>400 lines = warning, not hard failure)
  if (lines.length > 400 && !rel.includes('test') && !rel.includes('verify') && !rel.includes('scripts/')) {
    violations.push({ file: rel, line: 0, rule: `File too large (${lines.length} lines, max 400)`, context: '' });
  }
}

console.log('🏛️  Checking Architectural Integrity\n');
walk(join(root, 'src/lib'), check);
walk(join(root, 'src/app'), check);
walk(join(root, 'src/components'), check);

if (violations.length === 0) {
  console.log('✅ STAGE 6 PASSED: No architectural violations\n');
  process.exit(0);
}

// Group by rule
const grouped: Record<string, Violation[]> = {};
for (const v of violations) {
  if (!grouped[v.rule]) grouped[v.rule] = [];
  grouped[v.rule].push(v);
}

const hardViolations = violations.filter(v => !v.rule.startsWith('File too large'));
const sizeWarnings = violations.filter(v => v.rule.startsWith('File too large'));

if (sizeWarnings.length > 0) {
  console.log(`⚠️  File size warnings: ${sizeWarnings.length}`);
  sizeWarnings.slice(0, 5).forEach(v => console.log(`   📄 ${v.file} — ${v.rule}`));
  console.log('');
}

if (hardViolations.length === 0) {
  console.log(`✅ STAGE 6 PASSED: No hard violations (${sizeWarnings.length} size warnings)\n`);
  process.exit(0);
}

console.log(`❌ STAGE 6 FAILED: ${hardViolations.length} hard violations\n`);
for (const [rule, items] of Object.entries(grouped)) {
  if (items[0].rule.startsWith('File too large')) continue;
  console.log(`\n⚠️  ${rule} (${items.length} issues):`);
  console.log('─'.repeat(70));
  items.slice(0, 5).forEach(item => {
    console.log(`   📄 ${item.file}${item.line > 0 ? `:${item.line}` : ''}`);
    if (item.context) console.log(`      → ${item.context}`);
  });
  if (items.length > 5) console.log(`   ... and ${items.length - 5} more`);
}
process.exit(1);
