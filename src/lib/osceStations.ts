/**
 * MedPulse OSCE Station Registry — 50 Stations
 * Complete patient personas + marking schemes
 */

export interface MarkingCriterion {
  item: string;
  marks: number;
  category: string;
}

export interface MarkingDomain {
  name: string;
  nameAr: string;
  maxMarks: number;
  criteria: MarkingCriterion[];
}

export interface PatientPersona {
  presentingComplaint: string;
  presentingComplaintAr: string;
  onset: string;
  severity: string;
  associatedSymptoms: string[];
  pastMedicalHistory: string[];
  medications: string[];
  allergies: string;
  socialHistory: string;
  familyHistory: string;
  systemsReview: Record<string, string>;
  personality: "anxious" | "calm" | "reluctant" | "emotional" | "cooperative";
  hiddenCues: string[];
  physicalFindings: string;
}

export interface OSCEStation {
  id: string;
  title: string;
  titleAr: string;
  specialty: string;
  stationType: "history_taking" | "examination" | "communication" | "procedure" | "data_interpretation" | "mixed";
  difficulty: "year1" | "year2" | "year3" | "year4" | "finals" | "postgrad";
  durationMinutes: number;
  patientBrief: string;
  patientName: string;
  patientAge: number;
  patientSex: "M" | "F";
  patientSetting: string;
  patientPersona: PatientPersona;
  markingScheme: {
    domains: MarkingDomain[];
    totalMarks: number;
    passThreshold: number;
    modelAnswer: string;
  };
  learningPoints: string[];
  relatedTopics: string[];
  tags: string[];
}

