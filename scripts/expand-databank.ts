/**
 * expand-databank.ts
 *
 * Safely appends new questions from GBaker/MedQA-USMLE-4-options (HuggingFace)
 * to the existing MedPulse question bank. NEVER overwrites existing questions.
 *
 * Dataset:  GBaker/MedQA-USMLE-4-options  (11,451 real USMLE-style questions,
 *           open educational use)
 * API:      https://datasets-server.huggingface.co — no auth token required
 * Splits:   train (10,178) + test (1,273)
 *
 * Schema match — existing MedPulse question fields:
 *   id                  string   "medqa_N" or "medqa_test_N"
 *   step                string   "Step 1" | "Step 2 CK"
 *   specialty           string   keyword-detected from vignette
 *   difficulty          string   "Easy" | "Medium" | "Hard"  (word-count proxy)
 *   vignette            string   full question stem
 *   options             string[] [optA, optB, optC, optD]  — 0-indexed array
 *   answer              number   0-based index of correct option
 *   explanation         string   generated (dataset has no exp field)
 *   educationalObjective string  generated
 *
 * Usage:
 *   npx tsx scripts/expand-databank.ts              # fetch up to 3000 new
 *   npx tsx scripts/expand-databank.ts --limit 2000
 *   npx tsx scripts/expand-databank.ts --dry-run    # no file writes
 */

import fs from "fs";
import path from "path";

// ── CLI flags ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN   = args.includes("--dry-run");
const limitFlag = args.find(a => a.startsWith("--limit"));
const FETCH_LIMIT = limitFlag
  ? parseInt(limitFlag.includes("=") ? limitFlag.split("=")[1] : args[args.indexOf("--limit") + 1] ?? "3000")
  : 3000;

// ── Paths ──────────────────────────────────────────────────────────────────────
const DATA_DIR   = path.join(process.cwd(), "data", "usmle-questions");
const STEP1_PATH = path.join(DATA_DIR, "step1.json");
const STEP2_PATH = path.join(DATA_DIR, "step2ck.json");

// ── Existing MedPulse schema ───────────────────────────────────────────────────
interface MedPulseQuestion {
  id:                   string;
  step:                 "Step 1" | "Step 2 CK";
  specialty:            string;
  difficulty:           "Easy" | "Medium" | "Hard";
  vignette:             string;
  options:              string[];
  answer:               number;
  explanation:          string;
  educationalObjective: string;
}

// ── GBaker API row shape ───────────────────────────────────────────────────────
interface GBakerRow {
  question:          string;
  answer:            string;   // full text of correct answer
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  meta_info:         string;   // "step1" | "step2&3"
  answer_idx:        string;   // "A" | "B" | "C" | "D"
  metamap_phrases:   string[];
}

interface HFResponse {
  rows:              { row: GBakerRow }[];
  num_rows_total:    number;
}

// ── Step detection: meta_info contains "step1" or "step2" ────────────────────
function detectStep(meta: string): "Step 1" | "Step 2 CK" {
  return meta.toLowerCase().includes("step1") ? "Step 1" : "Step 2 CK";
}

