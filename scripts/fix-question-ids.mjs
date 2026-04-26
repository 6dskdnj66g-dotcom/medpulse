/**
 * fix-question-ids.mjs
 * Fixes duplicate question IDs across Step 1 and Step 2 CK JSON files.
 * Run: node scripts/fix-question-ids.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'usmle-questions');

function loadJSON(filename) {
  return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8'));
}

function saveJSON(filename, data) {
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

function makeSpecAbbr(specialty) {
  const map = {
    'Cardiology': 'CARD', 'Pulmonology': 'PULM', 'GI': 'GI',
    'Neurology': 'NEURO', 'Psychiatry': 'PSYCH', 'Endocrine': 'ENDO',
    'Endocrinology': 'ENDO', 'Hematology': 'HEME', 'Nephrology': 'NEPH',
    'Infectious Disease': 'ID', 'ID': 'ID', 'Immunology': 'IMMUN',
    'Rheumatology': 'RHEUM', 'Dermatology': 'DERM', 'OB/GYN': 'OBGYN',
    'Pediatrics': 'PEDS', 'Surgery': 'SURG', 'Emergency': 'EM',
    'Oncology': 'ONC', 'Biostatistics': 'BIOSTAT', 'Pathology': 'PATH',
    'Pharmacology': 'PHARM', 'Microbiology': 'MICRO', 'Biochemistry': 'BIOCHEM',
    'General': 'GEN',
  };
  return map[specialty] || specialty.toUpperCase().slice(0, 4);
}

// ── Load data ──────────────────────────────────────────────────────────────────
const step1 = loadJSON('step1.json');
const step2 = loadJSON('step2ck.json');

// ── Pre-fix stats ──────────────────────────────────────────────────────────────
const allBefore = [...step1, ...step2];
const idsBefore = allBefore.map(q => q.id);
const uniqueBefore = new Set(idsBefore).size;
console.log('=== PRE-FIX STATS ===');
console.log(`Total questions: ${allBefore.length}`);
console.log(`Unique IDs:      ${uniqueBefore}`);
console.log(`Duplicates:      ${allBefore.length - uniqueBefore}`);
console.log('');

// ── Re-index Step 1 ────────────────────────────────────────────────────────────
const step1Counters = {};
for (let i = 0; i < step1.length; i++) {
  const spec = makeSpecAbbr(step1[i].specialty || 'GEN');
  step1Counters[spec] = (step1Counters[spec] || 0) + 1;
  step1[i].id = `S1_${spec}_${String(step1Counters[spec]).padStart(4, '0')}`;
}

// ── Re-index Step 2 CK ────────────────────────────────────────────────────────
const step2Counters = {};
for (let i = 0; i < step2.length; i++) {
  const spec = makeSpecAbbr(step2[i].specialty || 'GEN');
  step2Counters[spec] = (step2Counters[spec] || 0) + 1;
  step2[i].id = `S2_${spec}_${String(step2Counters[spec]).padStart(4, '0')}`;
}

// ── Post-fix verification ──────────────────────────────────────────────────────
const allAfter = [...step1, ...step2];
const idsAfter = allAfter.map(q => q.id);
const uniqueAfter = new Set(idsAfter).size;
console.log('=== POST-FIX STATS ===');
console.log(`Total questions: ${allAfter.length}`);
console.log(`Unique IDs:      ${uniqueAfter}`);
console.log(`Duplicates:      ${allAfter.length - uniqueAfter}`);

if (allAfter.length === uniqueAfter) {
  console.log('\n✅ ZERO DUPLICATES — all IDs are unique!\n');
} else {
  console.error('\n❌ Still have duplicates — something went wrong!\n');
  process.exit(1);
}

// ── Sample IDs ─────────────────────────────────────────────────────────────────
console.log('Sample Step 1 IDs:', step1.slice(0, 5).map(q => q.id));
console.log('Sample Step 2 IDs:', step2.slice(0, 5).map(q => q.id));

// ── Save ───────────────────────────────────────────────────────────────────────
saveJSON('step1.json', step1);
saveJSON('step2ck.json', step2);
console.log('\n✅ Files saved successfully.');