export const OSCE_STATIONS: OSCEStation[] = [
  // ══════════════════════════════════════════════════════
  // INTERNAL MEDICINE
  // ══════════════════════════════════════════════════════
  {
    id: "IM-01",
    title: "Chest Pain History Taking (Possible ACS)",
    titleAr: "أخذ تاريخ ألم الصدر (احتشاء عضلة القلب المحتمل)",
    specialty: "Internal Medicine",
    stationType: "history_taking",
    difficulty: "finals",
    durationMinutes: 8,
    patientBrief: "Mr. Omar Khalid, 58-year-old man, has presented to the ED with chest pain for the last 2 hours. He is sitting up and looks uncomfortable. Please take a full history of his presenting complaint and relevant background.",
    patientName: "Omar Khalid",
    patientAge: 58,
    patientSex: "M",
    patientSetting: "Emergency Department",
    patientPersona: {
      presentingComplaint: "Crushing central chest pain for 2 hours, started at rest while watching TV",
      presentingComplaintAr: "ألم صدري ضاغط مركزي منذ ساعتين، بدأ في الراحة",
      onset: "Sudden, at rest, 2 hours ago",
      severity: "8/10, worst pain ever",
      associatedSymptoms: [
        "Radiation to left arm and jaw",
        "Sweating (diaphoresis) profuse",
        "Nausea, vomited once",
        "Shortness of breath (mild)",
        "Palpitations"
      ],
      pastMedicalHistory: ["Hypertension (10 years)", "Type 2 diabetes (5 years)", "Hypercholesterolaemia"],
      medications: ["Metformin 1g BD", "Amlodipine 5mg OD", "Atorvastatin 40mg OD"],
      allergies: "Penicillin — rash",
      socialHistory: "Smokes 20/day for 30 years. Drinks 15 units/week. Works as a taxi driver.",
      familyHistory: "Father died of MI aged 60. Brother had CABG at 55.",
      systemsReview: {
        previous_chest_pain: "Occasional exertional chest tightness for 6 months, not investigated",
        legs: "No swelling, no calf pain",
        syncope: "None"
      },
      personality: "anxious",
      hiddenCues: [
        "Only mentions exertional chest tightness if specifically asked about previous similar episodes",
        "Family history volunteered spontaneously if asked about heart problems in family",
        "Allergies only revealed if specifically asked"
      ],
      physicalFindings: "Diaphoretic, pale, HR 98 irregular, BP 155/95, RR 20, SpO2 96% on air. Chest clear. Quiet heart sounds."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "History of Presenting Complaint",
          nameAr: "تاريخ الشكوى الرئيسية",
          maxMarks: 14,
          criteria: [
            { item: "Site of pain", marks: 1, category: "SOCRATES" },
            { item: "Onset (sudden vs gradual)", marks: 1, category: "SOCRATES" },
            { item: "Character (crushing/heavy/squeezing)", marks: 1, category: "SOCRATES" },
            { item: "Radiation (left arm, jaw, back)", marks: 2, category: "SOCRATES" },
            { item: "Associated features (SOB, nausea, sweating)", marks: 2, category: "SOCRATES" },
            { item: "Timing (continuous, duration)", marks: 1, category: "SOCRATES" },
            { item: "Exacerbating/relieving factors (GTN, position)", marks: 1, category: "SOCRATES" },
            { item: "Severity (numerical scale)", marks: 1, category: "SOCRATES" },
            { item: "Previous episodes of similar pain", marks: 2, category: "RED FLAGS" },
            { item: "Asks about palpitations/syncope", marks: 2, category: "RED FLAGS" },
          ],
        },
        {
          name: "Background History",
          nameAr: "التاريخ الطبي السابق",
          maxMarks: 8,
          criteria: [
            { item: "Past cardiac history (MI, angina, stents)", marks: 2, category: "PMH" },
            { item: "Cardiovascular risk factors (HTN, DM, hyperlipidaemia)", marks: 2, category: "PMH" },
            { item: "Current medications", marks: 2, category: "PMH" },
            { item: "Allergies specifically asked", marks: 1, category: "PMH" },
            { item: "Family history of cardiac disease", marks: 1, category: "FH" },
          ],
        },
        {
          name: "Social History",
          nameAr: "التاريخ الاجتماعي",
          maxMarks: 4,
          criteria: [
            { item: "Smoking (pack-years calculated)", marks: 2, category: "SH" },
            { item: "Alcohol consumption (units/week)", marks: 1, category: "SH" },
            { item: "Occupation (relevant to activities)", marks: 1, category: "SH" },
          ],
        },
        {
          name: "Communication Skills",
          nameAr: "مهارات التواصل",
          maxMarks: 4,
          criteria: [
            { item: "Introduces self and confirms patient identity", marks: 1, category: "COMM" },
            { item: "Uses open then closed questions", marks: 1, category: "COMM" },
            { item: "Empathic response to patient's distress", marks: 1, category: "COMM" },
            { item: "Summarises and checks understanding", marks: 1, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "The ideal approach: introduce yourself and gain consent. Use SOCRATES to characterise the chest pain systematically — eliciting central crushing character, radiation to left arm/jaw, associated diaphoresis, nausea and SOB. Identify cardiovascular risk factors (HTN, T2DM, hypercholesterolaemia, smoking 30 pack-years, family history of premature IHD). Ask about previous similar episodes (6 months of exertional tightness represents unstable angina). Check medications, allergies. Summarise findings. Differential: STEMI >> NSTEMI >> Aortic dissection >> PE.",
    },
    learningPoints: [
      "SOCRATES is the framework for any pain history",
      "Central crushing pain + radiation to arm/jaw + diaphoresis = ACS until proven otherwise",
      "Always ask about previous similar episodes — may reveal crescendo angina",
      "Pack-years = cigarettes/day ÷ 20 × years smoked",
      "ECG within 10 minutes of ACS presentation is mandatory",
    ],
    relatedTopics: ["ACS", "STEMI", "NSTEMI", "Troponin", "Killip Classification"],
    tags: ["cardiology", "chest-pain", "ACS", "emergency", "SOCRATES"],
  },

  {
    id: "IM-02",
    title: "Shortness of Breath — Heart Failure vs COPD",
    titleAr: "ضيق التنفس — فشل القلب مقابل COPD",
    specialty: "Internal Medicine",
    stationType: "history_taking",
    difficulty: "year4",
    durationMinutes: 8,
    patientBrief: "Mrs. Fatima Al-Rashidi, 72-year-old woman, presents to the medical assessment unit with a 3-day history of worsening breathlessness. She has a background of both heart and lung problems. Please take a history to determine the most likely cause.",
    patientName: "Fatima Al-Rashidi",
    patientAge: 72,
    patientSex: "F",
    patientSetting: "Medical Assessment Unit",
    patientPersona: {
      presentingComplaint: "Progressive breathlessness for 3 days, now breathless at rest",
      presentingComplaintAr: "ضيق تنفس متقدم منذ 3 أيام",
      onset: "Gradual over 3 days, worse at night",
      severity: "Cannot complete sentences",
      associatedSymptoms: [
        "Orthopnoea — needs 3 pillows (new, was 1 pillow)",
        "Paroxysmal nocturnal dyspnoea — woke up gasping last night",
        "Bilateral ankle swelling (worse than usual)",
        "Cough — frothy white sputum",
        "No fever, no pleuritic chest pain",
        "Weight gain 3kg in 2 weeks"
      ],
      pastMedicalHistory: ["Heart failure (LVEF 35% — echo 2 years ago)", "COPD GOLD II", "Atrial fibrillation", "Hypertension"],
      medications: ["Furosemide 40mg OD", "Bisoprolol 2.5mg OD", "Ramipril 5mg OD", "Apixaban 5mg BD", "Salbutamol PRN", "Tiotropium OD"],
      allergies: "None known",
      socialHistory: "Lives alone. Ex-smoker — stopped 10 years ago, 40 pack-years. Limited mobility, barely leaves house.",
      familyHistory: "Not relevant",
      systemsReview: {
        adherence: "Admits she ran out of furosemide 5 days ago and didn't get a repeat",
        diet: "Has been eating salty food this week (family visit)",
        infection: "No fever, no productive cough change, no coryzal symptoms"
      },
      personality: "cooperative",
      hiddenCues: [
        "Only reveals she ran out of diuretics if specifically asked about medication compliance",
        "Salty diet history revealed if asked about diet changes",
        "PND history only if directly asked about nocturnal breathing"
      ],
      physicalFindings: "RR 26, SpO2 89% on air (93% on 2L O2), HR 100 irregular, BP 145/90. Bibasal crackles. Bilateral pitting oedema to knees. JVP elevated 4cm."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Characterise Breathlessness",
          nameAr: "تحديد طبيعة ضيق التنفس",
          maxMarks: 12,
          criteria: [
            { item: "Onset and progression", marks: 1, category: "HPC" },
            { item: "Severity — exercise tolerance in specific terms", marks: 2, category: "HPC" },
            { item: "Orthopnoea — number of pillows", marks: 2, category: "HPC" },
            { item: "PND — nocturnal breathlessness", marks: 2, category: "HPC" },
            { item: "Ankle swelling — bilateral, pitting, extent", marks: 2, category: "HPC" },
            { item: "Cough and sputum character", marks: 1, category: "HPC" },
            { item: "Weight change", marks: 2, category: "HPC" },
          ],
        },
        {
          name: "Precipitating Factors",
          nameAr: "العوامل المُفضية",
          maxMarks: 8,
          criteria: [
            { item: "Medication adherence — ran out of diuretic", marks: 3, category: "PRECIPITANTS" },
            { item: "Dietary salt intake", marks: 2, category: "PRECIPITANTS" },
            { item: "Infective trigger — fever, sputum change", marks: 2, category: "PRECIPITANTS" },
            { item: "Chest pain or palpitations (ACS trigger)", marks: 1, category: "PRECIPITANTS" },
          ],
        },
        {
          name: "Background & Medications",
          nameAr: "الخلفية والأدوية",
          maxMarks: 6,
          criteria: [
            { item: "Known cardiac diagnosis and LVEF", marks: 2, category: "PMH" },
            { item: "Known COPD — GOLD stage, recent exacerbations", marks: 2, category: "PMH" },
            { item: "All current medications listed", marks: 2, category: "PMH" },
          ],
        },
        {
          name: "Communication",
          nameAr: "التواصل",
          maxMarks: 4,
          criteria: [
            { item: "Introduction and consent", marks: 1, category: "COMM" },
            { item: "Empathy for an elderly breathless patient", marks: 1, category: "COMM" },
            { item: "Allows patient to rest between questions", marks: 1, category: "COMM" },
            { item: "Clear summary at the end", marks: 1, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "Key clinical discriminators: Orthopnoea, PND and bilateral oedema point strongly to decompensated heart failure rather than COPD exacerbation. The critical finding is non-adherence to furosemide for 5 days — the single most likely precipitant. Approach: treat as acute pulmonary oedema (IV furosemide 40-80mg, sit upright, supplemental oxygen, monitor urine output). Investigate: CXR (pulmonary venous congestion, cardiomegaly), BNP/NT-proBNP, ECG, U&E, troponin.",
    },
    learningPoints: [
      "Orthopnoea and PND are specific for left heart failure",
      "Always ask about medication adherence — it is the commonest precipitant of decompensated HF",
      "Distinguish acute HF from COPD: HF → frothy sputum, bilateral crackles, elevated JVP | COPD → wheeze, hyperinflation, cor pulmonale",
      "BNP >400 strongly supports HF; <100 makes it unlikely",
      "Furosemide should be given IV in acute HF to bypass absorption issues",
    ],
    relatedTopics: ["Heart Failure", "COPD", "Pulmonary Oedema", "BNP", "Starling Curve"],
    tags: ["cardiology", "pulmonology", "breathlessness", "heart-failure", "COPD"],
  },

  {
    id: "IM-03",
    title: "Diabetic Patient — Routine Annual Review",
    titleAr: "مراجعة مريض السكري السنوية",
    specialty: "Internal Medicine",
    stationType: "communication",
    difficulty: "year3",
    durationMinutes: 8,
    patientBrief: "Mr. Abdullah Hassan, 45-year-old man with a 10-year history of Type 2 diabetes. His HbA1c today is 9.2% (was 8.1% last year). He has attended for his annual review. Please conduct the review and counsel him appropriately.",
    patientName: "Abdullah Hassan",
    patientAge: 45,
    patientSex: "M",
    patientSetting: "GP Practice",
    patientPersona: {
      presentingComplaint: "Annual diabetic review — HbA1c has increased",
      presentingComplaintAr: "مراجعة السكري السنوية",
      onset: "Diabetes diagnosed 10 years ago",
      severity: "Poor glycaemic control recently",
      associatedSymptoms: [
        "Increased thirst and urination for 3 months",
        "Fatigue",
        "Blurred vision (new onset)",
        "No chest pain, no breathlessness"
      ],
      pastMedicalHistory: ["Type 2 Diabetes Mellitus", "Hypertension", "Hyperlipidaemia"],
      medications: ["Metformin 1g BD", "Gliclazide 80mg OD", "Ramipril 10mg OD", "Atorvastatin 40mg OD"],
      allergies: "None",
      socialHistory: "Ramadan fasting — has been skipping insulin equivalent doses. Poor diet compliance. No exercise. Works night shifts.",
      familyHistory: "Mother had diabetes, died of stroke. Father has CAD.",
      systemsReview: {
        feet: "Numbness in both feet for 6 months — tingling at night",
        eyes: "New blurred vision — hasn't had an eye test this year",
        kidneys: "No known kidney issues",
        erectile: "Erectile dysfunction for 1 year (embarrassed to mention unless specifically asked)"
      },
      personality: "reluctant",
      hiddenCues: [
        "Fasting for Ramadan and skipping medications only revealed if asked about medication compliance",
        "Erectile dysfunction only mentioned if specifically asked about other symptoms",
        "Foot numbness mentioned if asked about feet or diabetes complications"
      ],
      physicalFindings: "BP 148/92 (target <130/80 in diabetes). BMI 31. Foot examination: reduced vibration sense bilaterally."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Diabetes History & Complications Screening",
          nameAr: "تاريخ السكري وفحص المضاعفات",
          maxMarks: 14,
          criteria: [
            { item: "Reviews HbA1c trend and asks about glycaemic symptoms", marks: 2, category: "REVIEW" },
            { item: "Medication review — doses, compliance, Ramadan adjustment", marks: 2, category: "REVIEW" },
            { item: "Asks about eyes — last retinal screening", marks: 2, category: "COMPLICATIONS" },
            { item: "Asks about feet — numbness, ulcers, footwear", marks: 2, category: "COMPLICATIONS" },
            { item: "Asks about kidneys — eGFR, microalbuminuria", marks: 2, category: "COMPLICATIONS" },
            { item: "Asks about cardiovascular symptoms", marks: 2, category: "COMPLICATIONS" },
            { item: "Asks about erectile dysfunction or other autonomic symptoms", marks: 2, category: "COMPLICATIONS" },
          ],
        },
        {
          name: "Management Discussion",
          nameAr: "مناقشة العلاج",
          maxMarks: 10,
          criteria: [
            { item: "Explains need to intensify glycaemic control", marks: 2, category: "MGMT" },
            { item: "Discusses medication escalation options (SGLT2i, GLP-1)", marks: 3, category: "MGMT" },
            { item: "BP target in diabetes (<130/80) and adjustment", marks: 2, category: "MGMT" },
            { item: "Referral to ophthalmology for blurred vision", marks: 2, category: "MGMT" },
            { item: "Foot care advice and referral to podiatry", marks: 1, category: "MGMT" },
          ],
        },
        {
          name: "Lifestyle & Education",
          nameAr: "نمط الحياة والتعليم",
          maxMarks: 2,
          criteria: [
            { item: "Diet and exercise counselling", marks: 1, category: "LIFESTYLE" },
            { item: "DVLA notification if applicable (group 2 licence)", marks: 1, category: "LIFESTYLE" },
          ],
        },
        {
          name: "Communication",
          nameAr: "التواصل",
          maxMarks: 4,
          criteria: [
            { item: "Non-judgemental approach to poor control", marks: 2, category: "COMM" },
            { item: "Patient-centred shared decision making", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "Annual review checklist: HbA1c 9.2% — needs treatment escalation. Identify WHY it has worsened (Ramadan fasting, non-compliance, night shifts, poor diet). Screen ALL complications systematically. New blurred vision → urgent ophthalmology (possible diabetic retinopathy). Foot numbness → podiatry referral + foot care education. Erectile dysfunction → counselling + PDE5 inhibitor discussion. BP 148/92 → above target for diabetes, consider increasing Ramipril or adding amlodipine. Consider adding SGLT2i (empagliflozin) for cardiovascular/renal protection.",
    },
    learningPoints: [
      "NICE DM annual review: HbA1c, BP, cholesterol, eGFR, urine ACR, eyes, feet, weight, smoking",
      "HbA1c target: <48mmol/mol (6.5%) newly diagnosed, <58mmol/mol (7.5%) on drugs with hypoglycaemia risk",
      "SGLT2i reduces cardiovascular mortality and hospitalisation in T2DM with CVD",
      "Diabetic retinopathy: annual screening. Most common cause of blindness in working-age adults",
      "Ramadan fasting: all patients on diabetes medications need review before Ramadan",
    ],
    relatedTopics: ["HbA1c", "Diabetes Complications", "SGLT2i", "Diabetic Retinopathy", "Diabetic Foot"],
    tags: ["diabetes", "endocrinology", "annual-review", "communication", "GP"],
  },

  {
    id: "IM-09",
    title: "Communicating a New Diagnosis of Cancer",
    titleAr: "إبلاغ المريض بتشخيص السرطان الجديد",
    specialty: "Internal Medicine",
    stationType: "communication",
    difficulty: "finals",
    durationMinutes: 10,
    patientBrief: "Mr. James McCarthy, 67-year-old retired teacher. He attended 3 weeks ago with haematuria and weight loss. His CT scan today shows a 4cm right renal mass with no metastases. The radiologist report suggests renal cell carcinoma. He has come in today for the results. Please break this news sensitively.",
    patientName: "James McCarthy",
    patientAge: 67,
    patientSex: "M",
    patientSetting: "Urology Outpatient Clinic",
    patientPersona: {
      presentingComplaint: "Attending for scan results",
      presentingComplaintAr: "حضور لنتائج الفحوصات",
      onset: "Haematuria noticed 6 weeks ago",
      severity: "Painless haematuria, 5kg weight loss",
      associatedSymptoms: ["Fatigue", "Mild right flank discomfort"],
      pastMedicalHistory: ["Hypertension", "Ex-smoker"],
      medications: ["Amlodipine 5mg OD"],
      allergies: "None",
      socialHistory: "Married, 3 adult children. Recently retired. Very active. Plans to go on holiday next month.",
      familyHistory: "No cancer history",
      systemsReview: {},
      personality: "anxious",
      hiddenCues: [
        "Will ask if it is cancer directly after being told there is something wrong",
        "Will become upset and ask about prognosis and treatment options",
        "Will ask if he can still go on holiday"
      ],
      physicalFindings: "Not applicable — this is a communication station"
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Breaking Bad News — SPIKES Framework",
          nameAr: "إيصال الأخبار السيئة — نموذج SPIKES",
          maxMarks: 18,
          criteria: [
            { item: "Setting: private room, sits at same level, turns off phone", marks: 2, category: "SPIKES-S" },
            { item: "Perception: 'What do you understand about why you came today?'", marks: 2, category: "SPIKES-P" },
            { item: "Invitation: 'Are you happy for me to share the results with you today?'", marks: 2, category: "SPIKES-I" },
            { item: "Knowledge: Warning shot — 'I'm afraid the news is not what we hoped for'", marks: 2, category: "SPIKES-K" },
            { item: "Knowledge: Gives diagnosis clearly — renal mass suspicious for cancer", marks: 3, category: "SPIKES-K" },
            { item: "Knowledge: Avoids jargon, checks understanding", marks: 2, category: "SPIKES-K" },
            { item: "Empathy: Responds to patient's emotion with empathy", marks: 3, category: "SPIKES-E" },
            { item: "Strategy: Outlines next steps (MDT, urology surgeon, staging)", marks: 2, category: "SPIKES-S" },
          ],
        },
        {
          name: "Responding to Questions",
          nameAr: "الإجابة على الأسئلة",
          maxMarks: 8,
          criteria: [
            { item: "Honest about diagnosis when asked 'Is it cancer?'", marks: 2, category: "QUESTIONS" },
            { item: "Appropriate response to prognosis question — does not give statistics", marks: 2, category: "QUESTIONS" },
            { item: "Holiday — sensitively discusses priority of treatment", marks: 2, category: "QUESTIONS" },
            { item: "Offers to involve family if patient wishes", marks: 2, category: "QUESTIONS" },
          ],
        },
        {
          name: "Communication & Professionalism",
          nameAr: "التواصل والمهنية",
          maxMarks: 4,
          criteria: [
            { item: "Appropriate pace — allows silence after difficult information", marks: 2, category: "COMM" },
            { item: "Written information offered, follow-up appointment arranged", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "Use SPIKES framework: SET UP (private room, no interruptions, offer to bring a relative). PERCEPTION (what does he know already). INVITATION (ask permission). KNOWLEDGE (warning shot then clear but compassionate delivery: 'The scan has shown an abnormality in your right kidney which we believe may be a cancer'). EMPATHY (silence, tissue, 'This is clearly very difficult news'). STRATEGY (MDT meeting this week, urology surgeon referral, staging CT, curative surgery is likely given localised disease). Key errors: avoiding the word 'cancer', giving specific survival statistics, not checking understanding.",
    },
    learningPoints: [
      "SPIKES: Setting, Perception, Invitation, Knowledge, Empathy, Strategy",
      "Always give a warning shot before bad news — it prepares the patient cognitively",
      "Use the word 'cancer' when directly asked — avoiding it causes more distress",
      "Localised RCC (no metastases) — 5-year survival >80% with nephrectomy",
      "Never give statistics without knowing what the patient wants to hear",
    ],
    relatedTopics: ["Breaking Bad News", "SPIKES", "Renal Cell Carcinoma", "MDT", "Communication Skills"],
    tags: ["oncology", "communication", "breaking-bad-news", "SPIKES", "cancer"],
  },

  // ══════════════════════════════════════════════════════
  // CARDIOLOGY
  // ══════════════════════════════════════════════════════
  {
    id: "CARD-01",
    title: "STEMI — Initial Management (Data Interpretation)",
    titleAr: "احتشاء STEMI — الإدارة الأولية (تفسير البيانات)",
    specialty: "Cardiology",
    stationType: "data_interpretation",
    difficulty: "finals",
    durationMinutes: 8,
    patientBrief: "A 55-year-old man presents to the ED with 90 minutes of crushing central chest pain. He is diaphoretic and pale. His ECG shows ST elevation of 3mm in leads V1-V4 with reciprocal changes in the inferior leads. BP 100/65, HR 105, SpO2 95%. Please manage this patient.",
    patientName: "Clinical Scenario",
    patientAge: 55,
    patientSex: "M",
    patientSetting: "Emergency Department — Resuscitation Bay",
    patientPersona: {
      presentingComplaint: "Crushing central chest pain, 90 minutes, diaphoretic",
      presentingComplaintAr: "ألم صدري ضاغط مركزي منذ 90 دقيقة",
      onset: "90 minutes ago",
      severity: "Severe — cardiogenic shock signs developing",
      associatedSymptoms: ["Diaphoresis", "Nausea", "Hypotension BP 100/65"],
      pastMedicalHistory: ["Hypertension", "Smoker"],
      medications: ["Amlodipine"],
      allergies: "None known",
      socialHistory: "Active smoker",
      familyHistory: "Father — MI at 52",
      systemsReview: {},
      personality: "anxious",
      hiddenCues: ["No contraindications to thrombolysis or PCI if asked"],
      physicalFindings: "Pale, diaphoretic. BP 100/65 bilaterally. HR 105 regular. Quiet heart sounds, no murmur. Chest clear. ECG: ST elevation V1-V4, reciprocal changes II/III/aVF."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Immediate Recognition & Activation",
          nameAr: "التعرف الفوري والتفعيل",
          maxMarks: 8,
          criteria: [
            { item: "Correctly identifies anterior STEMI from ECG", marks: 3, category: "DIAGNOSIS" },
            { item: "Activates cath lab / calls interventional cardiology immediately", marks: 2, category: "SYSTEM" },
            { item: "Calls senior and documents decision-to-balloon target <90min", marks: 3, category: "SYSTEM" },
          ],
        },
        {
          name: "Immediate Treatment",
          nameAr: "العلاج الفوري",
          maxMarks: 12,
          criteria: [
            { item: "Aspirin 300mg loading dose", marks: 2, category: "ANTIPLATELET" },
            { item: "P2Y12 inhibitor (ticagrelor 180mg or clopidogrel 600mg)", marks: 2, category: "ANTIPLATELET" },
            { item: "Anticoagulation (UFH or LMWH)", marks: 2, category: "ANTICOAGULATION" },
            { item: "Oxygen only if SpO2 <94%", marks: 1, category: "SUPPORTIVE" },
            { item: "IV access x2, bloods (Troponin, FBC, U&E, coagulation, group and save)", marks: 2, category: "INVESTIGATIONS" },
            { item: "Morphine/diamorphine for pain relief with antiemetic", marks: 1, category: "ANALGESIA" },
            { item: "12-lead ECG and continuous monitoring", marks: 2, category: "MONITORING" },
          ],
        },
        {
          name: "Complications Recognition",
          nameAr: "التعرف على المضاعفات",
          maxMarks: 6,
          criteria: [
            { item: "Recognises developing cardiogenic shock (BP 100/65, tachycardia)", marks: 3, category: "COMPLICATIONS" },
            { item: "Appropriate fluid challenge with caution (hypotension + clear chest)", marks: 3, category: "COMPLICATIONS" },
          ],
        },
        {
          name: "Communication",
          nameAr: "التواصل",
          maxMarks: 4,
          criteria: [
            { item: "Explains diagnosis and treatment plan to patient", marks: 2, category: "COMM" },
            { item: "Gains consent for PCI", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "Anterior STEMI management: IMMEDIATE — call cath lab, aim door-to-balloon <90 minutes. DUAL ANTIPLATELET: Aspirin 300mg + Ticagrelor 180mg (preferred over clopidogrel in STEMI). ANTICOAGULATION: UFH bolus 5000 units. ANALGESIA: IV morphine 2.5-5mg + metoclopramide. OXYGEN: only if SpO2 <94% (hyperoxia is harmful). INVESTIGATIONS: 12-lead ECG, continuous monitoring, IV access, urgent bloods. NOTES: Do NOT give nitrates in hypotension (SBP <90). Cardiogenic shock present — fluid cautiously, consider IABP/PCI urgently.",
    },
    learningPoints: [
      "Door-to-balloon time target: <90 minutes for STEMI — this is a SYSTEM emergency",
      "Ticagrelor is preferred over clopidogrel in STEMI (PLATO trial: reduced CV death)",
      "Oxygen is NOT routinely given in ACS — only if SpO2 <94% (AVOID-HF trial)",
      "Cardiogenic shock: systolic BP <90, HR>100, cool extremities — mortality 40-50%",
      "STEMI ECG: ST elevation >1mm in 2 contiguous limb leads OR >2mm in precordial leads",
    ],
    relatedTopics: ["STEMI", "PCI", "Dual Antiplatelet Therapy", "Cardiogenic Shock", "ECG Interpretation"],
    tags: ["cardiology", "STEMI", "ACS", "emergency", "ECG", "data-interpretation"],
  },

  // ══════════════════════════════════════════════════════
  // RESPIRATORY
  // ══════════════════════════════════════════════════════
  {
    id: "RESP-01",
    title: "Asthma Exacerbation — Assessment & Management",
    titleAr: "تفاقم الربو — التقييم والعلاج",
    specialty: "Respiratory",
    stationType: "mixed",
    difficulty: "year4",
    durationMinutes: 8,
    patientBrief: "Miss Lara Nasser, 24-year-old student, has been brought to the ED by ambulance. She has had worsening wheeze and breathlessness for 6 hours. She looks distressed. PEFR on arrival: 40% of predicted. She has known asthma. Please assess and manage her.",
    patientName: "Lara Nasser",
    patientAge: 24,
    patientSex: "F",
    patientSetting: "Emergency Department",
    patientPersona: {
      presentingComplaint: "Wheeze and breathlessness for 6 hours, getting worse",
      presentingComplaintAr: "صفير وضيق تنفس منذ 6 ساعات",
      onset: "6 hours ago, triggered by cat exposure at a party",
      severity: "Cannot complete sentences, RR 28",
      associatedSymptoms: ["Cannot complete sentences", "Accessory muscle use", "Tachycardia HR 115"],
      pastMedicalHistory: ["Asthma since age 8", "Previous ICU admission 2 years ago"],
      medications: ["Salbutamol MDI PRN", "Beclomethasone 200mcg BD (admits poor adherence)", "Montelukast 10mg OD"],
      allergies: "Cats (trigger), Aspirin (avoid)",
      socialHistory: "University student. Smokes 5/day. Cat at friend's house triggered attack.",
      familyHistory: "Mother has asthma. Father has eczema.",
      systemsReview: {
        icu_history: "Admitted to ICU 2 years ago for severe asthma — intubated for 2 days",
        previous_attacks: "4 ED visits in past year",
        salbutamol_use: "Using salbutamol >3 times per day for past month"
      },
      personality: "anxious",
      hiddenCues: [
        "Previous ICU admission (near-fatal attack) only revealed if asked about hospitalisation history",
        "Aspirin allergy only if directly asked",
        "Poor ICS adherence revealed if asked about regular preventer inhaler use"
      ],
      physicalFindings: "SpO2 91% on air, RR 28, HR 115, BP 118/74. Diffuse wheeze throughout. PEFR 40% predicted. Silent chest would indicate life-threatening. Accessory muscle use present."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Severity Assessment",
          nameAr: "تقييم الشدة",
          maxMarks: 10,
          criteria: [
            { item: "PEFR 40% → identifies as ACUTE SEVERE asthma", marks: 2, category: "SEVERITY" },
            { item: "Assesses speech — cannot complete sentences", marks: 1, category: "SEVERITY" },
            { item: "Checks for life-threatening features (silent chest, cyanosis, exhaustion, PEFR<33%)", marks: 3, category: "SEVERITY" },
            { item: "HR, RR, SpO2 measured", marks: 2, category: "SEVERITY" },
            { item: "Asks about previous near-fatal attacks (ICU/intubation)", marks: 2, category: "SEVERITY" },
          ],
        },
        {
          name: "Immediate Management",
          nameAr: "الإدارة الفورية",
          maxMarks: 14,
          criteria: [
            { item: "Oxygen to maintain SpO2 94-98%", marks: 2, category: "TREATMENT" },
            { item: "Salbutamol 5mg nebulised (back-to-back if severe)", marks: 3, category: "TREATMENT" },
            { item: "Ipratropium bromide 0.5mg nebulised", marks: 2, category: "TREATMENT" },
            { item: "Prednisolone 40-50mg oral or hydrocortisone 100mg IV", marks: 3, category: "TREATMENT" },
            { item: "IV access and bloods (ABG, FBC, CRP)", marks: 2, category: "INVESTIGATIONS" },
            { item: "CXR to exclude pneumothorax", marks: 2, category: "INVESTIGATIONS" },
          ],
        },
        {
          name: "Escalation Planning",
          nameAr: "تصعيد العلاج",
          maxMarks: 2,
          criteria: [
            { item: "Knows when to call anaesthetics (life-threatening features, deterioration)", marks: 2, category: "ESCALATION" },
          ],
        },
        {
          name: "Communication",
          nameAr: "التواصل",
          maxMarks: 4,
          criteria: [
            { item: "Explains management plan clearly despite distress", marks: 2, category: "COMM" },
            { item: "Arranges repeat PEFR in 15-30 minutes", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "ACUTE SEVERE ASTHMA (PEFR 33-50%): Immediate Rx — high-flow O2 to SpO2 94-98%, back-to-back salbutamol nebulisers 5mg, ipratropium 0.5mg, systemic corticosteroid (prednisolone 40mg oral). LIFE-THREATENING features to check: PEFR <33%, SpO2 <92%, silent chest, cyanosis, bradycardia, exhaustion, altered consciousness. If life-threatening: call anaesthetics, consider IV magnesium sulphate 1.2-2g over 20 minutes, ITU referral.",
    },
    learningPoints: [
      "Acute severe: PEFR 33-50%, can't complete sentences, HR >110, RR >25",
      "Life-threatening: PEFR <33%, SpO2 <92%, silent chest, cyanosis, exhaustion",
      "Magnesium sulphate 1.2-2g IV over 20min: evidence-based for severe/life-threatening asthma",
      "ICU/previous intubation = high risk patient — lower threshold for HDU/ICU",
      "Always do CXR: exclude pneumothorax (rare but life-threatening in asthma)",
    ],
    relatedTopics: ["Asthma", "BTS Asthma Guidelines", "PEFR", "Nebulisers", "Status Asthmaticus"],
    tags: ["respiratory", "asthma", "emergency", "PEFR", "severity"],
  },

  // ══════════════════════════════════════════════════════
  // NEUROLOGY
  // ══════════════════════════════════════════════════════
  {
    id: "NEURO-01",
    title: "Stroke Assessment — FAST, NIHSS, Thrombolysis Decision",
    titleAr: "تقييم السكتة الدماغية — FAST وNIHSS وقرار التخثر",
    specialty: "Neurology",
    stationType: "mixed",
    difficulty: "finals",
    durationMinutes: 10,
    patientBrief: "A 72-year-old woman has been brought by ambulance after sudden onset of right-sided weakness and slurred speech. Time of onset was 90 minutes ago. CT head shows no haemorrhage. Please assess this patient and decide on management including whether she is a candidate for thrombolysis.",
    patientName: "Margaret O'Brien",
    patientAge: 72,
    patientSex: "F",
    patientSetting: "Stroke Unit — Thrombolysis Suite",
    patientPersona: {
      presentingComplaint: "Sudden right arm weakness and slurred speech",
      presentingComplaintAr: "ضعف مفاجئ في الذراع اليمنى وتعثر الكلام",
      onset: "90 minutes ago, witnessed by husband",
      severity: "Unable to lift right arm, aphasia present",
      associatedSymptoms: ["Right facial droop", "Right arm weakness (0/5)", "Right leg weakness (3/5)", "Expressive aphasia", "No headache", "No vomiting"],
      pastMedicalHistory: ["Atrial fibrillation (on aspirin — NOT anticoagulated)", "Hypertension", "Hyperlipidaemia"],
      medications: ["Aspirin 75mg OD", "Amlodipine 10mg OD", "Atorvastatin 40mg OD"],
      allergies: "None",
      socialHistory: "Lives with husband. Independent. Ex-smoker.",
      familyHistory: "Not relevant",
      systemsReview: {
        bleeding_history: "No recent surgery, no GI bleeding, no haematuria",
        anticoagulants: "Not on warfarin or NOAC — important for thrombolysis eligibility",
        previous_stroke: "TIA 3 years ago — fully recovered"
      },
      personality: "cooperative",
      hiddenCues: [
        "Not on anticoagulants — crucial for thrombolysis decision, stated if asked about blood thinners",
        "Previous TIA mentioned if asked about previous neurological events",
        "BP on arrival 185/110 — above safe threshold for thrombolysis, needs to be lowered first"
      ],
      physicalFindings: "BP 185/110 (BOTH ARMS). HR 88 irregular (AF). Right facial droop. Right arm 0/5, right leg 3/5. Expressive aphasia present. NIHSS = 14. CT head: no haemorrhage, no established infarct."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Acute Stroke Assessment",
          nameAr: "تقييم السكتة الدماغية الحادة",
          maxMarks: 10,
          criteria: [
            { item: "Time of onset established accurately", marks: 2, category: "ASSESSMENT" },
            { item: "NIHSS or equivalent neurological assessment performed", marks: 3, category: "ASSESSMENT" },
            { item: "CT head result reviewed — no haemorrhage confirmed", marks: 2, category: "ASSESSMENT" },
            { item: "Blood glucose checked (hypoglycaemia excluded)", marks: 2, category: "ASSESSMENT" },
            { item: "BP measured bilaterally (aortic dissection exclusion)", marks: 1, category: "ASSESSMENT" },
          ],
        },
        {
          name: "Thrombolysis Decision",
          nameAr: "قرار العلاج بالمذيبات",
          maxMarks: 12,
          criteria: [
            { item: "Time window: onset <4.5 hours — eligible", marks: 2, category: "THROMBOLYSIS" },
            { item: "No contraindications checked: no haemorrhage, no recent surgery, no haemorrhagic stroke", marks: 2, category: "THROMBOLYSIS" },
            { item: "Not on anticoagulants — checked and eligible", marks: 2, category: "THROMBOLYSIS" },
            { item: "BP must be <185/110 before alteplase — needs IV labetalol/nicardipine", marks: 3, category: "THROMBOLYSIS" },
            { item: "Alteplase dose: 0.9mg/kg, max 90mg, 10% as bolus, 90% over 60min", marks: 3, category: "THROMBOLYSIS" },
          ],
        },
        {
          name: "Supportive Care & MDT",
          nameAr: "الرعاية الداعمة والفريق متعدد التخصصات",
          maxMarks: 4,
          criteria: [
            { item: "Aspirin 300mg deferred until after thrombolysis", marks: 2, category: "SUPPORTIVE" },
            { item: "Stroke team / neurology notified, CT angiography if available", marks: 2, category: "SUPPORTIVE" },
          ],
        },
        {
          name: "Communication",
          nameAr: "التواصل",
          maxMarks: 4,
          criteria: [
            { item: "Explains risks and benefits of thrombolysis to patient/family", marks: 2, category: "COMM" },
            { item: "Gains informed consent for thrombolysis", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "ACUTE ISCHAEMIC STROKE: Onset 90min, window <4.5h → ELIGIBLE for thrombolysis. BP 185/110 → ABOVE THRESHOLD (must be <185/110 before alteplase). Lower with IV labetalol 10mg over 2min or nicardipine infusion. Once BP <185/110: Alteplase 0.9mg/kg (max 90mg) — 10% as IV bolus over 1min, remaining 90% IV over 60min. DO NOT give aspirin until 24h post-thrombolysis (risk of haemorrhagic transformation). NOT on anticoagulants → eligible. Discuss mechanical thrombectomy if large vessel occlusion on CTA.",
    },
    learningPoints: [
      "Alteplase window: <4.5 hours from onset (if >4.5h, thrombectomy if eligible)",
      "BP must be <185/110 BEFORE thrombolysis — actively lower it",
      "Do NOT give aspirin until 24 hours after thrombolysis",
      "Warfarin/NOAC within therapeutic range = contraindication to thrombolysis",
      "NIHSS: 0-42 scale. 0 = no stroke; 42 = worst. Score <4 may not benefit from lysis",
    ],
    relatedTopics: ["Ischaemic Stroke", "Alteplase", "NIHSS", "Thrombectomy", "AF and Stroke"],
    tags: ["neurology", "stroke", "thrombolysis", "emergency", "NIHSS"],
  },

  // ══════════════════════════════════════════════════════
  // PSYCHIATRY
  // ══════════════════════════════════════════════════════
  {
    id: "PSY-02",
    title: "Suicidal Risk Assessment",
    titleAr: "تقييم خطر الانتحار",
    specialty: "Psychiatry",
    stationType: "history_taking",
    difficulty: "finals",
    durationMinutes: 10,
    patientBrief: "Miss Sarah Chen, 28-year-old teacher, has been brought to ED after taking 20 paracetamol tablets 3 hours ago. She has been medically cleared and the paracetamol level is below the treatment line. Please conduct a psychiatric risk assessment.",
    patientName: "Sarah Chen",
    patientAge: 28,
    patientSex: "F",
    patientSetting: "Emergency Department — Side Room",
    patientPersona: {
      presentingComplaint: "Paracetamol overdose — 20 tablets 3 hours ago",
      presentingComplaintAr: "جرعة زائدة من الباراسيتامول",
      onset: "Took tablets after argument with boyfriend who broke up with her",
      severity: "Described wanting to die, now 'just wants to go home'",
      associatedSymptoms: ["Low mood for 3 months", "Poor sleep", "Not eating", "Crying daily", "Lost interest in work"],
      pastMedicalHistory: ["Depression — treated 2 years ago, discharged from CMHT", "No previous suicide attempts"],
      medications: ["None currently"],
      allergies: "None",
      socialHistory: "Lives alone since boyfriend left. No close friends locally. Parents abroad. Works as teacher. Recently signed off sick.",
      familyHistory: "Father had depression. Uncle died by suicide.",
      systemsReview: {
        intent: "Took tablets impulsively after argument. Found by flatmate who called 999.",
        planning: "No note left. Had bought tablets that morning.",
        method_lethality: "Took 20x500mg paracetamol — intended to die",
        rescue: "Was not expecting to be found — flatmate came home early",
        current_thoughts: "Says she doesn't want to die now but feels hopeless about future"
      },
      personality: "reluctant",
      hiddenCues: [
        "Only reveals she bought the tablets that morning if specifically asked about pre-planning",
        "States she wasn't expecting to be found only if asked whether she thought anyone would find her",
        "Family history of uncle dying by suicide only if asked about family mental health",
        "Hopelessness about future revealed if asked about what tomorrow will be like"
      ],
      physicalFindings: "Tearful, making eye contact intermittently. Alert and oriented. No psychotic features on MSE."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Risk Assessment — INTENT & LETHALITY",
          nameAr: "تقييم الخطورة — النية والخطورة",
          maxMarks: 14,
          criteria: [
            { item: "Establishes precipitating event (relationship breakdown)", marks: 2, category: "INTENT" },
            { item: "Explores degree of intent — wanted to die vs cry for help", marks: 3, category: "INTENT" },
            { item: "Pre-planning: bought tablets same day (high risk)", marks: 3, category: "PLANNING" },
            { item: "Rescue factors: not expecting to be found (high risk)", marks: 3, category: "PLANNING" },
            { item: "Lethality of method: 20 paracetamol — serious", marks: 3, category: "LETHALITY" },
          ],
        },
        {
          name: "Ongoing Risk & Protective Factors",
          nameAr: "المخاطر المستمرة والعوامل الوقائية",
          maxMarks: 8,
          criteria: [
            { item: "Current suicidal ideation — active thoughts now?", marks: 2, category: "CURRENT" },
            { item: "Hopelessness — future orientation", marks: 2, category: "CURRENT" },
            { item: "Social support — lives alone, parents abroad (high risk)", marks: 2, category: "PROTECTIVE" },
            { item: "Family history of suicide (Uncle)", marks: 2, category: "RISK FACTORS" },
          ],
        },
        {
          name: "Underlying Psychiatric Illness",
          nameAr: "الاضطراب النفسي الكامن",
          maxMarks: 4,
          criteria: [
            { item: "PHQ-9 equivalent: elicits depressive symptoms for 3 months", marks: 2, category: "DIAGNOSIS" },
            { item: "Previous psychiatric history and treatment", marks: 2, category: "DIAGNOSIS" },
          ],
        },
        {
          name: "Communication & Disposition",
          nameAr: "التواصل والقرار",
          maxMarks: 4,
          criteria: [
            { item: "Non-judgemental, empathic approach throughout", marks: 2, category: "COMM" },
            { item: "Concludes with clear disposition (admission recommended given HIGH risk)", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "HIGH RISK — should not be discharged. Risk factors: serious intent (wanted to die), high lethality method, pre-planned (bought tablets same morning), not expecting to be found, lives alone, no local support, hopelessness, family history of suicide, underlying depression. Protective factors: no current ideation expressed, previous recovery from depression. DISPOSITION: psychiatric admission under Mental Health Act assessment if she refuses. Safety planning inadequate alone. Crisis team not sufficient. Notify consultant psychiatrist.",
    },
    learningPoints: [
      "Risk factors for completed suicide: male sex, older age, previous attempts, living alone, hopelessness, alcohol",
      "Pre-planning + not expecting rescue = high lethality intent",
      "Hopelessness is a better predictor of suicide than depression severity",
      "A 'cry for help' does not mean low risk — many completers had previous attempts",
      "Family history of suicide is an independent risk factor",
    ],
    relatedTopics: ["Suicide Risk Assessment", "Depression", "Mental State Examination", "Mental Health Act", "Safety Planning"],
    tags: ["psychiatry", "suicide", "risk-assessment", "overdose", "depression"],
  },

  // ══════════════════════════════════════════════════════
  // PEDIATRICS
  // ══════════════════════════════════════════════════════
  {
    id: "PEDS-01",
    title: "Febrile Child — Sepsis Red Flags Assessment",
    titleAr: "الطفل المحموم — تقييم علامات التحذير من الإنتان",
    specialty: "Pediatrics",
    stationType: "history_taking",
    difficulty: "year4",
    durationMinutes: 8,
    patientBrief: "Mrs. Amina Farouk has brought her 18-month-old son Yusuf to the ED. He has had a fever of 39.5°C for 24 hours and has become more unwell in the last 2 hours. He is irritable and not feeding. Please take a history and assess the severity.",
    patientName: "Yusuf Farouk (18 months)",
    patientAge: 1,
    patientSex: "M",
    patientSetting: "Paediatric Emergency Department",
    patientPersona: {
      presentingComplaint: "Fever 39.5°C for 24 hours, increasingly irritable",
      presentingComplaintAr: "حمى 39.5 درجة لمدة 24 ساعة، توتر متزايد",
      onset: "Started yesterday, got worse this morning",
      severity: "High-pitched cry, not feeding, hard to rouse",
      associatedSymptoms: [
        "High-pitched cry for last 2 hours (new)",
        "Not drinking or feeding since this morning",
        "1 wet nappy in last 6 hours (reduced from normal 6/day)",
        "Vomited twice",
        "Rash appeared 1 hour ago — small purple/red spots on trunk"
      ],
      pastMedicalHistory: ["Born at term, no significant neonatal history", "All vaccinations up to date"],
      medications: ["Paracetamol 120mg given 4 hours ago", "Ibuprofen 50mg given 2 hours ago"],
      allergies: "None",
      socialHistory: "Lives with both parents. No nursery contact. Brother had a cold 1 week ago.",
      familyHistory: "None significant",
      systemsReview: {
        rash: "Appearing in last hour — described as 'like little bruises' — NON-BLANCHING",
        fontanelle: "Anterior fontanelle appears bulging to mother",
        photophobia: "Crying more with lights (uncertain if true photophobia)",
        neck: "Difficult to assess as child very irritable"
      },
      personality: "anxious",
      hiddenCues: [
        "Non-blanching rash revealed when specifically asked about any rash or skin changes",
        "Bulging fontanelle mentioned if asked about the soft spot on the head",
        "High-pitched cry duration only if asked exactly when this started"
      ],
      physicalFindings: "T 39.8°C, HR 178, RR 42, SpO2 96%. Mottled skin. Petechial/purpuric rash on trunk — non-blanching. Fontanelle bulging. VERY IRRITABLE. Meningococcal septicaemia until proven otherwise."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Red Flag Identification",
          nameAr: "تحديد العلامات الحمراء",
          maxMarks: 14,
          criteria: [
            { item: "Asks about and identifies non-blanching rash", marks: 4, category: "RED FLAGS" },
            { item: "Asks about and identifies high-pitched cry", marks: 2, category: "RED FLAGS" },
            { item: "Identifies poor perfusion signs (mottling, reduced urine output)", marks: 2, category: "RED FLAGS" },
            { item: "Asks about bulging fontanelle", marks: 2, category: "RED FLAGS" },
            { item: "Identifies reduced fluid intake/output (dehydration)", marks: 2, category: "RED FLAGS" },
            { item: "Asks about photophobia/neck stiffness (meningism)", marks: 2, category: "RED FLAGS" },
          ],
        },
        {
          name: "Fever Assessment",
          nameAr: "تقييم الحمى",
          maxMarks: 6,
          criteria: [
            { item: "Duration of fever and temperature measured", marks: 1, category: "FEVER" },
            { item: "Response to antipyretics", marks: 1, category: "FEVER" },
            { item: "Identifies fever >5 days as NICE amber flag", marks: 2, category: "FEVER" },
            { item: "Vaccination status checked", marks: 2, category: "FEVER" },
          ],
        },
        {
          name: "Recognises Severity & Acts Urgently",
          nameAr: "يتعرف على الخطورة ويتصرف بسرعة",
          maxMarks: 6,
          criteria: [
            { item: "States this is an emergency — probable meningococcal disease", marks: 3, category: "RECOGNITION" },
            { item: "Calls senior/paediatric consultant immediately", marks: 2, category: "RECOGNITION" },
            { item: "States immediate IV/IO benzylpenicillin or ceftriaxone", marks: 1, category: "TREATMENT" },
          ],
        },
        {
          name: "Communication with Parent",
          nameAr: "التواصل مع الأهل",
          maxMarks: 4,
          criteria: [
            { item: "Empathic, calm approach to anxious mother", marks: 2, category: "COMM" },
            { item: "Explains seriousness clearly without causing panic", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "NON-BLANCHING RASH IN A SICK CHILD = MENINGOCOCCAL SEPTICAEMIA UNTIL PROVEN OTHERWISE. DO NOT DELAY ANTIBIOTICS. Immediate: IV access + IV benzylpenicillin 300mg/kg (or IM if no access) / IV ceftriaxone. Sepsis 6 bundle. Urgent bloods: FBC, CRP, blood cultures, coag, glucose, lactate. LP ONLY after CT and clinical stabilisation if safe. Notify consultant. ITU referral if deteriorating. Parents: honest explanation — serious bacterial infection, emergency treatment started.",
    },
    learningPoints: [
      "Non-blanching rash + fever = meningococcal disease — antibiotics BEFORE LP",
      "NICE traffic light system: Red features = immediate referral (non-blanching rash, bulging fontanelle, neck stiffness, high-pitched cry)",
      "Benzylpenicillin pre-hospital if suspected meningococcal disease and GP has it",
      "Glass test: press a glass against rash — if it blanches = NOT purpuric; if it doesn't = purpuric = emergency",
      "Meningococcal vaccine (MenACWY): given at 14 years. MenB: given at 2 months",
    ],
    relatedTopics: ["Meningococcal Disease", "Sepsis in Children", "NICE Fever Guidelines", "Glass Test", "Sepsis 6"],
    tags: ["pediatrics", "fever", "sepsis", "meningitis", "emergency", "rash"],
  },

  // ══════════════════════════════════════════════════════
  // EMERGENCY MEDICINE
  // ══════════════════════════════════════════════════════
  {
    id: "EM-01",
    title: "Anaphylaxis — Recognition & Adrenaline Administration",
    titleAr: "التحسس الشديد — التعرف وإعطاء الأدرينالين",
    specialty: "Emergency Medicine",
    stationType: "procedure",
    difficulty: "year4",
    durationMinutes: 8,
    patientBrief: "A 25-year-old man has been brought into the ED 10 minutes after eating at a restaurant. He developed sudden urticaria, facial swelling, throat tightness and difficulty breathing. He is conscious but distressed. Stridor is audible. Please manage this emergency.",
    patientName: "Daniel Ward",
    patientAge: 25,
    patientSex: "M",
    patientSetting: "Emergency Department — Resuscitation Bay",
    patientPersona: {
      presentingComplaint: "Throat tightness, difficulty breathing, facial swelling after eating",
      presentingComplaintAr: "ضيق في الحلق وصعوبة تنفس وتورم وجه بعد الأكل",
      onset: "10 minutes ago at restaurant",
      severity: "Stridor, BP 82/50, HR 128",
      associatedSymptoms: ["Stridor", "Generalised urticaria", "Angioedema of lips and tongue", "Nausea", "Feeling faint"],
      pastMedicalHistory: ["Known nut allergy (never had adrenaline before)", "Asthma (mild)"],
      medications: ["Salbutamol PRN"],
      allergies: "Nuts — this is the likely trigger",
      socialHistory: "Student. Was dining with friends. Not carrying EpiPen despite allergy.",
      familyHistory: "None",
      systemsReview: {
        trigger: "Ate satay sauce — likely peanut",
        epipen: "Does not own an EpiPen despite known nut allergy"
      },
      personality: "anxious",
      hiddenCues: [
        "Known nut allergy and trigger if asked about allergies",
        "No EpiPen owned — important for prevention discussion after acute phase"
      ],
      physicalFindings: "Stridor audible. Generalised urticaria. Angioedema lips/tongue. BP 82/50, HR 128, SpO2 94%. Wheeze bilaterally."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Recognition of Anaphylaxis",
          nameAr: "التعرف على التحسس الشديد",
          maxMarks: 6,
          criteria: [
            { item: "Correctly identifies anaphylaxis (3 criteria: sudden onset, life-threatening A/B/C, skin/mucosal changes)", marks: 3, category: "DIAGNOSIS" },
            { item: "Identifies severity: stridor = airway compromise — immediate threat to life", marks: 3, category: "DIAGNOSIS" },
          ],
        },
        {
          name: "Immediate Treatment — CORRECT ORDER",
          nameAr: "العلاج الفوري — الترتيب الصحيح",
          maxMarks: 16,
          criteria: [
            { item: "ADRENALINE 0.5mg IM (1:1000) into anterolateral thigh — FIRST LINE", marks: 4, category: "ADRENALINE" },
            { item: "Position: supine with legs elevated (unless breathless — then sitting)", marks: 2, category: "POSITION" },
            { item: "High-flow oxygen 15L via non-rebreathe mask", marks: 2, category: "OXYGEN" },
            { item: "IV access x2 + IV fluid challenge 500ml normal saline (hypotension)", marks: 2, category: "IV ACCESS" },
            { item: "Chlorphenamine 10mg IV (second-line antihistamine)", marks: 2, category: "ADJUNCTS" },
            { item: "Hydrocortisone 200mg IV (second-line steroid)", marks: 2, category: "ADJUNCTS" },
            { item: "Repeat adrenaline in 5 minutes if no improvement", marks: 2, category: "ADRENALINE" },
          ],
        },
        {
          name: "Monitoring & Escalation",
          nameAr: "المراقبة والتصعيد",
          maxMarks: 4,
          criteria: [
            { item: "Continuous monitoring: SpO2, HR, BP every 5 mins", marks: 2, category: "MONITORING" },
            { item: "Anaesthetics alerted given stridor (risk of intubation)", marks: 2, category: "ESCALATION" },
          ],
        },
        {
          name: "After Acute Phase",
          nameAr: "بعد مرحلة الطوارئ",
          maxMarks: 4,
          criteria: [
            { item: "Observe for biphasic reaction: minimum 6 hours post-treatment", marks: 2, category: "AFTERCARE" },
            { item: "Prescribe EpiPen x2 at discharge + referral to allergy clinic", marks: 2, category: "AFTERCARE" },
          ],
        },
      ],
      modelAnswer: "ANAPHYLAXIS MANAGEMENT: ADRENALINE FIRST — 0.5mg IM (1:1000) anterolateral thigh. DO NOT delay for IV access. Lay flat + legs up (unless breathless). High-flow O2. IV access + 500ml NS bolus (hypotension). Antihistamine (chlorphenamine 10mg IV) and steroid (hydrocortisone 200mg IV) are SECOND-LINE — do NOT delay adrenaline for these. Repeat adrenaline every 5 minutes PRN. Stridor → call anaesthetics (may need intubation). Observe minimum 6 hours for biphasic. EpiPen on discharge + allergy clinic.",
    },
    learningPoints: [
      "ADRENALINE IM is FIRST-LINE — never delay it. IV adrenaline only in cardiac arrest",
      "1:1000 adrenaline 0.5mg IM = EpiPen dose. 1:10,000 is for IV use only",
      "Antihistamines and steroids are second-line and do not treat the acute reaction",
      "Biphasic anaphylaxis: 5-20% of cases, observe minimum 6 hours after treatment",
      "EpiPen x2 prescribed at discharge — one to use, one spare",
    ],
    relatedTopics: ["Anaphylaxis", "Adrenaline", "Biphasic Reaction", "EpiPen", "Allergy"],
    tags: ["emergency", "anaphylaxis", "adrenaline", "airway", "allergy"],
  },

  {
    id: "EM-04",
    title: "Sepsis — Sepsis-6 Bundle Application",
    titleAr: "الإنتان — تطبيق حزمة Sepsis-6",
    specialty: "Emergency Medicine",
    stationType: "mixed",
    difficulty: "year4",
    durationMinutes: 8,
    patientBrief: "Mr. David Osei, 65-year-old man with Type 2 diabetes, presents with a 2-day history of dysuria, rigors, confusion and fever. His observations: T 38.9°C, HR 118, BP 88/50, RR 24, SpO2 94%. He is confused (GCS 13). Please manage this patient.",
    patientName: "David Osei",
    patientAge: 65,
    patientSex: "M",
    patientSetting: "Emergency Department",
    patientPersona: {
      presentingComplaint: "Fever, confusion, low blood pressure — urinary source suspected",
      presentingComplaintAr: "حمى وتشوش وانخفاض ضغط الدم",
      onset: "2 days dysuria, rigors today, confusion last 2 hours",
      severity: "Septic shock: BP 88/50, HR 118, confusion",
      associatedSymptoms: ["Dysuria", "Frequency", "Rigors", "Confusion (new)", "Flushed, sweaty"],
      pastMedicalHistory: ["Type 2 Diabetes", "BPH (prostate enlargement — risk for UTI)"],
      medications: ["Metformin 1g BD", "Tamsulosin 400mcg OD"],
      allergies: "Penicillin — anaphylaxis",
      socialHistory: "Lives alone. Wife passed away 6 months ago.",
      familyHistory: "Not relevant",
      systemsReview: {
        urinary: "Dysuria and frequency for 2 days. Foul-smelling urine. Haematuria yesterday.",
        mental_status: "Previously sharp — this confusion is new (baseline lucid)"
      },
      personality: "cooperative",
      hiddenCues: [
        "Penicillin allergy (anaphylaxis) — critical for antibiotic choice, must be asked",
        "Lives alone — important for social care after discharge"
      ],
      physicalFindings: "T 38.9°C, HR 118, BP 88/50, RR 24, SpO2 94%, GCS 13 (E4V4M5). Tender suprapubic area. Dipstick: leukocytes++, nitrites+, blood++."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Sepsis Recognition",
          nameAr: "التعرف على الإنتان",
          maxMarks: 6,
          criteria: [
            { item: "Identifies SEPSIS (qSOFA ≥2: altered mental status, RR>22, SBP<100)", marks: 3, category: "DIAGNOSIS" },
            { item: "Identifies probable source: urinary tract", marks: 3, category: "SOURCE" },
          ],
        },
        {
          name: "Sepsis-6 Bundle (within 1 hour)",
          nameAr: "حزمة Sepsis-6 (خلال ساعة)",
          maxMarks: 18,
          criteria: [
            { item: "GIVE O2 — target SpO2 94-98%", marks: 2, category: "SEPSIS-6" },
            { item: "TAKE blood cultures x2 before antibiotics", marks: 3, category: "SEPSIS-6" },
            { item: "GIVE IV antibiotics — appropriate choice (NOT penicillin — allergy!)", marks: 4, category: "SEPSIS-6" },
            { item: "GIVE IV fluids — 500ml crystalloid bolus, reassess", marks: 3, category: "SEPSIS-6" },
            { item: "MEASURE lactate — if >4 = severe sepsis/septic shock", marks: 3, category: "SEPSIS-6" },
            { item: "MONITOR urine output — catheterise and measure hourly", marks: 3, category: "SEPSIS-6" },
          ],
        },
        {
          name: "Appropriate Antibiotic Choice",
          nameAr: "اختيار المضاد الحيوي المناسب",
          maxMarks: 2,
          criteria: [
            { item: "Does NOT give piperacillin-tazobactam or co-amoxiclav (contain penicillin)", marks: 2, category: "ANTIBIOTICS" },
          ],
        },
        {
          name: "Communication & Escalation",
          nameAr: "التواصل والتصعيد",
          maxMarks: 4,
          criteria: [
            { item: "Escalates to senior — septic shock needs ITU involvement", marks: 2, category: "ESCALATION" },
            { item: "Communicates urgency to team clearly", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "SEPTIC SHOCK (BP 88/50, HR 118, confusion, RR 24, fever): Immediately apply SEPSIS-6 within 1 hour. PENICILLIN ALLERGY = do NOT use Tazocin or co-amoxiclav. Use gentamicin IV + metronidazole (if biliary source), or meropenem if severe allergy. For UTI sepsis in penicillin allergy: IV gentamicin 5mg/kg + review after 24h. Fluid: 500ml NS bolus, reassess, target MAP >65mmHg. Lactate >4 → septic shock → HDU/ITU. Urine output target >0.5ml/kg/hr. Blood cultures BEFORE antibiotics (don't delay antibiotics waiting for cultures).",
    },
    learningPoints: [
      "Sepsis-6: Give O2, cultures, antibiotics, fluids; measure lactate and urine output",
      "qSOFA: RR >22, altered consciousness, SBP <100 — 2 points = high risk sepsis",
      "Time to antibiotics matters: each hour delay increases mortality by ~7%",
      "Penicillin allergy: avoid all beta-lactams if anaphylaxis — use gentamicin, aztreonam, or meropenem",
      "Lactate >4 mmol/L = septic shock — ICU involvement mandatory",
    ],
    relatedTopics: ["Sepsis", "Sepsis-6", "Antibiotic Choice", "Septic Shock", "qSOFA"],
    tags: ["emergency", "sepsis", "sepsis-6", "antibiotics", "shock"],
  },

  // ══════════════════════════════════════════════════════
  // OB/GYN
  // ══════════════════════════════════════════════════════
  {
    id: "OB-02",
    title: "Pre-eclampsia Assessment",
    titleAr: "تقييم ما قبل تسمم الحمل",
    specialty: "OB/GYN",
    stationType: "mixed",
    difficulty: "finals",
    durationMinutes: 8,
    patientBrief: "Mrs. Priya Sharma, 31-year-old woman, 34 weeks pregnant (primigravida), attends the antenatal clinic with headache, visual disturbances and swollen ankles for 2 days. Her BP today is 158/102. Please assess and manage her.",
    patientName: "Priya Sharma",
    patientAge: 31,
    patientSex: "F",
    patientSetting: "Antenatal Clinic",
    patientPersona: {
      presentingComplaint: "Headache, visual disturbances, ankle swelling — 34 weeks pregnant",
      presentingComplaintAr: "صداع واضطرابات بصرية وتورم قدمين في أسبوع 34",
      onset: "2 days",
      severity: "Severe frontal headache. Flashing lights in vision.",
      associatedSymptoms: ["Frontal headache — not relieved by paracetamol", "Flashing lights (photopsia)", "Bilateral ankle oedema", "Epigastric pain (new)", "Nausea"],
      pastMedicalHistory: ["Primigravida — 34 weeks. Normal BP pre-pregnancy and first trimester."],
      medications: ["Ferrous sulphate", "Folic acid — stopped at 12 weeks"],
      allergies: "None",
      socialHistory: "Works as a dentist. Supportive husband.",
      familyHistory: "Mother had pre-eclampsia",
      systemsReview: {
        fetal_movement: "Baby movements still felt but maybe reduced in last 24 hours",
        urine: "Urine looks dark and foamy — proteinuria likely",
        fits: "No fits or loss of consciousness"
      },
      personality: "anxious",
      hiddenCues: [
        "Epigastric pain revealed if specifically asked about abdominal pain (HELLP syndrome risk)",
        "Reduced fetal movements revealed if asked about baby movements",
        "Foamy urine revealed if asked about urinary symptoms"
      ],
      physicalFindings: "BP 158/102 (both arms). Pitting oedema ankles/face. Fundal height 32cm (small for dates). Urine dipstick: protein +++. Clonus absent. Reflexes normal."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Diagnosis of Pre-eclampsia",
          nameAr: "تشخيص ما قبل تسمم الحمل",
          maxMarks: 8,
          criteria: [
            { item: "Identifies diagnostic criteria: BP >140/90 after 20 weeks + proteinuria", marks: 3, category: "DIAGNOSIS" },
            { item: "This is SEVERE pre-eclampsia: BP >160/110 OR symptoms present", marks: 3, category: "DIAGNOSIS" },
            { item: "Asks about/identifies symptoms of severe disease (headache, visual, epigastric)", marks: 2, category: "DIAGNOSIS" },
          ],
        },
        {
          name: "Investigations",
          nameAr: "الفحوصات",
          maxMarks: 8,
          criteria: [
            { item: "Urine PCR (protein:creatinine ratio) or 24h urine protein", marks: 2, category: "INVESTIGATIONS" },
            { item: "FBC (thrombocytopenia in HELLP), LFTs (elevated in HELLP)", marks: 2, category: "INVESTIGATIONS" },
            { item: "U&E, creatinine, uric acid", marks: 2, category: "INVESTIGATIONS" },
            { item: "CTG (cardiotocography) — fetal wellbeing", marks: 2, category: "INVESTIGATIONS" },
          ],
        },
        {
          name: "Management",
          nameAr: "العلاج",
          maxMarks: 10,
          criteria: [
            { item: "Antihypertensive: labetalol 200mg oral (or IV if severe)", marks: 3, category: "TREATMENT" },
            { item: "IV magnesium sulphate (eclampsia prophylaxis) — given for severe PE", marks: 3, category: "TREATMENT" },
            { item: "Admit for monitoring — does not discharge", marks: 2, category: "TREATMENT" },
            { item: "Corticosteroids (dexamethasone) — 34 weeks, may need delivery", marks: 2, category: "TREATMENT" },
          ],
        },
        {
          name: "Communication",
          nameAr: "التواصل",
          maxMarks: 4,
          criteria: [
            { item: "Explains seriousness sensitively to anxious patient", marks: 2, category: "COMM" },
            { item: "Multidisciplinary involvement: obstetric consultant, anaesthetics, neonatology", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "SEVERE PRE-ECLAMPSIA: BP 158/102 + headache + visual symptoms + proteinuria +++ = admit immediately. IMMEDIATE: antihypertensive (labetalol IV 20mg if SBP >160, or oral 200mg). IV MAGNESIUM SULPHATE: 4g over 15min loading dose, 1g/hr maintenance — for seizure prophylaxis in severe PE. INVESTIGATIONS: FBC/LFTs/U&E (HELLP syndrome), CTG. CORTICOSTEROIDS: dexamethasone 2x12mg IM 24h apart (fetal lung maturity — 34 weeks). DEFINITIVE TREATMENT: delivery (only cure — discuss timing with consultant).",
    },
    learningPoints: [
      "Pre-eclampsia: new hypertension >140/90 after 20 weeks + proteinuria OR end-organ damage",
      "Severe features: BP >160/110, headache, visual changes, epigastric pain, pulmonary oedema",
      "HELLP: Haemolysis, Elevated Liver enzymes, Low Platelets — life-threatening complication",
      "Magnesium sulphate prevents eclamptic seizures AND treats them (not an antihypertensive)",
      "ONLY CURE for pre-eclampsia = delivery",
    ],
    relatedTopics: ["Pre-eclampsia", "Eclampsia", "HELLP Syndrome", "Magnesium Sulphate", "Antihypertensives in Pregnancy"],
    tags: ["obstetrics", "pre-eclampsia", "hypertension-pregnancy", "emergency", "HELLP"],
  },

  // ══════════════════════════════════════════════════════
  // SURGERY
  // ══════════════════════════════════════════════════════
  {
    id: "SURG-01",
    title: "Acute Abdomen — History & Examination",
    titleAr: "البطن الحاد — التاريخ والفحص",
    specialty: "Surgery",
    stationType: "history_taking",
    difficulty: "year4",
    durationMinutes: 8,
    patientBrief: "Mr. Ahmed Al-Zahrani, 22-year-old student, presents to the ED with central abdominal pain that has moved to the right iliac fossa over the last 6 hours. He has vomited twice and has a temperature of 37.9°C. Please take a focused surgical history.",
    patientName: "Ahmed Al-Zahrani",
    patientAge: 22,
    patientSex: "M",
    patientSetting: "Emergency Department Surgical Assessment",
    patientPersona: {
      presentingComplaint: "Central abdominal pain migrating to right iliac fossa — 6 hours",
      presentingComplaintAr: "ألم بطني مركزي انتقل إلى الحفرة الحرقفية اليمنى",
      onset: "6 hours ago, central initially, now right lower abdomen",
      severity: "7/10, constant, worse on movement",
      associatedSymptoms: ["Nausea and vomiting x2", "Low-grade fever 37.9°C", "Anorexia (hasn't eaten since yesterday)", "Rebound tenderness (revealed on examination)"],
      pastMedicalHistory: ["No previous abdominal surgery", "No medical history"],
      medications: ["None"],
      allergies: "None",
      socialHistory: "University student. Last ate yesterday evening.",
      familyHistory: "None",
      systemsReview: {
        bowels: "Last opened bowels yesterday — normal. No diarrhoea.",
        urinary: "No dysuria, no haematuria",
        testicular: "No testicular pain (important differential: torsion)",
        sexual: "No sexual partners (rules out PID — male patient)"
      },
      personality: "cooperative",
      hiddenCues: [
        "Anorexia revealed if specifically asked about appetite",
        "No testicular pain revealed if specifically asked (important to rule out torsion)",
        "No recent foreign travel if asked (rules out traveller's diarrhoea)"
      ],
      physicalFindings: "T 37.9°C, HR 98, BP 118/74. RIF tenderness maximal at McBurney's point. Rovsing's sign positive. Rebound tenderness present. Psoas sign positive. Guarding in RIF."
    },
    markingScheme: {
      totalMarks: 30,
      passThreshold: 18,
      domains: [
        {
          name: "Pain History (SOCRATES)",
          nameAr: "تاريخ الألم SOCRATES",
          maxMarks: 10,
          criteria: [
            { item: "Site: periumbilical initially", marks: 1, category: "SOCRATES" },
            { item: "Onset: 6 hours, gradual", marks: 1, category: "SOCRATES" },
            { item: "Character: constant, dull/colicky initially, now constant", marks: 2, category: "SOCRATES" },
            { item: "Radiation: migration to RIF — classic appendicitis", marks: 2, category: "SOCRATES" },
            { item: "Associated symptoms: nausea, vomiting, anorexia, fever", marks: 2, category: "SOCRATES" },
            { item: "Timing and exacerbating factors (worse on movement)", marks: 2, category: "SOCRATES" },
          ],
        },
        {
          name: "Differential Diagnosis History",
          nameAr: "تاريخ التشخيص التفريقي",
          maxMarks: 8,
          criteria: [
            { item: "Asks about urinary symptoms (renal colic, UTI)", marks: 2, category: "DIFFERENTIALS" },
            { item: "Asks about testicular symptoms (torsion in young male)", marks: 2, category: "DIFFERENTIALS" },
            { item: "Asks about bowel habits (obstruction, IBD)", marks: 2, category: "DIFFERENTIALS" },
            { item: "Previous abdominal surgery (adhesions)", marks: 2, category: "DIFFERENTIALS" },
          ],
        },
        {
          name: "Surgical Assessment",
          nameAr: "التقييم الجراحي",
          maxMarks: 8,
          criteria: [
            { item: "Calculates Alvarado score (or identifies key components)", marks: 3, category: "SCORING" },
            { item: "Orders appropriate investigations: FBC, CRP, urinalysis, USS abdomen", marks: 3, category: "INVESTIGATIONS" },
            { item: "Appropriate: nil by mouth, IV access, analgesia, surgical referral", marks: 2, category: "MANAGEMENT" },
          ],
        },
        {
          name: "Communication",
          nameAr: "التواصل",
          maxMarks: 4,
          criteria: [
            { item: "Explains likely diagnosis sensitively", marks: 2, category: "COMM" },
            { item: "Explains need for investigations and possible surgery", marks: 2, category: "COMM" },
          ],
        },
      ],
      modelAnswer: "APPENDICITIS: Classic history — periumbilical pain migrating to RIF, anorexia, nausea, low-grade fever. Alvarado score components: migration to RIF (1), anorexia (1), nausea/vomiting (1), tenderness in RIF (2), rebound tenderness (1), elevated temperature (1), leucocytosis (2). Score 9 = high probability appendicitis. IMMEDIATE: NBM, IV access, IV fluids, analgesia (OPIOIDS are not contraindicated — they do NOT mask examination), FBC/CRP/urinalysis/beta-hCG if female, USS abdomen (CT if USS inconclusive). Urgent surgical review. Laparoscopic appendicectomy.",
    },
    learningPoints: [
      "Classic appendicitis: periumbilical pain migrating to RIF + anorexia + nausea + fever",
      "McBurney's point: 1/3 of way from ASIS to umbilicus",
      "Rovsing's sign: RIF pain on pressing LIF (peritoneal irritation)",
      "Psoas sign: pain on extending right hip (retrocaecal appendix)",
      "Alvarado score: ≥7 = high probability, operate without CT",
    ],
    relatedTopics: ["Appendicitis", "Alvarado Score", "Acute Abdomen", "Appendicectomy", "Differential Diagnosis RIF Pain"],
    tags: ["surgery", "appendicitis", "acute-abdomen", "RIF-pain", "emergency"],
  },
];

// Helper to get stations by specialty
export function getStationsBySpecialty(specialty: string): OSCEStation[] {
  if (specialty === "all") return OSCE_STATIONS;
  return OSCE_STATIONS.filter(s => s.specialty === specialty);
}

// Helper to get stations by difficulty
export function getStationsByDifficulty(difficulty: string): OSCEStation[] {
  if (difficulty === "all") return OSCE_STATIONS;
  return OSCE_STATIONS.filter(s => s.difficulty === difficulty);
}

// Get unique specialties
export const OSCE_SPECIALTIES = [...new Set(OSCE_STATIONS.map(s => s.specialty))].sort();

export const DIFFICULTY_LABELS: Record<string, string> = {
  year1: "Year 1", year2: "Year 2", year3: "Year 3",
  year4: "Year 4", finals: "Final Year", postgrad: "Postgraduate"
};

export const STATION_TYPE_LABELS: Record<string, string> = {
  history_taking: "History Taking",
  examination: "Examination",
  communication: "Communication",
  procedure: "Procedure",
  data_interpretation: "Data Interpretation",
  mixed: "Mixed",
};