// ── Specialty detection: keyword scan of the vignette ─────────────────────────
const SPECIALTY_KEYWORDS: [string, string[]][] = [
  ["Cardiology",     ["myocardial infarction","chest pain","angina","arrhythmia","atrial fibrillation","heart failure","ecg","ekg","palpitation","murmur","valve","aortic","endocarditis","pericarditis","cardiomyopathy","cardiac"]],
  ["Pulmonology",    ["asthma","copd","pneumonia","pulmonary","tuberculosis","pleural","pneumothorax","lung","bronchitis","emphysema","respiratory","dyspnea","hemoptysis","spirometry","pe","pulmonary embolism"]],
  ["GI",             ["abdominal pain","nausea","vomiting","diarrhea","constipation","jaundice","hepatitis","cirrhosis","liver","pancrea","crohn","ulcerative colitis","ibd","gastric","duodenal","bowel","colon","rectal","esophag","gerd","cholecystitis","gallstone"]],
  ["Neurology",      ["stroke","seizure","headache","migraine","neuropathy","dementia","alzheimer","parkinson","multiple sclerosis","bell's palsy","meningitis","encephalitis","spinal","weakness","paralysis","tremor","syncope","vertigo","cranial nerve","coma","glasgow"]],
  ["Psychiatry",     ["depression","anxiety","schizophrenia","bipolar","ptsd","hallucination","delusion","mania","phobia","ocd","panic","suicide","psychosis","personality disorder","eating disorder","adhd","autism"]],
  ["Endocrinology",  ["diabetes","thyroid","hyperthyroid","hypothyroid","adrenal","cortisol","cushing","addison","pituitary","acromegaly","insulin","hyperglycemia","hypoglycemia","hba1c","metabolic syndrome","obesity"]],
  ["Hematology",     ["anemia","leukemia","lymphoma","thrombocytopenia","coagulation","platelet","hemoglobin","sickle cell","thalassemia","polycythemia","dvt","bleeding","clotting","bone marrow","spleen","neutropenia"]],
  ["Nephrology",     ["kidney","renal","glomerulo","proteinuria","hematuria","dialysis","creatinine","bun","nephrotic","nephritic","uremia","aki","ckd","hypertension","electrolyte","sodium","potassium","acidosis","alkalosis"]],
  ["ID",             ["infection","antibiotic","sepsis","fever","hiv","aids","hepatitis b","hepatitis c","malaria","tuberculosis tb","syphilis","gonorrhea","chlamydia","urinary tract","uti","pneumococ","meningococ","staph","strep","e coli","fungal","candida","bacterial"]],
  ["Rheumatology",   ["arthritis","lupus","sle","rheumatoid","gout","vasculitis","scleroderma","sjogren","fibromyalgia","osteoarthritis","ankylosing","psoriatic arthritis","joint","synovial","anti-nuclear"]],
  ["OB/GYN",         ["pregnant","pregnancy","gestation","labor","delivery","prenatal","postpartum","menstrual","amenorrhea","ovarian","uterine","cervical","endometriosis","fibroids","preeclampsia","eclampsia","ectopic","miscarriage","contraception","menopause"]],
  ["Pediatrics",     ["infant","newborn","neonate","child","pediatric","vaccination","growth","developmental","congenital","down syndrome","cystic fibrosis","kawasaki","intussusception","pyloric stenosis","rsv","ear infection","otitis"]],
  ["Surgery",        ["appendicitis","appendectomy","cholecystectomy","hernia","bowel obstruction","trauma","fracture","laceration","wound","abscess","biopsy","resection","anastomosis","surgical","post-operative","hemorrhage","crush","ischemic limb","compartment syndrome"]],
  ["Emergency",      ["emergency","unconscious","cardiac arrest","resuscitation","cpr","shock","hypotension","tachycardia","airway","intubation","trauma","burns","poisoning","overdose","anaphylaxis","altered mental status"]],
  ["Dermatology",    ["skin","rash","lesion","melanoma","psoriasis","eczema","dermatitis","urticaria","blistering","vesicle","papule","macule","bullous","acne","alopecia","vitiligo","pruritus","tinea"]],
  ["Pharmacology",   ["drug","medication","side effect","adverse","interaction","dose","pharmacokinetics","receptor","agonist","antagonist","antibiotic","analgesic","opioid","nsaid","statin","beta-blocker","ace inhibitor","diuretic"]],
  ["Pathology",      ["biopsy","histology","neoplasm","carcinoma","adenocarcinoma","sarcoma","metastasis","benign","malignant","tumor","cancer","stain","immunohistochemistry","necrosis","inflammation","fibrosis"]],
  ["Biochemistry",   ["enzyme","deficiency","metabolism","amino acid","vitamin","cofactor","pathway","dna","rna","mutation","gene","protein","glycolysis","tca cycle","fatty acid","cholesterol","purine","pyrimidine","porphyria"]],
  ["Microbiology",   ["culture","gram stain","organism","virus","bacteria","fungus","parasite","colony","sensitivity","resistance","pcr","serology","antigen","antibody","titer","complement"]],
  ["Biostatistics",  ["sensitivity","specificity","p-value","odds ratio","relative risk","confidence interval","study design","randomized","cohort","case-control","bias","screening","prevalence","incidence","number needed"]],
];

