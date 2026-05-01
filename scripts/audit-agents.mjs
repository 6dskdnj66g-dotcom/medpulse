// scripts/audit-agents.mjs
// Local audit script — does NOT run in production
// Usage: node scripts/audit-agents.mjs
// Usage (prod): AUDIT_BASE=https://medpulse-ai-five.vercel.app node scripts/audit-agents.mjs

const PROD_BASE = 'https://medpulse-ai-five.vercel.app';
const LOCAL_BASE = 'http://localhost:3000';
const BASE = process.env.AUDIT_BASE || LOCAL_BASE;
const TIMEOUT_MS = 30_000;
const MAX_QUESTIONS_PER_AGENT = 2;

const AGENTS = [
  // ── GROQ agents ─────────────────────────────────────────────────────────────
  {
    name: 'Professor AI (llama-3.3-70b + free_medical_search tool)',
    endpoint: '/api/ai/professor',
    method: 'POST',
    payload: (question) => ({
      professorId: 'internal',
      lang: 'en',
      messages: [{ role: 'user', content: question }],
    }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: [
      'What is the first-line treatment for community-acquired pneumonia?',
      'Briefly explain the pathophysiology of type 2 diabetes.',
    ],
  },
  {
    name: 'DDx Engine (Groq direct API, SSE stream)',
    endpoint: '/api/ddx',
    method: 'POST',
    payload: (question) => ({
      messages: [{ role: 'user', content: question }],
    }),
    isStream: true,
    contentType: 'text/event-stream',
    testQuestions: [
      'Patient: 35-year-old male, sudden onset pleuritic chest pain, shortness of breath, no fever.',
      'Patient: 60-year-old female, progressive dysphagia to solids, weight loss, no reflux symptoms.',
    ],
  },
  {
    name: 'Drug Interaction Analyzer (Groq streamText)',
    endpoint: '/api/drug-interaction',
    method: 'POST',
    payload: (_question, index) => ({
      drugs: index === 0 ? ['warfarin', 'aspirin'] : ['metformin', 'contrast dye', 'lisinopril'],
    }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: ['warfarin + aspirin', 'metformin + contrast + lisinopril'],
  },
  {
    name: 'ECG Analysis Engine (Groq streamText)',
    endpoint: '/api/ecg-analysis',
    method: 'POST',
    payload: (question) => ({ description: question }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: [
      'HR 145bpm, irregularly irregular, no distinct P waves, narrow QRS, no ST changes.',
      'HR 32bpm, wide QRS 160ms, LBBB morphology, occasional P waves with no fixed PR interval.',
    ],
  },
  {
    name: 'Clinical Notes Generator (Groq streamText)',
    endpoint: '/api/generate-notes',
    method: 'POST',
    payload: (question) => ({ clinicalInfo: question }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: [
      '45 year old male, BP 160/100, headache, blurred vision, no known hypertension, on no medications.',
      '28yo female, 32 weeks pregnant, blood pressure 155/95, proteinuria +2, headache, edema bilateral legs.',
    ],
  },
  {
    name: 'Lab Interpreter (Groq streamText)',
    endpoint: '/api/lab-interpreter',
    method: 'POST',
    payload: (question) => ({
      labText: question,
      clinicalContext: 'General medicine ward patient',
    }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: [
      'Na 128, K 6.8, Creatinine 4.2, BUN 80, Hb 9.2, WBC 12.4, Plt 180',
      'ALT 520, AST 480, ALP 340, Total Bili 5.6, PT 18s, INR 1.8, Albumin 2.8',
    ],
  },
  {
    name: 'MDT Debate (Groq x3 NDJSON stream)',
    endpoint: '/api/mdt-debate',
    method: 'POST',
    payload: (question) => ({ query: question, lang: 'en' }),
    isStream: true,
    contentType: 'application/x-ndjson',
    testQuestions: [
      'What is the optimal anticoagulation strategy for a patient with AF and recent GI bleed?',
    ],
  },
  {
    name: 'Medical Query RAG (Groq streamText)',
    endpoint: '/api/medical-query',
    method: 'POST',
    payload: (question) => ({
      messages: [{ role: 'user', content: question }],
    }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: [
      'What are the diagnostic criteria for sepsis-3?',
      'First-line treatment for acute decompensated heart failure?',
    ],
  },
  {
    name: 'OSCE Chat — patient mode (Groq generateText)',
    endpoint: '/api/osce/chat',
    method: 'POST',
    payload: (question) => ({
      messages: [{ role: 'user', content: question }],
      stationId: 'IM-01',
      mode: 'patient',
      lang: 'en',
    }),
    isStream: false,
    contentType: 'application/json',
    testQuestions: [
      'Hello, what brings you in today?',
      'How long have you had this pain?',
    ],
  },
  {
    name: 'OSCE Evaluate (Groq streamText)',
    endpoint: '/api/osce/evaluate',
    method: 'POST',
    payload: (question) => ({
      stationId: 'IM-01',
      transcript: question,
    }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: [
      'Student: Hello, my name is Dr Smith. Can you tell me what brings you in today?\nPatient: I have chest pain since this morning.\nStudent: Can you describe the pain? Is it sharp or dull?\nPatient: It is crushing, radiates to my left arm.\nStudent: Have you had this before? Any shortness of breath?\nPatient: No, first time. Yes, I feel short of breath.',
    ],
  },
  {
    name: 'OSCE Turn Phase 7 (xAI Grok → Groq fallback)',
    endpoint: '/api/osce/turn',
    method: 'POST',
    payload: (question) => ({
      stationId: 'chest-pain-stemi-001',
      studentMessage: question,
      conversationHistory: [],
    }),
    isStream: false,
    contentType: 'application/json',
    testQuestions: [
      'Hello, my name is Dr Ahmed. What brings you in today?',
      'When did the pain start and does it radiate anywhere?',
    ],
  },
  {
    name: 'Medical Translator (Groq streamText)',
    endpoint: '/api/translate',
    method: 'POST',
    payload: (question) => ({ text: question, direction: 'auto' }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: [
      'myocardial infarction',
      'متلازمة الأيض',
    ],
  },
  // ── Gemini agents ────────────────────────────────────────────────────────────
  {
    name: 'Flashcard Generator (Gemini 2.0 Flash streamText)',
    endpoint: '/api/flashcards',
    method: 'POST',
    payload: (question) => ({ text: question }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: [
      'Atrial fibrillation is the most common sustained cardiac arrhythmia. It is characterized by disorganized atrial electrical activity and irregular ventricular response. Risk factors include hypertension, age, heart failure, valvular disease. Treatment includes rate control with beta-blockers or calcium channel blockers, rhythm control, and anticoagulation to reduce stroke risk (CHA2DS2-VASc score).',
    ],
  },
  {
    name: 'Medical Summarizer (Gemini 2.0 Flash generateText → JSON)',
    endpoint: '/api/medical-summarizer',
    method: 'POST',
    payload: (question) => ({ text: question, lang: 'en' }),
    isStream: false,
    contentType: 'application/json',
    testQuestions: [
      'Patient presents with 3-day history of productive cough, fever 38.5°C, right lower lobe consolidation on CXR, WBC 14.5. SpO2 94% on air. History of smoking 20 pack-years.',
    ],
  },
  {
    name: 'OSCE Simulator (Gemini 2.0 Flash streamText)',
    endpoint: '/api/simulator',
    method: 'POST',
    payload: (question) => ({
      messages: [{ role: 'user', content: question }],
    }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: [
      'Start a new clinical OSCE scenario for me.',
    ],
  },
  {
    name: 'Vision / Radiology (Gemini 2.0 Flash streamText)',
    endpoint: '/api/vision',
    method: 'POST',
    // Vision requires a real base64 image — use a minimal 1x1 PNG to test connectivity
    payload: () => ({
      imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      prompt: 'This is a test image. Describe what you see.',
    }),
    isStream: true,
    contentType: 'text/plain',
    testQuestions: ['test-image-connectivity'],
  },
  {
    name: 'Library Chapter Generator (Gemini 2.0 Flash JSON)',
    endpoint: '/api/library/chapter',
    method: 'POST',
    payload: () => ({
      bookTitle: "Harrison's Principles of Internal Medicine",
      chapterTitle: 'Approach to the Patient with Chest Pain',
      specialty: 'Cardiology',
      edition: '21st Edition',
      usmleRelevance: 'High — Step 1 and Step 2 CK',
    }),
    isStream: false,
    contentType: 'application/json',
    testQuestions: ['generate-chapter-connectivity-test'],
  },
  {
    name: 'USMLE Explain (xAI Grok → Groq fallback, JSON)',
    endpoint: '/api/usmle/explain',
    method: 'POST',
    payload: () => ({
      vignette: 'A 55-year-old man presents with crushing substernal chest pain radiating to his left arm for 45 minutes. BP 145/90, HR 88. ECG shows ST elevation in leads II, III, aVF.',
      options: [
        'Administer aspirin and activate cath lab for primary PCI',
        'Start IV heparin and observe for 24 hours',
        'Perform immediate CABG',
        'Administer sublingual nitroglycerin only and discharge',
      ],
      correctAnswer: 0,
      selectedAnswer: 1,
    }),
    isStream: false,
    contentType: 'application/json',
    testQuestions: ['inferior-stemi-pci-question'],
  },
];

async function testAgent(agent) {
  const results = [];

  for (let i = 0; i < Math.min(agent.testQuestions.length, MAX_QUESTIONS_PER_AGENT); i++) {
    const question = agent.testQuestions[i];
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const body = typeof agent.payload === 'function'
        ? agent.payload(question, i)
        : agent.payload;

      const response = await fetch(`${BASE}${agent.endpoint}`, {
        method: agent.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errText = await response.text().catch(() => '(unreadable)');
        results.push({
          question: question.slice(0, 80),
          status: 'http_error',
          httpStatus: response.status,
          duration,
          response: errText.slice(0, 300),
        });
        continue;
      }

      let body_text = '';
      if (agent.isStream && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          body_text += decoder.decode(value, { stream: true });
          if (body_text.length > 5000) break;
        }
      } else {
        body_text = await response.text();
      }

      results.push({
        question: question.slice(0, 80),
        status: 'success',
        httpStatus: response.status,
        duration,
        responsePreview: body_text.slice(0, 400),
        responseLength: body_text.length,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      results.push({
        question: question.slice(0, 80),
        status: err.name === 'AbortError' ? 'timeout' : 'error',
        duration: Date.now() - startTime,
        error: err.message,
      });
    }

    // Rate-limit between calls
    if (i < agent.testQuestions.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return { agent: agent.name, endpoint: agent.endpoint, results };
}

function classify(result) {
  if (result.status === 'timeout') return '❌ Timeout';
  if (result.status === 'error') return '❌ Error';
  if (result.status === 'http_error') return `🔴 HTTP ${result.httpStatus}`;
  if (result.status === 'success') {
    if (!result.responseLength || result.responseLength < 5) return '⚠️ Empty';
    if (result.duration > 10000) return '⏱️ Slow';
    return '✅ Working';
  }
  return '❓ Unknown';
}

async function main() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`MedPulse AI Agents Audit`);
  console.log(`Base URL: ${BASE}`);
  console.log(`Agents to test: ${AGENTS.length}`);
  console.log(`Timeout per call: ${TIMEOUT_MS / 1000}s`);
  console.log(`${'═'.repeat(60)}\n`);

  const allResults = [];

  for (const agent of AGENTS) {
    process.stdout.write(`Testing: ${agent.name}... `);
    const result = await testAgent(agent);
    allResults.push(result);
    const statuses = result.results.map(r => classify(r));
    console.log(statuses.join(', '));

    // Brief pause between agents
    await new Promise((r) => setTimeout(r, 1500));
  }

  // ── SUMMARY TABLE ────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`AUDIT REPORT — ${new Date().toISOString()}`);
  console.log(`${'═'.repeat(60)}\n`);

  const summaryRows = [];
  for (const r of allResults) {
    for (const test of r.results) {
      const cat = classify(test);
      summaryRows.push({ agent: r.agent, endpoint: r.endpoint, category: cat, duration: test.duration });
    }
  }

  // Print per-agent detail
  for (const r of allResults) {
    console.log(`\n${r.agent}`);
    console.log(`  Endpoint: ${r.endpoint}`);
    console.log('─'.repeat(50));
    for (const test of r.results) {
      const cat = classify(test);
      console.log(`  Q: ${test.question}`);
      console.log(`  → ${cat} | ${test.duration}ms`);
      if (test.status === 'success') {
        console.log(`  Preview: ${(test.responsePreview || '').slice(0, 120).replace(/\n/g, ' ')}...`);
      } else {
        console.log(`  Error: ${test.error || test.response || `HTTP ${test.httpStatus}`}`);
      }
    }
  }

  // Quick summary table
  console.log(`\n${'═'.repeat(60)}`);
  console.log('CATEGORY SUMMARY');
  console.log('─'.repeat(60));
  const cats = { '✅ Working': 0, '⏱️ Slow': 0, '❌ Timeout': 0, '🔴 HTTP': 0, '⚠️ Empty': 0, '❌ Error': 0 };
  for (const row of summaryRows) {
    const key = Object.keys(cats).find(k => row.category.startsWith(k));
    if (key) cats[key]++;
  }
  for (const [k, v] of Object.entries(cats)) {
    if (v > 0) console.log(`  ${k}: ${v}`);
  }

  // Write JSON report
  const fs = await import('fs/promises');
  const report = {
    timestamp: new Date().toISOString(),
    base: BASE,
    totalAgents: AGENTS.length,
    totalTests: summaryRows.length,
    summary: cats,
    results: allResults,
    fixes: [],
  };
  await fs.writeFile('audit-report.json', JSON.stringify(report, null, 2));
  console.log(`\nFull report written to audit-report.json`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
