/**
 * generate-explanations.mjs
 * 
 * Generates real, detailed medical explanations for USMLE questions
 * using Groq API (llama-3.3-70b-versatile).
 * 
 * Run:   node scripts/generate-explanations.mjs [--step step1|step2ck] [--batch 50] [--start 0]
 * 
 * Features:
 *  - Resumes from where it left off (tracks progress in .explain-progress.json)
 *  - Saves after each batch (crash-safe)
 *  - Rate-limited to stay within Groq free tier
 *  - Generates 300-600 word structured medical explanations
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'usmle-questions');
const PROGRESS_FILE = join(DATA_DIR, '.explain-progress.json');

// ── Config ─────────────────────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith('--batch='))?.split('=')[1] || '20');
const DELAY_MS = 2500; // 2.5s delay between requests (Groq rate limit safe)
const STEP_ARG = process.argv.find(a => a.startsWith('--step='))?.split('=')[1] || 'both';

if (!GROQ_API_KEY) {
  // Try loading from .env.local
  const envPath = join(__dirname, '..', '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GROQ_API_KEY=(.+)/);
    if (match) {
      process.env.GROQ_API_KEY = match[1].trim();
    }
  }
}

const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  console.error('❌ GROQ_API_KEY not found. Set it in .env.local or environment.');
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function loadJSON(filename) {
  return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8'));
}

function saveJSON(filename, data) {
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

function loadProgress() {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { step1: 0, step2ck: 0, completed: [], errors: [] };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isGenericExplanation(text) {
  if (!text || text.length < 50) return true;
  const genericPatterns = [
    'aligns most consistently with this diagnosis',
    'The correct answer is',
    'clinical presentation and the available evidence support',
    'based on current USMLE standards',
  ];
  return genericPatterns.some(p => text.includes(p));
}

// ── Prompt Builder ─────────────────────────────────────────────────────────────
function buildPrompt(question) {
  const optionsText = question.options
    .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
    .join('\n');

  const correctLetter = String.fromCharCode(65 + question.answer);

  return {
    messages: [
      {
        role: 'system',
        content: `You are a senior USMLE tutor writing explanations for a medical question bank. 
Write a detailed, educational explanation that a medical student can learn from.
You MUST follow this exact structure:

**Why ${correctLetter} is correct:** [2-3 sentences explaining the pathophysiology/mechanism/clinical reasoning that makes this the right answer]

**Why other options are wrong:**
- A: [1 sentence why wrong - skip if A is correct]
- B: [1 sentence why wrong - skip if B is correct]  
- C: [1 sentence why wrong - skip if C is correct]
- D: [1 sentence why wrong - skip if D is correct]

**Key Teaching Point:** [1 clear clinical pearl]

**Educational Objective:** ${question.educationalObjective || 'Understand the clinical reasoning behind this presentation.'}

Rules:
- Be concise but thorough (200-400 words total)
- Use real pathophysiology, not generic statements
- Reference First Aid / Step review material concepts where relevant
- Do NOT add disclaimers or caveats
- Write in plain English, suitable for a medical student`
      },
      {
        role: 'user',
        content: `CLINICAL VIGNETTE:
${question.vignette}

OPTIONS:
${optionsText}

CORRECT ANSWER: ${correctLetter}. ${question.options[question.answer]}
SPECIALTY: ${question.specialty}
DIFFICULTY: ${question.difficulty}

Write the explanation now.`
      }
    ]
  };
}

// ── API Call ────────────────────────────────────────────────────────────────────
async function generateExplanation(question, retries = 3) {
  const { messages } = buildPrompt(question);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.3,
          max_tokens: 800,
        }),
      });

      if (response.status === 429) {
        // Rate limited — wait and retry
        const retryAfter = parseInt(response.headers.get('retry-after') || '10');
        console.log(`    ⏳ Rate limited, waiting ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();
      const explanation = data.choices?.[0]?.message?.content?.trim();

      if (!explanation || explanation.length < 50) {
        throw new Error('Empty or too-short explanation received');
      }

      return explanation;
    } catch (error) {
      if (attempt < retries - 1) {
        console.log(`    ⚠ Attempt ${attempt + 1} failed: ${error.message}. Retrying...`);
        await sleep(3000);
      } else {
        throw error;
      }
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const progress = loadProgress();
  const filesToProcess = [];

  if (STEP_ARG === 'both' || STEP_ARG === 'step1') {
    filesToProcess.push({ filename: 'step1.json', key: 'step1' });
  }
  if (STEP_ARG === 'both' || STEP_ARG === 'step2ck') {
    filesToProcess.push({ filename: 'step2ck.json', key: 'step2ck' });
  }

  for (const { filename, key } of filesToProcess) {
    const questions = loadJSON(filename);
    const startIdx = progress[key] || 0;

    // Count how many need fixing
    const needsFix = questions.filter(q => isGenericExplanation(q.explanation)).length;
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📋 ${filename}: ${questions.length} questions, ${needsFix} need real explanations`);
    console.log(`   Resuming from index ${startIdx}`);
    console.log(`${'═'.repeat(60)}\n`);

    let fixed = 0;
    let errors = 0;

    for (let i = startIdx; i < questions.length; i++) {
      const q = questions[i];

      // Skip if already has a real explanation
      if (!isGenericExplanation(q.explanation)) {
        continue;
      }

      try {
        process.stdout.write(`  [${i + 1}/${questions.length}] ${q.id} (${q.specialty}) ... `);
        const explanation = await generateExplanation(q);
        q.explanation = explanation;
        fixed++;
        console.log(`✅ (${explanation.length} chars)`);
      } catch (error) {
        errors++;
        console.log(`❌ ${error.message}`);
        progress.errors.push({ id: q.id, error: error.message, timestamp: new Date().toISOString() });
      }

      // Save progress after each question
      progress[key] = i + 1;
      progress.completed.push(q.id);

      // Save file every BATCH_SIZE questions
      if ((fixed + errors) % BATCH_SIZE === 0) {
        saveJSON(filename, questions);
        saveProgress(progress);
        console.log(`  💾 Saved at index ${i + 1} (${fixed} fixed, ${errors} errors)\n`);
      }

      // Rate limit delay
      await sleep(DELAY_MS);
    }

    // Final save
    saveJSON(filename, questions);
    saveProgress(progress);
    console.log(`\n✅ ${filename} complete: ${fixed} explanations generated, ${errors} errors`);
  }

  console.log('\n🎉 All done!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