function detectSpecialty(vignette: string): string {
  const text = vignette.toLowerCase();
  let best = "General";
  let max  = 0;
  for (const [specialty, keywords] of SPECIALTY_KEYWORDS) {
    const score = keywords.filter(k => text.includes(k)).length;
    if (score > max) { max = score; best = specialty; }
  }
  return best;
}

// ── Difficulty: word-count proxy (same as existing import) ───────────────────
function detectDifficulty(vignette: string): "Easy" | "Medium" | "Hard" {
  const words = vignette.trim().split(/\s+/).length;
  if (words < 60)  return "Easy";
  if (words < 120) return "Medium";
  return "Hard";
}

// ── Build explanation (GBaker has no exp field) ───────────────────────────────
function buildExplanation(row: GBakerRow): string {
  const letter = row.answer_idx;
  const text   = row.answer;
  return `The correct answer is ${letter}: ${text}. The patient's clinical presentation and the available evidence support this as the most appropriate response based on current USMLE standards.`;
}

function buildObjective(row: GBakerRow): string {
  return `Recognize the clinical presentation and appropriate management related to ${row.answer}.`;
}

// ── Fetch one page from HuggingFace Datasets API ──────────────────────────────
async function fetchPage(split: string, offset: number, length: number): Promise<HFResponse> {
  const url =
    `https://datasets-server.huggingface.co/rows` +
    `?dataset=GBaker%2FMedQA-USMLE-4-options` +
    `&config=default` +
    `&split=${split}` +
    `&offset=${offset}` +
    `&length=${length}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(`HF API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<HFResponse>;
}

// ── Map one GBaker row → MedPulse schema ──────────────────────────────────────
function mapRow(row: GBakerRow, globalIdx: number, splitLabel: string): MedPulseQuestion | null {
  // Validate options
  const opts = [row.options?.A, row.options?.B, row.options?.C, row.options?.D];
  if (opts.some(o => !o || o.trim().length === 0)) return null;

  // answer_idx must be A-D
  const keyMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  const answerIdx = keyMap[row.answer_idx];
  if (answerIdx === undefined) return null;

  if (!row.question || row.question.trim().length < 20) return null;

  return {
    id:                   `medqa_${splitLabel}_${globalIdx}`,
    step:                 detectStep(row.meta_info ?? ""),
    specialty:            detectSpecialty(row.question),
    difficulty:           detectDifficulty(row.question),
    vignette:             row.question.trim(),
    options:              opts.map(o => o!.trim()),
    answer:               answerIdx,
    explanation:          buildExplanation(row),
    educationalObjective: buildObjective(row),
  };
}

// ── Fetch one page with retry + exponential backoff on 429 ───────────────────
async function fetchPageWithRetry(split: string, offset: number, length: number, maxRetries = 5): Promise<HFResponse> {
  let delay = 2000; // start at 2s
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchPage(split, offset, length);
    } catch (err) {
      const msg = (err as Error).message;
      const is429 = msg.includes("429");
      if (!is429 || attempt === maxRetries) throw err;
      process.stdout.write(`\n  ⏳ Rate limited (429). Waiting ${delay / 1000}s before retry ${attempt + 1}/${maxRetries}…`);
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 2, 30_000); // cap at 30s
    }
  }
  throw new Error("Max retries exceeded");
}

