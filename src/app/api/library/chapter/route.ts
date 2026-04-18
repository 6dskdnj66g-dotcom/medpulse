import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "");

export async function POST(request: NextRequest) {
  try {
    const { bookTitle, chapterTitle, specialty, edition, usmleRelevance } = await request.json() as {
      bookTitle: string;
      chapterTitle: string;
      specialty: string;
      edition: string;
      usmleRelevance: string;
    };

    const prompt = `You are a senior medical editor writing for MedPulse AI Clinical Platform (2026).

Generate COMPLETE, AUTHORITATIVE, EVIDENCE-BASED clinical content for:
Book: ${bookTitle} ${edition}
Chapter: ${chapterTitle}
Specialty: ${specialty}
USMLE Relevance: ${usmleRelevance}

Return ONLY valid JSON with this exact structure (no markdown, no extra text):

{
  "definition": "Complete definition with epidemiology, global burden, and 2026 statistics. Minimum 250 words. Include WHO data where relevant.",

  "pathophysiology": "Detailed disease mechanisms, cellular and molecular basis, pathological changes, disease progression timeline. Minimum 300 words. Include key pathways.",

  "clinical_features": {
    "symptoms": [
      "Symptom name — frequency percentage — clinical significance",
      "At least 8-12 symptoms with frequencies"
    ],
    "signs": [
      "Physical examination finding — technique — clinical significance",
      "At least 6-10 signs"
    ],
    "special_presentations": "Atypical presentations in elderly patients, paediatric manifestations if relevant, pregnancy-related considerations, immunocompromised patients"
  },

  "investigations": {
    "bedside": ["Test name — what to look for — normal vs abnormal"],
    "blood_tests": ["Test — normal range — significance in this condition"],
    "imaging": ["Modality — what to look for — sensitivity/specificity"],
    "special_tests": ["Test — indication — interpretation"],
    "diagnostic_criteria": "Gold standard diagnostic criteria with sensitivity and specificity percentages"
  },

  "differential_diagnosis": [
    {"condition": "Condition name", "distinguishing_features": "How to differentiate from this condition clinically and with investigations"},
    "Minimum 6 differentials"
  ],

  "management": {
    "immediate": "Emergency or urgent steps — applicable if acute presentation",
    "non_pharmacological": "Lifestyle modifications, diet, physiotherapy, patient education — specific and practical",
    "pharmacological": [
      {
        "drug": "Generic drug name",
        "dose": "Exact dose with route and frequency (e.g., 10mg oral OD)",
        "mechanism": "Brief mechanism of action",
        "indication": "When specifically to use this drug",
        "contraindications": "Absolute and relative contraindications",
        "side_effects": "Key clinically important adverse effects",
        "monitoring": "What to monitor and at what intervals"
      }
    ],
    "surgical": "Surgical indications, procedures, expected outcomes — write N/A if not applicable",
    "guidelines_summary": "Latest 2025-2026 guideline class I and II recommendations from AHA/ESC/WHO/NICE/NICE with specific targets"
  },

  "complications": [
    {"complication": "Name", "frequency": "percentage or rare/common", "management": "How to manage this complication"}
  ],

  "prognosis": "Survival statistics, prognostic factors, validated scoring systems with interpretation, long-term outcomes",

  "prevention": "Primary prevention strategies with evidence, secondary prevention, screening programmes",

  "clinical_pearls": [
    "High-yield exam pearl that is non-obvious and commonly tested",
    "Minimum 8 clinical pearls — each a complete, actionable learning point"
  ],

  "usmle_high_yield": {
    "step1_relevance": "Pathophysiology and basic science focus points for Step 1",
    "step2_relevance": "Clinical management and decision-making focus for Step 2 CK",
    "classic_vignette": "A typical USMLE-style question stem setup (3-4 sentences) without giving the answer",
    "answer_approach": "How to think through questions on this topic systematically"
  },

  "references": [
    {
      "citation": "Author(s). Title. Journal. Year;Vol(Issue):Pages.",
      "url": "https://pubmed.ncbi.nlm.nih.gov/[PMID]/ or guideline URL",
      "evidence_level": "Level 1A meta-analysis / Level 1B RCT / Level 2A / Guideline Class I-A"
    },
    "Minimum 8 references — use real published papers"
  ]
}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json\s?|```/g, "").trim();
    const content = JSON.parse(clean);

    return NextResponse.json({ content, success: true });
  } catch (err) {
    console.error("Chapter generation error:", err);
    return NextResponse.json({ error: "Failed to generate chapter content" }, { status: 500 });
  }
}
