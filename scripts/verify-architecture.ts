import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface Violation {
  file: string;
  rule: string;
  line?: number;
  context?: string;
}

const violations: Violation[] = [];
const projectRoot = process.cwd();

function walkDir(dir: string, callback: (path: string) => void): void {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      callback(fullPath);
    }
  }
}

function checkFile(filePath: string): void {
  const relativePath = relative(projectRoot, filePath);
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // RULE 1: Only grok-client.ts can call x.ai
  if (!relativePath.includes('lib/services/ai/grok-client.ts') && !relativePath.includes('node_modules')) {
    lines.forEach((line, i) => {
      if (line.includes('api.x.ai') || line.includes('XAI_API_KEY')) {
        if (!relativePath.includes('grok-client.ts') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          violations.push({ file: relativePath, rule: 'Only grok-client.ts can reference Grok API directly', line: i + 1, context: line.trim() });
        }
      }
    });
  }

  // RULE 2: Only repositories can call supabase.from()
  if (!relativePath.includes('lib/repositories/') && !relativePath.includes('lib/utils/rate-limiter.ts') && !relativePath.includes('node_modules')) {
    lines.forEach((line, i) => {
      const supabaseCallMatch = line.match(/supabase\s*\.\s*from\s*\(/);
      if (supabaseCallMatch && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        violations.push({ file: relativePath, rule: 'Only repositories can call supabase.from() (rate-limiter excepted)', line: i + 1, context: line.trim() });
      }
    });
  }

  // RULE 3: No `any` without explicit comment
  lines.forEach((line, i) => {
    const anyMatch = line.match(/:\s*any(?:[\s,;)\]>]|$)/);
    if (anyMatch && !line.includes('// @ts-expect-error') && !line.includes('// eslint-disable') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      const isJsonContext = line.includes('JSON.parse') || lines[i - 1]?.includes('JSON.parse') || line.includes('any[]');
      if (!isJsonContext) {
        violations.push({ file: relativePath, rule: 'Avoid `any` type without explicit suppression', line: i + 1, context: line.trim() });
      }
    }
  });

  // RULE 4: External API calls must have AbortSignal.timeout
  if (relativePath.includes('lib/services/medical-sources/sources/')) {
    lines.forEach((line, i) => {
      if (line.includes('await fetch(') || line.includes('return fetch(')) {
        const nextLines = lines.slice(i, i + 10).join('\n');
        if (!nextLines.includes('AbortSignal.timeout')) {
          violations.push({ file: relativePath, rule: 'External fetch must use AbortSignal.timeout(10000)', line: i + 1, context: line.trim() });
        }
      }
    });
  }

  // RULE 5: API routes must validate with Zod
  if (relativePath.includes('app/api/') && relativePath.endsWith('route.ts')) {
    if (content.includes('export async function POST') || content.includes('export async function PUT')) {
      if (!content.includes('safeParse') && !content.includes('.parse(')) {
        violations.push({ file: relativePath, rule: 'API routes with body must validate with Zod' });
      }
    }
  }

  // RULE 6: File size limit (300 lines)
  if (lines.length > 300) {
    violations.push({ file: relativePath, rule: `File exceeds 300 lines (${lines.length} lines)` });
  }
}

console.log('Checking architectural integrity...\n');

walkDir(join(projectRoot, 'src', 'lib'), checkFile);
walkDir(join(projectRoot, 'src', 'app'), checkFile);

if (violations.length === 0) {
  console.log('✅ STAGE 5 PASSED: No architectural violations found');
  process.exit(0);
}

console.log(`❌ STAGE 5 FAILED: Found ${violations.length} violations:\n`);

const grouped: Record<string, Violation[]> = {};
for (const v of violations) {
  if (!grouped[v.rule]) grouped[v.rule] = [];
  grouped[v.rule].push(v);
}

for (const [rule, items] of Object.entries(grouped)) {
  console.log(`\n⚠️  ${rule}`);
  console.log('─'.repeat(80));
  for (const item of items) {
    console.log(`   📄 ${item.file}${item.line ? `:${item.line}` : ''}`);
    if (item.context) console.log(`      → ${item.context.substring(0, 100)}`);
  }
}

process.exit(1);