// ── Fetch a full split with pagination, starting from a smart offset ──────────
async function fetchSplit(
  splitName: string,
  splitLabel: string,
  dedupSet: Set<string>,
  remaining: number,
  startOffset: number = 0,
): Promise<{ step1: MedPulseQuestion[]; step2: MedPulseQuestion[]; fetched: number; dupes: number; invalid: number }> {
  const PAGE     = 100;
  const step1: MedPulseQuestion[] = [];
  const step2: MedPulseQuestion[] = [];
  let fetched      = 0;
  let dupes        = 0;
  let invalid      = 0;
  let offset       = startOffset;
  let totalInSplit = Infinity;

  if (startOffset > 0) {
    console.log(`  Skipping first ${startOffset} rows (already imported) — starting at offset ${startOffset}`);
  }

  while ((step1.length + step2.length) < remaining) {
    let page: HFResponse;
    try {
      page = await fetchPageWithRetry(splitName, offset, PAGE);
    } catch (err) {
      console.error(`\n  ✗ Fetch failed at offset ${offset}:`, (err as Error).message);
      break;
    }

    if (!page.rows?.length) break;
    totalInSplit = page.num_rows_total;
    if (offset >= totalInSplit) break;

    for (const { row } of page.rows) {
      const mapped = mapRow(row, offset + fetched, splitLabel);
      if (!mapped) { invalid++; continue; }

      const key = mapped.vignette.slice(0, 80).toLowerCase().trim();
      if (dedupSet.has(key)) { dupes++; continue; }

      dedupSet.add(key);
      if (mapped.step === "Step 1") step1.push(mapped);
      else step2.push(mapped);

      if ((step1.length + step2.length) >= remaining) break;
    }

    fetched += page.rows.length;
    offset  += page.rows.length;

    const kept = step1.length + step2.length;
    process.stdout.write(
      `\r  [${splitName}] scanned offset ${offset}/${totalInSplit} → kept ${kept} new (dupes: ${dupes}, invalid: ${invalid})   `
    );

    await new Promise(r => setTimeout(r, 400)); // 400ms — well under HF rate limit
  }

  console.log(); // newline after \r
  return { step1, step2, fetched, dupes, invalid };
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(60));
  console.log("MedPulse — USMLE Question Bank Expander");
  console.log(`Mode    : ${DRY_RUN ? "DRY RUN (no files written)" : "LIVE"}`);
  console.log(`Dataset : GBaker/MedQA-USMLE-4-options (train 10,178 + test 1,273)`);
  console.log(`Target  : up to ${FETCH_LIMIT} new questions`);
  console.log("=".repeat(60));

  // 1. Load existing data ───────────────────────────────────────────────────────
  console.log("\n[1/4] Loading existing question bank…");

  if (!fs.existsSync(STEP1_PATH) || !fs.existsSync(STEP2_PATH)) {
    throw new Error(`Files not found in ${DATA_DIR}. Run from project root.`);
  }

  const existingStep1: MedPulseQuestion[] = JSON.parse(fs.readFileSync(STEP1_PATH, "utf-8"));
  const existingStep2: MedPulseQuestion[] = JSON.parse(fs.readFileSync(STEP2_PATH, "utf-8"));

  const beforeStep1 = existingStep1.length;
  const beforeStep2 = existingStep2.length;
  const beforeTotal = beforeStep1 + beforeStep2;

  console.log(`  step1.json   : ${beforeStep1} questions`);
  console.log(`  step2ck.json : ${beforeStep2} questions`);
  console.log(`  Total before : ${beforeTotal} questions`);

  // Build dedup set (first 80 chars of vignette, lowercased)
  const dedupSet = new Set<string>();
  for (const q of [...existingStep1, ...existingStep2]) {
    dedupSet.add(q.vignette.slice(0, 80).toLowerCase().trim());
  }
  console.log(`  Dedup index  : ${dedupSet.size} unique vignette hashes`);

  // Detect smart start offset from highest sequential medqa_N id already imported.
  // IDs like medqa_5299 mean we imported up to row 5299 of the train split,
  // so we can skip straight to offset 5300 rather than scanning all dupes.
  const maxImportedIdx = [...existingStep1, ...existingStep2]
    .map(q => { const m = q.id.match(/^medqa_(\d+)$/); return m ? parseInt(m[1]) : -1; })
    .reduce((a, b) => Math.max(a, b), -1);
  const trainStartOffset = maxImportedIdx >= 0 ? maxImportedIdx + 1 : 0;
  console.log(`  Smart offset : skipping train[0–${maxImportedIdx}], starting at row ${trainStartOffset}`);

  // 2. Fetch from train split first, then test split ──────────────────────────
  console.log(`\n[2/4] Fetching from GBaker/MedQA-USMLE-4-options…`);

  const newStep1: MedPulseQuestion[] = [];
  const newStep2: MedPulseQuestion[] = [];
  let totalDupes = 0, totalInvalid = 0;

  // Train split (starting after already-imported rows)
  const trainResult = await fetchSplit("train", "train", dedupSet, FETCH_LIMIT, trainStartOffset);
  newStep1.push(...trainResult.step1);
  newStep2.push(...trainResult.step2);
  totalDupes   += trainResult.dupes;
  totalInvalid += trainResult.invalid;

  // If we still need more, pull from test split
  const gotSoFar = newStep1.length + newStep2.length;
  if (gotSoFar < FETCH_LIMIT) {
    console.log(`  train done. Got ${gotSoFar}/${FETCH_LIMIT}. Pulling from test split…`);
    const testResult = await fetchSplit("test", "test", dedupSet, FETCH_LIMIT - gotSoFar, 0);
    newStep1.push(...testResult.step1);
    newStep2.push(...testResult.step2);
    totalDupes   += testResult.dupes;
    totalInvalid += testResult.invalid;
  }

  const newTotal = newStep1.length + newStep2.length;

  console.log(`\n[3/4] Fetch summary:`);
  console.log(`  New Step 1 questions    : ${newStep1.length}`);
  console.log(`  New Step 2 CK questions : ${newStep2.length}`);
  console.log(`  Total new               : ${newTotal}`);
  console.log(`  Skipped (duplicate)     : ${totalDupes}`);
  console.log(`  Skipped (invalid/short) : ${totalInvalid}`);

  if (newTotal === 0) {
    console.log("\n⚠  No new questions to add. The bank may already contain all available questions.");
    return;
  }

  // 3. Merge & write ────────────────────────────────────────────────────────────
  const mergedStep1 = [...existingStep1, ...newStep1];
  const mergedStep2 = [...existingStep2, ...newStep2];
  const mergedTotal = mergedStep1.length + mergedStep2.length;

  console.log(`\n[4/4] ${DRY_RUN ? "[DRY RUN] Would write" : "Writing"} merged files…`);
  console.log(`  step1.json   : ${beforeStep1} + ${newStep1.length} = ${mergedStep1.length}`);
  console.log(`  step2ck.json : ${beforeStep2} + ${newStep2.length} = ${mergedStep2.length}`);

  if (!DRY_RUN) {
    // Atomic write: .tmp → rename, so a crash can't corrupt existing data
    const t1 = STEP1_PATH + ".tmp";
    const t2 = STEP2_PATH + ".tmp";
    fs.writeFileSync(t1, JSON.stringify(mergedStep1, null, 2), "utf-8");
    fs.writeFileSync(t2, JSON.stringify(mergedStep2, null, 2), "utf-8");
    fs.renameSync(t1, STEP1_PATH);
    fs.renameSync(t2, STEP2_PATH);
    console.log("  ✓ Files written successfully.");
  } else {
    console.log("  (Dry run — no files were modified.)");
  }

  // 4. Final summary ─────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log(`Before: ${beforeTotal} questions.  Added: ${newTotal}.  Total Now: ${mergedTotal} questions.`);
  console.log("=".repeat(60));
}

main().catch(err => {
  console.error("\n✗ Fatal error:", err);
  process.exit(1);
});
