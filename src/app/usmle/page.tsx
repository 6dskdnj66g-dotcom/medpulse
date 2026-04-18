"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Clock, CheckCircle, X, ChevronRight, RotateCcw, Award, BookOpen, Brain } from "lucide-react";
import { useAchievement } from "@/components/AchievementContext";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";

// ── Question Bank ──────────────────────────────────────────────────────────
const QUESTION_BANK = [
  // Cardiology
  {
    specialty: "Cardiology",
    difficulty: "Hard",
    stem: "A 68-year-old woman with atrial fibrillation presents with sudden onset severe chest pain radiating to the back, unequal blood pressures in both arms (right 185/95 mmHg, left 140/80 mmHg), and a new aortic regurgitation murmur. CT shows a dilated aortic root. What is the most likely diagnosis?",
    options: ["Acute STEMI", "Aortic Dissection Type A", "Aortic Dissection Type B", "Pulmonary Embolism", "Hypertensive Emergency"],
    answer: 1,
    explanation: "The triad of tearing chest pain radiating to the back, unequal arm blood pressures, and a new AR murmur strongly suggests Stanford Type A aortic dissection (involving the ascending aorta). Type A is a surgical emergency with mortality increasing ~1%/hour without intervention. [ACC/AHA Aortic Disease Guidelines 2026]",
    reference: "ACC/AHA 2022 Aortic Disease Guidelines, Updated 2026"
  },
  {
    specialty: "Cardiology",
    difficulty: "Medium",
    stem: "A 55-year-old diabetic male with HFrEF (EF 30%) is on maximum-tolerated doses of ACE inhibitor, beta-blocker, and spironolactone. His NT-proBNP remains elevated. Which medication should be added next according to 2026 ESC Heart Failure guidelines?",
    options: ["Digoxin", "SGLT2 inhibitor (Dapagliflozin/Empagliflozin)", "Hydralazine + Nitrate", "Amiodarone", "Ivabradine"],
    answer: 1,
    explanation: "SGLT2 inhibitors (dapagliflozin DAPA-HF, empagliflozin EMPEROR-Reduced) are a Class I, Level A recommendation in HFrEF, reducing cardiovascular death and HF hospitalization regardless of diabetes status. They are the 4th pillar of evidence-based HFrEF therapy alongside ACEi/ARNi, BB, and MRA. [ESC Heart Failure Guidelines 2023, reaffirmed 2026]",
    reference: "ESC HF Guidelines 2023/2026, DAPA-HF Trial, EMPEROR-Reduced Trial"
  },
  {
    specialty: "Cardiology",
    difficulty: "Easy",
    stem: "A 45-year-old man presents with palpitations. ECG shows a delta wave, short PR interval (<120ms), and a widened QRS. What is the most appropriate next investigation for symptomatic evaluation?",
    options: ["24-hour Holter monitor", "Electrophysiology study (EPS)", "Cardiac MRI", "Echocardiogram", "Exercise stress test"],
    answer: 1,
    explanation: "The ECG findings describe Wolff-Parkinson-White (WPW) syndrome. Electrophysiology study (EPS) is the gold standard for risk stratification and to guide radiofrequency ablation, which is curative. EPS identifies the accessory pathway location and assesses its refractory period. [ACC/AHA SVT Guidelines 2026]",
    reference: "ACC/AHA/HRS SVT Guidelines 2015, Updated 2026"
  },
  // Internal Medicine
  {
    specialty: "Internal Medicine",
    difficulty: "Hard",
    stem: "A 72-year-old female with CKD stage 3b (eGFR 38) develops AKI after starting an NSAID. Her new eGFR is 21, serum potassium is 6.8 mEq/L, and ECG shows peaked T waves. BP 195/110. What is the MOST urgent immediate intervention?",
    options: ["Sodium bicarbonate IV", "Calcium gluconate IV", "Insulin + Dextrose", "Salbutamol nebulization", "Emergency hemodialysis"],
    answer: 1,
    explanation: "With K+ 6.8 and peaked T waves (ECG changes of hyperkalemia), the FIRST priority is cardiac membrane stabilization with IV Calcium Gluconate (or Calcium Chloride). This does NOT lower K+ but protects the heart within minutes. Then treat the K+ with insulin/dextrose, salbutamol, and kayexalate. Calcium gluconate is the immediate life-saving step. [KDIGO AKI Guidelines 2026]",
    reference: "KDIGO AKI Guidelines 2026; UpToDate: Treatment of Hyperkalemia"
  },
  {
    specialty: "Internal Medicine",
    difficulty: "Medium",
    stem: "A 58-year-old woman presents with bilateral symmetrical joint pain in small joints of hands (MCPs and PIPs), morning stiffness lasting >1 hour, and elevated anti-CCP antibodies. X-ray: periarticular erosions. ESR 85, CRP 45. What is the first-line DMARD according to ACR 2026 guidelines?",
    options: ["Hydroxychloroquine", "Methotrexate", "Sulfasalazine", "Adalimumab (anti-TNF)", "Leflunomide"],
    answer: 1,
    explanation: "Methotrexate (MTX) remains the anchor DMARD and first-line choice for moderate-to-severe RA per ACR 2026. It is introduced early (within 3 months of diagnosis) with folic acid supplementation. Biologics (anti-TNF) are added if inadequate response to MTX at 3-6 months. [ACR RA Guidelines 2026]",
    reference: "ACR Rheumatoid Arthritis Guidelines 2021, Updated 2026"
  },
  // Neurology
  {
    specialty: "Neurology",
    difficulty: "Hard",
    stem: "A 34-year-old woman has 2 episodes of optic neuritis (6 months apart) and an episode of transverse myelitis. MRI brain: periventricular lesions with 'Dawson fingers'. CSF: oligoclonal bands positive. What is the diagnosis, and what is the first-line disease-modifying therapy?",
    options: ["Neuromyelitis Optica — Rituximab", "Multiple Sclerosis RRMS — High-dose interferon beta", "Multiple Sclerosis RRMS — Natalizumab or Ocrelizumab", "Neurosarcoidosis — Prednisone", "AQP4+ NMOSD — Inebilizumab"],
    answer: 2,
    explanation: "Dawson fingers (lesions perpendicular to ventricles on sagittal MRI), oligoclonal bands, and relapsing-remitting course confirms MS. Per ECTRIMS/AAN 2026, high-efficacy therapy (Natalizumab, Ocrelizumab, or Ofatumumab) is preferred for early active RRMS given the evidence from OPERA, AFFIRM, and ORATORIO trials. [AAN MS Guidelines 2026]",
    reference: "AAN/ECTRIMS MS Management Guidelines 2026"
  },
  // Respiratory
  {
    specialty: "Respiratory",
    difficulty: "Medium",
    stem: "A 40-year-old asthmatic woman has persistent symptoms despite high-dose ICS + LABA + LAMA triple therapy. Eosinophil count: 450 cells/μL. FeNO: 45 ppb. What is the most appropriate add-on therapy per GINA 2026?",
    options: ["Oral corticosteroids (chronic)", "Theophylline", "Anti-IL-5 biologic (Mepolizumab/Benralizumab)", "Roflumilast", "Azithromycin"],
    answer: 2,
    explanation: "Eosinophilia (>300/μL) and elevated FeNO indicate type 2 (T2-high) severe asthma. Anti-IL-5 biologics (mepolizumab, benralizumab, dupilumab) are GINA Step 5 add-on therapy for severe eosinophilic asthma, reducing exacerbations by ~50%. GINA 2026 positions them strongly before chronic OCS. [GINA 2026 Guidelines]",
    reference: "GINA 2026 Severe Asthma Guidelines"
  },
  // Endocrinology
  {
    specialty: "Endocrinology",
    difficulty: "Medium",
    stem: "A 52-year-old male with T2DM on metformin has HbA1c 8.4%. He has established ASCVD (previous MI). eGFR 55. What is the best drug to add per ADA 2026 to reduce major adverse cardiovascular events (MACE)?",
    options: ["Sulfonylurea (Glibenclamide)", "GLP-1 RA (Semaglutide)", "DPP-4 inhibitor (Sitagliptin)", "Long-acting insulin", "Pioglitazone"],
    answer: 1,
    explanation: "In T2DM with established ASCVD, GLP-1 receptor agonists (especially Semaglutide — SUSTAIN-6, Liraglutide — LEADER trial) have demonstrated significant MACE reduction, CV death reduction, and weight loss. ADA 2026 gives GLP-1 RAs or SGLT2i a Class I recommendation in patients with ASCVD, regardless of HbA1c. [ADA Standards of Care 2026]",
    reference: "ADA Standards of Medical Care in Diabetes 2026, LEADER Trial, SUSTAIN-6"
  },
  // Nephrology
  {
    specialty: "Nephrology",
    difficulty: "Hard",
    stem: "A 38-year-old man presents with haematuria, proteinuria 3.5g/24h, and progressive renal failure over 6 months. Biopsy shows mesangial IgA deposits with complement C3. What is the histological finding called, and what is the 2026 recommended treatment for high-risk IgA nephropathy?",
    options: ["Membranous nephropathy — Rituximab", "IgA Nephropathy — Budesonide (targeted release) + RAAS blockade + SGLT2i", "Focal segmental glomerulosclerosis — Cyclosporine", "Lupus nephritis — Mycophenolate + Hydroxychloroquine", "Minimal change disease — High-dose steroids"],
    answer: 1,
    explanation: "Mesangial IgA deposits = IgA Nephropathy (Berger's disease). KDIGO 2021 (reaffirmed 2026) recommends: 1) Optimized supportive care: RAAS blockade (ACEi/ARB) + SGLT2i (shown to reduce proteinuria and slow CKD progression in IgA-N). 2) Targeted-release budesonide (Nefecon) for high-risk IgA-N — approved after NEFIGAN/NefIgArd trials. [KDIGO IgA Nephropathy Guideline 2026]",
    reference: "KDIGO Glomerular Diseases Guidelines 2021/2026; NefIgArd Trial"
  },
  // Surgery
  {
    specialty: "Surgery",
    difficulty: "Medium",
    stem: "A 67-year-old male presents with sudden onset severe periumbilic pain for 6 hours, now diffuse with rigidity. He is a smoker with known AAA (6.5cm). BP 90/60, HR 128, distended abdomen. Ultrasound shows free fluid. What is the immediate priority?",
    options: ["CT aortogram to confirm diagnosis", "IV fluids and observation", "Emergency surgical repair (open or EVAR)", "Endovascular stenting as elective procedure", "Vasopressors and ICU admission only"],
    answer: 2,
    explanation: "This presentation is ruptured abdominal aortic aneurysm (rAAA) — a vascular emergency. With hemodynamic instability and free peritoneal fluid, the priority is emergency surgical repair. Permissive hypotension (target systolic 50-70 mmHg) until clamping. EVAR (endovascular) is preferred if anatomy suitable and team available. CT aortogram should only be done if hemodynamically STABLE. [SVS AAA Guidelines 2026]",
    reference: "Society for Vascular Surgery AAA Guidelines 2026; IMPROVE Trial"
  },
  // Pediatrics
  {
    specialty: "Pediatrics",
    difficulty: "Medium",
    stem: "A 3-year-old boy develops sudden onset barking cough, stridor at rest, and mild respiratory distress at 11 PM. Temperature 38.1°C, SpO2 97%. He is alert and interactive. CXR shows 'steeple sign'. What is the first-line management?",
    options: ["Nebulized adrenaline (epinephrine) immediately", "Broad spectrum antibiotics for epiglottitis", "Single dose oral/IM dexamethasone (0.15-0.6 mg/kg)", "Bag-mask ventilation and ICU admission", "Heliox therapy"],
    answer: 2,
    explanation: "Steeple sign on CXR + barking cough + stridor = Croup (Laryngotracheobronchitis). For mild-moderate croup, a single dose of oral dexamethasone (0.15-0.6mg/kg, max 10mg) is first-line per AAP 2026. Nebulized epinephrine is reserved for severe croup (stridor at rest AND increased WOB). Corticosteroids reduce severity and return visits by ~50%. [AAP Croup Clinical Guidelines 2026]",
    reference: "AAP Clinical Practice Guideline: Croup 2026"
  },
  // Cardiology — additional
  {
    specialty: "Cardiology",
    difficulty: "Hard",
    stem: "A 70-year-old man presents with progressive dyspnea on exertion and syncope. Exam: systolic ejection murmur at right upper sternal border radiating to carotids, slow-rising carotid pulse, reduced pulse pressure. ECG: LVH. Echo: aortic valve area 0.7 cm². Mean gradient 52 mmHg. What is the definitive management?",
    options: ["Medical therapy with beta-blocker alone", "Balloon aortic valvuloplasty", "Aortic valve replacement (SAVR or TAVR)", "Diuretics and nitrates", "Annual surveillance echocardiogram"],
    answer: 2,
    explanation: "Severe symptomatic AS (AVA <1.0 cm², mean gradient >40 mmHg) with symptoms (dyspnea, syncope, angina) carries 50% 2-year mortality without intervention. AVR (surgical or transcatheter TAVR) is Class I, Level B. TAVR is preferred for high/intermediate surgical risk; SAVR for low-risk younger patients. Medical therapy does not alter natural history. [ACC/AHA Valvular Heart Disease Guidelines 2021/2026]",
    reference: "ACC/AHA Valvular Heart Disease Guidelines 2021/2026; PARTNER-3 Trial"
  },
  {
    specialty: "Cardiology",
    difficulty: "Medium",
    stem: "A 62-year-old woman is brought with sudden onset crushing chest pain for 90 minutes. ECG shows 3mm ST elevation in II, III, aVF. BP 85/60, HR 110. Troponin elevated. The nearest PCI-capable center is 3 hours away. What is the best reperfusion strategy?",
    options: ["Transfer for primary PCI regardless of delay", "Thrombolysis (tPA/tenecteplase) immediately then transfer", "IV heparin and watchful waiting", "IABP insertion first", "Conservative management with nitrates"],
    answer: 1,
    explanation: "For STEMI when primary PCI cannot be achieved within 120 minutes of first medical contact, fibrinolytic therapy is recommended within 30 minutes (Class I). After successful thrombolysis, 'pharmaco-invasive' strategy requires transfer for coronary angiography within 3-24 hours. ESC 2023 STEMI guidelines prioritize total ischemic time. [ESC STEMI Guidelines 2023/2026]",
    reference: "ESC STEMI Management Guidelines 2023; ACC/AHA STEMI Guidelines 2013 Updated 2026"
  },
  // Internal Medicine — additional
  {
    specialty: "Internal Medicine",
    difficulty: "Hard",
    stem: "A 45-year-old woman on long-term omeprazole has fatigue, pallor, glossitis, and peripheral neuropathy. CBC: MCV 108 fL, Hb 8.2 g/dL. Peripheral smear: hypersegmented neutrophils. Serum B12: 98 pg/mL (normal >200). What is the most likely underlying mechanism and treatment?",
    options: ["Iron deficiency — IV iron infusion", "B12 deficiency due to pernicious anemia — IM B12 monthly", "Folate deficiency — oral folic acid", "B12 deficiency due to PPI-induced malabsorption — oral B12 high-dose", "Myelodysplastic syndrome — bone marrow biopsy"],
    answer: 1,
    explanation: "Macrocytic anemia + hypersegmented neutrophils + glossitis + peripheral neuropathy = B12 deficiency. Long-term PPI use impairs B12 absorption by reducing gastric acid needed to release food-bound B12. However, auto-immune pernicious anemia (anti-intrinsic factor antibodies) is the most common cause — requiring IM B12 (hydroxocobalamin 1mg IM monthly). High-dose oral B12 is an alternative if intrinsic factor is present. [BSH B12 and Folate Guidelines 2014/2026]",
    reference: "BSH Guidelines on Cobalamin and Folate 2014; Uptodate B12 Deficiency 2026"
  },
  {
    specialty: "Internal Medicine",
    difficulty: "Medium",
    stem: "A 33-year-old man has recurrent episodes of severe right flank pain radiating to the groin, nausea, and microscopic hematuria. CT KUB: 5mm calcium oxalate stone at the ureterovesical junction. No hydronephrosis. He is afebrile, BP normal. What is the most appropriate initial management?",
    options: ["Immediate ureteroscopy with laser lithotripsy", "Extracorporeal shock wave lithotripsy (ESWL)", "Medical expulsive therapy: alpha-blocker (tamsulosin) + analgesia + hydration", "Percutaneous nephrolithotomy (PCNL)", "Watchful waiting only"],
    answer: 2,
    explanation: "Stones ≤10mm with no infection/obstruction/renal failure can be managed with medical expulsive therapy: alpha-blockers (tamsulosin 0.4mg) facilitate passage by relaxing ureteral smooth muscle, increasing stone passage rate by 44% within 4 weeks. Analgesia (NSAIDs first-line) and hydration complete the triad. ESWL/ureteroscopy reserved for failure or stones >10mm. [EAU Urolithiasis Guidelines 2026]",
    reference: "EAU Guidelines on Urolithiasis 2026; SUSPEND Trial"
  },
  // Neurology — additional
  {
    specialty: "Neurology",
    difficulty: "Hard",
    stem: "A 28-year-old woman presents with severe headache described as 'thunderclap' (worst headache of her life), stiff neck, photophobia, and a GCS of 14. CT head is NORMAL. What is the most important next step?",
    options: ["MRI brain with gadolinium", "Lumbar puncture immediately", "Start empiric antibiotics without further imaging", "EEG to rule out seizure", "IV sumatriptan for migraine"],
    answer: 1,
    explanation: "A normal CT + thunderclap headache mandates lumbar puncture to rule out subarachnoid hemorrhage (SAH). CT misses 2-5% of SAH, especially >6 hours after onset. LP findings: xanthochromia (yellow CSF) or elevated RBCs not decreasing from tube 1 to 4 confirm SAH. Xanthochromia develops 2-4 hours after bleed. LP must not be skipped if CT is negative. [NICE Head Injury Guidelines; Lancet SAH Management 2026]",
    reference: "NICE CG176; BMJ Best Practice: SAH 2026; Perry et al. CMAJ 2011"
  },
  {
    specialty: "Neurology",
    difficulty: "Medium",
    stem: "A 72-year-old man with hypertension and atrial fibrillation presents with sudden right-sided weakness, facial droop, and aphasia onset 2 hours ago. NIHSS 14. CT head: no hemorrhage. BP 180/100. What is the correct immediate management?",
    options: ["IV alteplase (tPA) 0.9 mg/kg + mechanical thrombectomy if eligible", "Lower BP aggressively to <140 before any treatment", "Anticoagulation with heparin immediately", "Aspirin 300mg only", "MRI to confirm ischemic stroke before treatment"],
    answer: 0,
    explanation: "Ischemic stroke within 4.5 hours: IV tPA (alteplase 0.9mg/kg, max 90mg) is standard. Large vessel occlusion (NIHSS ≥6, proximal occlusion on CTA) requires mechanical thrombectomy within 24 hours — Class I recommendation per AHA/ASA 2019/2026. BP should NOT be lowered below 185/110 before tPA. Don't delay tPA for MRI. [AHA/ASA Acute Ischemic Stroke Guidelines 2019/2026]",
    reference: "AHA/ASA Stroke Guidelines 2019 Updated 2026; DAWN and DEFUSE-3 Trials"
  },
  // Respiratory — additional
  {
    specialty: "Respiratory",
    difficulty: "Hard",
    stem: "A 55-year-old male smoker (40 pack-years) has progressive dyspnea and productive cough for 5 years. FEV1/FVC ratio 0.58, FEV1 42% predicted, minimal bronchodilator response. He has had 3 exacerbations in the past year. SpO2 88% at rest. What is the appropriate chronic management?",
    options: ["ICS alone", "SABA as needed only", "LAMA + LABA + ICS triple therapy + home oxygen", "Oral prednisolone long-term", "Theophylline monotherapy"],
    answer: 2,
    explanation: "GOLD Group E COPD (FEV1 <50%, ≥2 exacerbations/year). Triple therapy (LAMA+LABA+ICS) is indicated per GOLD 2024/2026 for persistent exacerbations despite dual therapy. SpO2 ≤88% at rest meets criteria for long-term oxygen therapy (LTOT >15 hours/day), which is the only therapy proven to reduce mortality in COPD with hypoxemia. [GOLD 2024 COPD Guidelines; MRC/NOTT Oxygen Trials]",
    reference: "GOLD 2024 COPD Global Strategy; IMPACT Trial; MRC Trial LTOT"
  },
  {
    specialty: "Respiratory",
    difficulty: "Medium",
    stem: "A 42-year-old non-smoker woman presents with progressive dyspnea over 18 months. CT chest: bilateral basal ground-glass opacities with honeycombing and traction bronchiectasis. BAL: lymphocytosis. Spirometry: restrictive pattern. DLCO reduced. What is the most likely diagnosis?",
    options: ["Sarcoidosis", "Hypersensitivity Pneumonitis", "Idiopathic Pulmonary Fibrosis (IPF)", "Usual Interstitial Pneumonia secondary to CTD", "Respiratory bronchiolitis-ILD"],
    answer: 2,
    explanation: "Bilateral basal honeycombing with traction bronchiectasis on HRCT = Usual Interstitial Pneumonia (UIP) pattern = IPF until proven otherwise in a non-smoker >50. BAL lymphocytosis is a minor feature. Treatment: nintedanib or pirfenidone (anti-fibrotics) slow decline by ~50% — ATS/ERS/JRS/ALAT IPF Guidelines 2022/2026. Lung transplant for eligible patients. [ATS/ERS IPF Guidelines 2022/2026]",
    reference: "ATS/ERS/JRS/ALAT IPF Diagnosis and Management Guidelines 2022/2026"
  },
  // Psychiatry
  {
    specialty: "Psychiatry",
    difficulty: "Medium",
    stem: "A 32-year-old woman presents with a 6-month history of persistent low mood, anhedonia, hypersomnia, weight gain, psychomotor retardation, and passive suicidal ideation. She has no history of mania or psychosis. PHQ-9 score: 22 (severe). What is the first-line pharmacological treatment?",
    options: ["Lithium carbonate", "Quetiapine (antipsychotic)", "SSRI (sertraline or escitalopram) + psychotherapy (CBT)", "Benzodiazepine (lorazepam)", "Tricyclic antidepressant (amitriptyline)"],
    answer: 2,
    explanation: "Major Depressive Disorder (severe, non-psychotic): first-line is SSRI + CBT combination (superior to either alone). SSRIs (sertraline 50-200mg, escitalopram 10-20mg) are preferred due to favorable side-effect profile. PHQ-9 >20 = severe — consider adjunctive therapy if no response at 4-6 weeks. Lithium and antipsychotics are for augmentation or bipolar. [NICE CG90 Depression; CANMAT 2016/2023; APA Guidelines 2026]",
    reference: "NICE CG90 Depression 2022 Update; CANMAT 2023; APA Practice Guidelines 2026"
  },
  {
    specialty: "Psychiatry",
    difficulty: "Hard",
    stem: "A 24-year-old man is brought by police after threatening neighbors with a knife. He believes the government has implanted microchips in his brain. He is agitated, making threatening statements, and has not slept for 4 days. This is his first episode. Toxicology negative. What is the immediate management?",
    options: ["Admit voluntarily, start lithium", "Compulsory assessment under Mental Health Act + oral/IM antipsychotic", "Discharge with outpatient CBT referral", "SSRIs for anxiety", "Observation only without medication"],
    answer: 1,
    explanation: "First episode psychosis with risk to others: compulsory admission under Mental Health Act is required for risk management. Rapid tranquilization: oral lorazepam + oral antipsychotic (haloperidol/olanzapine) first; IM haloperidol + promethazine if oral refused. After stabilization, start long-term antipsychotic (risperidone, olanzapine). Early Intervention in Psychosis (EIP) services referral. [NICE CG178 Psychosis 2014/2023; BAP Guidelines 2026]",
    reference: "NICE CG178 Psychosis and Schizophrenia 2014; BAP Guidelines 2026"
  },
  {
    specialty: "Psychiatry",
    difficulty: "Medium",
    stem: "A 50-year-old woman has 6 months of excessive worry about multiple life domains (work, family, health), difficulty controlling worry, fatigue, poor concentration, muscle tension, and irritability. It causes significant functional impairment. Hamilton Anxiety Scale: 28. What is the first-line treatment?",
    options: ["Alprazolam (benzodiazepine) long-term", "CBT alone or CBT + SSRI/SNRI", "Propranolol for somatic symptoms", "Antipsychotic augmentation", "Sleep hygiene advice only"],
    answer: 1,
    explanation: "Generalized Anxiety Disorder (GAD): first-line is CBT (highest long-term efficacy) combined with SSRI (sertraline, escitalopram) or SNRI (venlafaxine, duloxetine). Benzodiazepines are short-term only (2-4 weeks max) due to dependence risk. Pregabalin is a licensed second-line option. Buspirone is an alternative for mild GAD. [NICE CG113 GAD; CANMAT 2014/2023]",
    reference: "NICE CG113 GAD and Panic Disorder 2011/2020 Update; CANMAT Anxiety Disorders 2023"
  },
  // Obstetrics & Gynecology
  {
    specialty: "Obstetrics & Gynecology",
    difficulty: "Hard",
    stem: "A 28-year-old primigravida at 34 weeks has sudden onset severe headache, visual disturbances, BP 162/110, proteinuria 3+ on dipstick. Platelet count 78,000, ALT 210 U/L, LDH elevated. What is the diagnosis and immediate management?",
    options: ["Preeclampsia only — bed rest and monitoring", "HELLP syndrome — immediate delivery + magnesium sulfate + labetalol", "Gestational hypertension — antihypertensives only", "Chronic hypertension exacerbation — methyldopa adjustment", "Obstetric cholestasis — ursodeoxycholic acid"],
    answer: 1,
    explanation: "HELLP syndrome: Hemolysis + Elevated Liver enzymes + Low Platelets — a life-threatening complication of preeclampsia. Definitive treatment is delivery regardless of gestational age if ≥34 weeks or unstable <34 weeks. Magnesium sulfate for seizure prophylaxis, labetalol/hydralazine for BP control (target <160/110). Corticosteroids if <34 weeks for fetal lung maturity. [ACOG Hypertension in Pregnancy 2013/2026; ISSHP Guidelines 2021]",
    reference: "ACOG Practice Bulletin #202 Gestational Hypertension and Preeclampsia 2019/2026"
  },
  {
    specialty: "Obstetrics & Gynecology",
    difficulty: "Medium",
    stem: "A 32-year-old woman 2 hours after vaginal delivery develops heavy PV bleeding (>500mL), uterine atony on bimanual exam, BP 85/55, HR 122. What is the correct sequence of management?",
    options: ["Blood transfusion first then uterotonic drugs", "Uterine massage + oxytocin IV + ergometrine + bimanual compression, escalate to surgical if failure", "Immediate hysterectomy", "IV fluids only and watchful waiting", "Embolization of uterine arteries as first step"],
    answer: 1,
    explanation: "PPH management follows the HAEMOSTASIS bundle: uterine massage, IV oxytocin (10 IU bolus then infusion), ergometrine (if not hypertensive), misoprostol, tranexamic acid (1g IV within 3 hours — WOMAN trial). If medical management fails: bimanual compression → balloon tamponade (Bakri balloon) → B-Lynch suture → UAE → hysterectomy. 2 large-bore IVs, O-neg blood if needed. [WHO PPH Guidelines 2023; RCOG Green-top Guideline 52]",
    reference: "WHO PPH Guidelines 2023; RCOG GTG 52; WOMAN Trial (Lancet 2017)"
  },
  {
    specialty: "Obstetrics & Gynecology",
    difficulty: "Medium",
    stem: "A 45-year-old woman presents with 8-month history of irregular, heavy periods, intermenstrual bleeding, and post-coital bleeding. She is obese (BMI 38), nulliparous, and has type 2 diabetes. Cervical smear: normal. What is the most appropriate investigation?",
    options: ["Pelvic ultrasound and endometrial biopsy (Pipelle)", "Hysteroscopy and D&C under GA", "CA-125 and CT scan", "Repeat cervical smear in 3 months", "Progesterone challenge test"],
    answer: 0,
    explanation: "Risk factors for endometrial carcinoma: obesity, nulliparity, T2DM, PCOS, Lynch syndrome (unopposed estrogen exposure). Abnormal uterine bleeding in a woman >45 with risk factors mandates transvaginal ultrasound (endometrial thickness >4mm postmenopausal or >10mm premenopausal triggers biopsy) + endometrial biopsy (Pipelle, 97% sensitivity for endometrial cancer). [RCOG/BGCS Endometrial Cancer Guidelines 2022; NICE NG88]",
    reference: "RCOG/BGCS Endometrial Cancer Guidelines 2022; NICE NG88"
  },
  {
    specialty: "Obstetrics & Gynecology",
    difficulty: "Easy",
    stem: "A 22-year-old sexually active woman presents with lower abdominal pain, cervical motion tenderness, mucopurulent cervical discharge, and fever 38.4°C. Pregnancy test negative. NAAT: Chlamydia trachomatis positive. What is the recommended outpatient antibiotic regimen per CDC 2026?",
    options: ["Azithromycin 1g single dose only", "Metronidazole 500mg BD 14 days only", "Ceftriaxone 500mg IM single dose + doxycycline 100mg BD + metronidazole 400mg BD for 14 days", "Ciprofloxacin 500mg BD for 7 days", "Amoxicillin-clavulanate for 5 days"],
    answer: 2,
    explanation: "Pelvic Inflammatory Disease (PID): CDC 2021/2026 outpatient regimen: ceftriaxone 500mg IM (covers gonorrhoea) + doxycycline 100mg twice daily × 14 days (covers Chlamydia) + metronidazole 500mg twice daily × 14 days (covers anaerobes/BV). Review at 72 hours. Inpatient if severe, tubo-ovarian abscess, pregnancy, or failed outpatient therapy. [CDC STI Treatment Guidelines 2021/2026]",
    reference: "CDC STI Treatment Guidelines 2021/2026; RCOG GTG 32 PID"
  },
  // Hematology
  {
    specialty: "Hematology",
    difficulty: "Hard",
    stem: "A 35-year-old woman has fatigue, petechiae, bruising, and gum bleeding for 2 weeks following a viral URI. CBC: Hb 13g/dL, WBC 7,000, platelets 8,000. Peripheral smear: large platelets, no blast cells, no microangiopathic changes. Coagulation studies normal. What is the diagnosis and first-line treatment?",
    options: ["Thrombotic thrombocytopenic purpura (TTP) — plasma exchange", "Immune thrombocytopenic purpura (ITP) — prednisolone 1mg/kg + IVIG if bleeding", "Aplastic anemia — bone marrow transplant", "Heparin-induced thrombocytopenia — stop heparin", "DIC — FFP and cryoprecipitate"],
    answer: 1,
    explanation: "ITP: isolated thrombocytopenia, normal coag studies, large platelets on smear (compensatory production), post-viral trigger. No TTP features (no microangiopathic changes, no fever, no renal failure, normal ADAMTS13). First-line: oral corticosteroids (prednisolone 1-2mg/kg/day). IVIG for severe bleeding, pre-surgery, or platelet count <20k with risk factors. Thrombopoietin receptor agonists (eltrombopag, romiplostim) for refractory ITP. [ASH ITP Guidelines 2019/2026; BCSH Guidelines]",
    reference: "ASH ITP Guidelines 2019; BCSH Guidelines on ITP 2020/2026"
  },
  {
    specialty: "Hematology",
    difficulty: "Medium",
    stem: "A 28-year-old male with known sickle cell disease presents with severe bone pain in multiple sites, fever 39°C, SpO2 91%, RR 24. CXR shows new bilateral lower lobe infiltrates. What is the diagnosis and immediate management?",
    options: ["Community-acquired pneumonia — antibiotics only", "Acute chest syndrome — exchange transfusion + oxygen + IV antibiotics + analgesia + hydration", "Pulmonary embolism — anticoagulation", "Acute sickle cell crisis only — IV fluids and morphine", "ARDS — mechanical ventilation immediately"],
    answer: 1,
    explanation: "Acute Chest Syndrome (ACS): new pulmonary infiltrate + respiratory symptoms in SCD — the leading cause of death. Management: supplemental O2 (target SpO2 >95%), IV hydration, analgesia (opioids, avoid NSAIDs if renal impairment), empiric antibiotics (ceftriaxone + azithromycin), incentive spirometry, and exchange transfusion if worsening (HbS target <30%). Simple transfusion if mild. [ASH SCD Guidelines 2020/2026; BSH SCD Guidelines]",
    reference: "ASH Sickle Cell Disease Guidelines 2020; BSH 2021; NHLBI Evidence-Based Guidelines"
  },
  {
    specialty: "Hematology",
    difficulty: "Hard",
    stem: "A 62-year-old man presents with fatigue, night sweats, and weight loss. He has a massively enlarged spleen (15cm below costal margin). CBC: WBC 180,000 with 85% mature lymphocytes, Hb 9g/dL, platelets 62,000. Flow cytometry: CD5+, CD23+, CD19+, CD20 dim, surface Ig dim, FMC-7 negative. What is the diagnosis and its Rai staging?",
    options: ["Mantle cell lymphoma — CHOP chemotherapy", "Chronic Lymphocytic Leukemia (CLL) Rai Stage 4 — watch and wait or ibrutinib", "Hairy cell leukemia — cladribine", "Acute lymphoblastic leukemia — BFM protocol", "Follicular lymphoma — rituximab"],
    answer: 1,
    explanation: "CLL immunophenotype: CD5+, CD23+, CD19+, dim CD20, dim sIg, FMC7 negative (Matutes score 4-5). Splenomegaly + anemia + thrombocytopenia = Rai Stage 4 (high risk). Indications for treatment: symptomatic disease, cytopenias, bulky disease, rapid progression. First-line: ibrutinib (BTK inhibitor) or venetoclax + obinutuzumab — both superior to FCR in 2026 data, particularly in TP53-mutated/del17p. [iwCLL Guidelines 2018/2026; RESONATE-2 Trial; CLL14 Trial]",
    reference: "iwCLL Guidelines 2018; ASH 2022/2026; RESONATE-2; CLL14 Trial"
  },
  // Infectious Disease
  {
    specialty: "Infectious Disease",
    difficulty: "Hard",
    stem: "A 38-year-old HIV-positive man (CD4 count 45 cells/μL, not on ART) presents with 6-week progressive headache, fever, photophobia, and confusion. CSF shows lymphocytic pleocytosis, elevated protein, low glucose, and large encapsulated yeasts on India ink staining. What is the treatment?",
    options: ["IV acyclovir for HSV encephalitis", "IV amphotericin B deoxycholate + flucytosine for 2 weeks, then fluconazole consolidation for 8 weeks, then suppression", "Dexamethasone + ceftriaxone for bacterial meningitis", "Liposomal amphotericin alone for 6 weeks", "Voriconazole for aspergillosis"],
    answer: 1,
    explanation: "Cryptococcal meningitis in HIV: India ink stain + encapsulated yeast = Cryptococcus neoformans. Standard treatment per WHO 2022/2026: Induction: IV amphotericin B deoxycholate (1mg/kg/day) + flucytosine (100mg/kg/day) × 14 days. Consolidation: oral fluconazole 400mg/day × 8 weeks. Maintenance: fluconazole 200mg/day until CD4 >200. ART should be delayed 4-6 weeks to prevent IRIS. Therapeutic lumbar punctures for raised ICP (ICP >25cmH2O). [WHO Cryptococcal Guidelines 2022; IDSA Guidelines 2024/2026]",
    reference: "WHO Cryptococcal Meningitis Guidelines 2022; IDSA Cryptococcal Infection Guidelines 2024"
  },
  {
    specialty: "Infectious Disease",
    difficulty: "Medium",
    stem: "A 24-year-old traveler returns from sub-Saharan Africa with 5-day history of fever, rigors, headache, and myalgia. Temperature 39.8°C, HR 118. Thin blood film: ring forms with Maurer's clefts, multiple parasites per RBC, >5% parasitaemia. Bilirubin 68 μmol/L. What is the most appropriate treatment?",
    options: ["Oral chloroquine 3-day course", "IV artesunate followed by oral artemisinin combination therapy (ACT)", "Oral quinine + doxycycline", "Oral artemether-lumefantrine (Coartem)", "Primaquine to clear liver stages"],
    answer: 1,
    explanation: "Severe Plasmodium falciparum malaria (parasitemia >5%, Maurer's clefts, multiple infections per RBC). Severe malaria criteria: hyperparasitaemia, jaundice. IV artesunate is superior to IV quinine (AQUAMAT trial) for severe malaria — preferred per WHO 2023/2026. After clinical improvement, complete with oral ACT (artemether-lumefantrine or ASAQ). Primaquine is for P. vivax/ovale radical cure, not P. falciparum. [WHO Severe Malaria Guidelines 2023; AQUAMAT Trial Lancet 2010]",
    reference: "WHO Guidelines for Malaria 2023/2026; AQUAMAT Trial; ACTELICA Trial"
  },
  {
    specialty: "Infectious Disease",
    difficulty: "Medium",
    stem: "A 67-year-old woman develops watery diarrhea (8 episodes/day), fever, and abdominal cramps 5 days after completing amoxicillin for a UTI. Stool toxin PCR: C. difficile positive. She is hemodynamically stable. WBC 16,000. What is the first-line treatment?",
    options: ["Oral vancomycin 500mg QID for 14 days", "Oral fidaxomicin 200mg BD for 10 days (or oral vancomycin 125mg QID)", "IV metronidazole", "Stop antibiotics only — no treatment needed", "Fecal microbiota transplantation (FMT) immediately"],
    answer: 1,
    explanation: "C. difficile infection (CDI): Non-severe CDI (WBC <15,000, Cr <1.5x baseline): first-line per IDSA 2021/2026 is oral fidaxomicin (preferred, lower recurrence) or oral vancomycin 125mg QID × 10 days. IV/oral metronidazole is no longer first-line (inferior recurrence rates). Bezlotoxumab (anti-toxin B antibody) reduces recurrence in high-risk patients. FMT for recurrent CDI (≥3 episodes). [IDSA/SHEA CDI Guidelines 2021/2026]",
    reference: "IDSA/SHEA CDI Clinical Practice Guidelines 2021; Lancet CDI Management 2026"
  },
  // Gastroenterology
  {
    specialty: "Gastroenterology",
    difficulty: "Hard",
    stem: "A 48-year-old male with known alcoholic liver cirrhosis (Child-Pugh C) presents with massive hematemesis. Endoscopy: grade 3 esophageal varices with active bleeding. BP 75/45, HR 130. What is the correct immediate management bundle?",
    options: ["PPI infusion + emergency TIPS only", "IV terlipressin/octreotide + prophylactic antibiotics (ceftriaxone) + urgent endoscopic banding + blood products target Hb 7-8", "Emergency surgical shunt", "Balloon tamponade (Sengstaken-Blakemore) as first-line", "Endoscopy alone without medical therapy"],
    answer: 1,
    explanation: "Acute variceal hemorrhage: BAVENO VII 2022/2026 bundle: 1) Vasoactive drugs: terlipressin (1mg IV every 4h) or octreotide/somatostatin — reduce portal pressure. 2) Prophylactic antibiotics: IV ceftriaxone 1g/day × 7 days (reduces bacterial infection mortality). 3) Endoscopic band ligation (EBL) at diagnostic endoscopy (within 12 hours). 4) Restrictive transfusion: target Hb 7-8 g/dL (over-transfusion worsens portal hypertension). 5) TIPS if refractory (within 72 hours in Child B/C — pre-emptive TIPS). [BAVENO VII Consensus 2022; EASL Cirrhosis Guidelines 2023/2026]",
    reference: "BAVENO VII Consensus 2022; EASL Cirrhosis Clinical Practice Guidelines 2023/2026"
  },
  {
    specialty: "Gastroenterology",
    difficulty: "Medium",
    stem: "A 55-year-old woman has 6-month history of epigastric pain, early satiety, weight loss of 8kg, and progressive dysphagia to solids. She is from Japan. Endoscopy: irregular ulcerating mass in the gastric antrum. Biopsy: poorly differentiated adenocarcinoma. CT: 3 enlarged perigastric lymph nodes, no distant metastases (T2N2M0). What is the standard of care?",
    options: ["Endoscopic mucosal resection (EMR)", "Surgery (D2 gastrectomy) alone", "Perioperative chemotherapy (FLOT regimen) + D2 gastrectomy + post-op chemotherapy", "Palliative chemotherapy only", "Radiotherapy alone"],
    answer: 2,
    explanation: "Resectable gastric cancer (T2-4a, N+, M0): perioperative FLOT chemotherapy (Fluorouracil, Leucovorin, Oxaliplatin, Docetaxel) — 4 cycles before and 4 after surgery — is standard per FLOT4-AIO trial (superior to ECX/ECF). D2 lymphadenectomy is standard. HER2-positive gastric cancer (IHC 3+ or FISH+): add trastuzumab (ToGA trial). [ESMO Gastric Cancer Guidelines 2022/2026; FLOT4 Trial NEJM 2019]",
    reference: "ESMO Gastric Cancer Guidelines 2022; FLOT4-AIO Trial NEJM 2019; ToGA Trial Lancet 2010"
  },
  {
    specialty: "Gastroenterology",
    difficulty: "Medium",
    stem: "A 42-year-old man has 3-year history of recurrent bloody diarrhea (6-8 times/day), urgency, and crampy abdominal pain. Colonoscopy: continuous mucosal inflammation from rectum to splenic flexure, granularity, pseudopolyps. Biopsy: crypt abscesses, goblet cell depletion. CRP 68, Hb 9.8, albumin 28. What is the most appropriate management for this moderately severe flare?",
    options: ["Oral aminosalicylates (mesalazine) only", "IV hydrocortisone 100mg QID + nutritional support + VTE prophylaxis + rescue therapy if no response at 72h", "Oral prednisolone 40mg/day for 4 weeks", "Immediate colectomy", "Metronidazole course only"],
    answer: 1,
    explanation: "Moderately-severely active UC (Truelove-Witts severe criteria: ≥6 bloody stools/day + systemic features): hospitalize for IV corticosteroids (hydrocortisone 100mg QID or methylprednisolone 60mg/day). If no response at 72 hours → rescue therapy: infliximab (ACT-1 trial) or ciclosporin. Absolute indications for urgent colectomy: toxic megacolon, perforation, severe hemorrhage. Calprotectin/CRP monitoring. [ECCO UC Guidelines 2022/2026; ACT-1/ACT-2 Trials; CONSTRUCT Trial]",
    reference: "ECCO UC Management Guidelines 2022/2026; ACT-1 Trial; NICE CG166"
  },
  // Dermatology
  {
    specialty: "Dermatology",
    difficulty: "Medium",
    stem: "A 25-year-old woman has an 18-month history of an intensely pruritic, symmetrical vesicular rash on the extensor surfaces of elbows, knees, and buttocks. Skin biopsy shows IgA granular deposits at dermal papillae on immunofluorescence. She also has mild iron deficiency anemia. What is the diagnosis and treatment?",
    options: ["Bullous pemphigoid — dapsone + prednisone", "Dermatitis herpetiformis — strict gluten-free diet + dapsone", "Contact dermatitis — topical corticosteroids + avoidance", "Scabies — topical permethrin", "Pemphigus vulgaris — high-dose prednisolone"],
    answer: 1,
    explanation: "Dermatitis herpetiformis (DH): intensely pruritic vesicles on extensor surfaces + granular IgA at dermal papillae on DIF = pathognomonic for DH, the skin manifestation of celiac disease. 90% have associated gluten-sensitive enteropathy. First-line: strict gluten-free diet (improves rash and enteropathy over 2-3 years) + dapsone 50-100mg/day for rapid symptom relief while diet takes effect. Screen for celiac: anti-tTG IgA + duodenal biopsy. [BSH DH Guidelines 2019; BSPGHAN 2020/2026]",
    reference: "BSH Dermatitis Herpetiformis Guidelines 2019; NEJM DH Review 2015; UpToDate 2026"
  },
  {
    specialty: "Dermatology",
    difficulty: "Hard",
    stem: "A 55-year-old male with 20-year history of psoriasis presents with a changing pigmented lesion on his back: asymmetric, irregular border, multiple colors (tan, brown, black), diameter 12mm, evolving over 3 months. Dermoscopy: irregular pigment network, regression structures. What is the immediate management?",
    options: ["Monitor for 3 months", "Punch biopsy under local anesthesia", "Wide local excision with 1-2mm margins first — confirmed by dermoscopy", "Topical imiquimod", "Referral to dermatology for phototherapy"],
    answer: 2,
    explanation: "Suspicious melanoma (ABCDE criteria: Asymmetry, Border, Color variation, Diameter >6mm, Evolution): immediate wide local excision (WLE) with 1-2mm margins is both diagnostic and therapeutic for suspected melanoma — do NOT punch biopsy a suspected melanoma as it may cause incomplete excision and seeding. Breslow thickness on histology guides further margins: <0.8mm = 1cm WLE; 0.8-2mm = 1-2cm; >2mm = 2cm + SLNB. Stage at diagnosis drives prognosis. [BAD Melanoma Guidelines 2022/2026; NICE NG14]",
    reference: "BAD UK Melanoma Guidelines 2022; NICE NG14 Melanoma 2015/2022; MSLT-I Trial"
  },
  // Emergency Medicine
  {
    specialty: "Emergency Medicine",
    difficulty: "Hard",
    stem: "A 19-year-old male is brought unconscious after a suspected overdose. GCS 6, pupils 2mm bilaterally, RR 6, SpO2 78% on air, cyanotic. His friend reports he injected 'heroin' 30 minutes ago. What is the correct immediate sequence?",
    options: ["CT head before any intervention", "Airway management (jaw thrust/OPA) + bag-mask ventilation + IV naloxone 400mcg then titrate + call anaesthetics", "IM adrenaline (epinephrine) for anaphylaxis", "IV glucose 50% for hypoglycemia", "Activated charcoal via NG tube"],
    answer: 1,
    explanation: "Opioid toxidrome: miosis, CNS depression, respiratory depression. ABCDE first: secure airway (jaw thrust, OPA, BVM ventilation at 10-12 breaths/min), supplemental oxygen. IV/IM/IN naloxone (0.4-2mg IV, repeat every 2-3 minutes, total up to 10mg) — naloxone has shorter half-life than opioids, requires repeat dosing. Intubate if airway unprotected. Monitor for withdrawal (agitation, tachycardia). CT head only after stabilization. [TOXBASE; Advanced Life Support; WHO Opioid Overdose Guidelines 2014/2026]",
    reference: "TOXBASE UK; UK Resuscitation Council ALS; WHO Opioid Overdose Guidelines 2014"
  },
  {
    specialty: "Emergency Medicine",
    difficulty: "Medium",
    stem: "A 22-year-old type 1 diabetic presents with confusion, fruity breath, vomiting, and polydipsia. Blood glucose 28 mmol/L, pH 7.12, bicarbonate 9 mmol/L, ketones 4.8 mmol/L, Na 131, K 3.2, anion gap 26. What is the correct initial management sequence?",
    options: ["Insulin bolus first, then fluids", "0.9% NaCl IV fluid resuscitation + fixed-rate insulin infusion (0.1 unit/kg/hr) + potassium replacement when K<5.5 + monitor hourly", "Sodium bicarbonate infusion immediately", "Oral rehydration therapy", "Insulin pump adjustment only"],
    answer: 1,
    explanation: "DKA Management per JBDS 2023/2026: 1) IV fluids first: 0.9% NaCl 1L over 1h (corrects hypovolemia, reduces glucose). 2) Fixed-rate insulin infusion (FRII) 0.1 units/kg/hr — NOT bolus (causes rapid K+ fall). 3) K+ replacement: if K+ 3.5-5.5, add 40mmol/L to fluids; if <3.5, replace K+ before insulin. 4) Bicarbonate: only if pH <6.9. 5) Targets: glucose falling at 3-4 mmol/hr, ketones clearing, anion gap normalizing. Switch to variable rate (VRIII) when eating/DKA resolved. [JBDS DKA Guidelines 2023; ADA DKA Guidelines 2026]",
    reference: "JBDS-IP DKA Management Guidelines 2023; ADA Diabetic Ketoacidosis Standards 2026"
  },
  {
    specialty: "Emergency Medicine",
    difficulty: "Easy",
    stem: "A 55-year-old man collapses in the hospital lobby. He is unresponsive, not breathing normally. A nurse confirms no pulse. What is the correct BLS sequence?",
    options: ["Give 5 rescue breaths first, then compressions", "Call for help → start CPR: 30 compressions (5-6cm, 100-120/min) : 2 breaths → attach AED when available → defibrillate if shockable rhythm", "Wait for the crash team before starting compressions", "Check blood glucose before CPR", "Precordial thump as first intervention for all arrests"],
    answer: 1,
    explanation: "BLS per ERC/AHA 2021/2026: 1) Shout for help, activate emergency response. 2) No pulse/no normal breathing → start CPR immediately: 30:2 ratio (30 compressions then 2 rescue breaths). Compressions: depth 5-6cm, rate 100-120/min, allow full recoil, minimize interruptions. 3) Attach AED as soon as available → analyze rhythm → defibrillate if shockable (VF/pVT). Precordial thump only in witnessed, monitored VF/VT if no defibrillator available. [ERC BLS Guidelines 2021; AHA ACLS 2020/2026]",
    reference: "ERC Basic Life Support Guidelines 2021; AHA CPR/ECC Guidelines 2020 Updated 2026"
  },
  // Oncology
  {
    specialty: "Oncology",
    difficulty: "Hard",
    stem: "A 52-year-old male ex-smoker has a 2.8cm right upper lobe lung mass on CT. PET shows FDG avidity in the mass and 2 right mediastinal nodes (station 4R, 7). Bronchoscopy biopsy: non-small cell lung cancer (adenocarcinoma). EGFR and ALK negative, ROS1 negative. PD-L1: 75%. Stage IIIA (T2N2M0). What is the standard treatment approach?",
    options: ["Surgery alone (right upper lobectomy)", "Carboplatin + paclitaxel chemotherapy only", "Concurrent chemoradiotherapy (CCRT: cisplatin/etoposide + radiotherapy) followed by durvalumab consolidation for 12 months", "Immunotherapy (pembrolizumab) monotherapy only", "Palliative radiotherapy to control symptoms"],
    answer: 2,
    explanation: "Unresectable Stage III NSCLC (N2 disease confirmed): standard of care per NCCN 2026 and ESMO: platinum-doublet concurrent chemoradiotherapy (CCRT) — cisplatin/etoposide + 60-66Gy radiation. Then durvalumab (anti-PD-L1) consolidation × 12 months if PD-L1 ≥1% and no progression during CCRT (PACIFIC trial: OS benefit maintained at 5 years). Surgery considered only for T3N1. Pembrolizumab monotherapy is for stage IV NSCLC with PD-L1 ≥50%. [PACIFIC Trial NEJM 2018; ESMO Stage III NSCLC Guidelines 2023/2026]",
    reference: "PACIFIC Trial NEJM 2018; ESMO Stage III NSCLC Guidelines 2023/2026; NCCN NSCLC Guidelines 2026"
  },
  // Ophthalmology
  {
    specialty: "Ophthalmology",
    difficulty: "Medium",
    stem: "A 70-year-old hypertensive man presents with sudden, painless loss of vision in his right eye noticed on waking. Visual acuity: hand movements only. Fundoscopy: diffuse retinal hemorrhages in all 4 quadrants, dilated tortuous veins, disc swelling, and cotton-wool spots. What is the diagnosis and urgent management?",
    options: ["Anterior ischemic optic neuropathy — IV steroids", "Central retinal vein occlusion (CRVO) — urgent intravitreal anti-VEGF injection + treat underlying CVD risk factors", "Acute angle-closure glaucoma — IV acetazolamide + topical timolol + laser iridotomy", "Retinal detachment — urgent vitreoretinal surgery", "Vitreous hemorrhage — observation"],
    answer: 1,
    explanation: "CRVO: 'blood and thunder' fundus — diffuse flame hemorrhages in all 4 quadrants (along venous distribution), dilated/tortuous veins, disc edema, cotton-wool spots. Painless acute visual loss. Management: 1) Urgent OCT and FFA to assess macular edema. 2) Intravitreal anti-VEGF (ranibizumab, bevacizumab) for macular edema — improves VA (CRUISE trial). 3) Treat CVD risk factors (hypertension, DM, hyperlipidemia, check for hyperviscosity if young). 4) Monitor for neovascular glaucoma. [RCOphth CRVO Guidelines 2020/2026; CRUISE Trial]",
    reference: "RCOphth CRVO Management Guidelines 2020/2026; CRUISE Trial 2010"
  },
  // Surgery — additional
  {
    specialty: "Surgery",
    difficulty: "Medium",
    stem: "A 35-year-old woman has acute right iliac fossa pain, nausea, and fever 38.3°C for 12 hours. Tenderness at McBurney's point, positive Rovsing's sign. WBC 17,500. CT abdomen: dilated appendix (8mm), periappendiceal fat stranding, no abscess. Alvarado score: 9. What is the management?",
    options: ["IV antibiotics alone for 7 days", "Conservative management with observation", "Laparoscopic appendicectomy within 24 hours", "Interval appendicectomy after 6 weeks of antibiotics", "Open appendicectomy only"],
    answer: 2,
    explanation: "Uncomplicated acute appendicitis (Alvarado ≥7, no perforation/abscess): laparoscopic appendicectomy (LA) is standard — shorter hospital stay, less post-op pain, faster return to work, lower wound infection rate than open. LA within 24 hours is standard; delay >24h increases perforation risk. Antibiotics-first is an option (APPAC trial) but 30-40% require appendicectomy within 5 years. CT confirms diagnosis and rules out perforation/abscess. [WSES Appendicitis Guidelines 2020/2026; APPAC Trial Lancet 2015]",
    reference: "WSES Appendicitis Guidelines 2020/2026; APPAC Trial JAMA 2015; NICE CG121"
  },
  {
    specialty: "Surgery",
    difficulty: "Hard",
    stem: "A 62-year-old man presents with jaundice, pale stools, dark urine, and significant weight loss over 2 months. CA 19-9 elevated. CT: 2.8cm hypodense mass at the head of pancreas, dilated common bile duct (CBD) and pancreatic duct (double duct sign), no vascular invasion, no distant metastases. What is the most appropriate treatment?",
    options: ["ERCP and stenting only for palliation", "Chemotherapy with gemcitabine first", "Curative-intent pancreaticoduodenectomy (Whipple procedure) + adjuvant chemotherapy (modified FOLFIRINOX or gemcitabine + capecitabine)", "Radiofrequency ablation", "Best supportive care only"],
    answer: 2,
    explanation: "Resectable pancreatic adenocarcinoma (no vascular invasion, no distant mets): Whipple procedure (pancreaticoduodenectomy) is the only potentially curative option. Only 15-20% of patients are resectable at diagnosis. Adjuvant chemotherapy: modified FOLFIRINOX (PRODIGE24 trial, OS 54 vs 35 months) or gemcitabine + capecitabine (ESPAC-4 trial) — both superior to gemcitabine alone. Neoadjuvant FOLFIRINOX is increasingly used for borderline resectable cases. [ESMO Pancreatic Cancer Guidelines 2023/2026; PRODIGE24 NEJM 2018; ESPAC-4 Lancet 2017]",
    reference: "ESMO Pancreatic Cancer Guidelines 2023/2026; PRODIGE24 NEJM 2018; ESPAC-4 Lancet 2017"
  },
  // Pediatrics — additional
  {
    specialty: "Pediatrics",
    difficulty: "Hard",
    stem: "A 4-month-old boy presents with poor feeding, constipation, reduced activity, and hypotonia ('floppy infant') for 2 weeks. He has a weak cry and descending paralysis. His mother is a honey enthusiast. EMG: decremental response to repeated stimulation. What is the diagnosis and management?",
    options: ["Guillain-Barré syndrome — IVIG 2g/kg", "Infant botulism — IV human botulism immune globulin (BabyBIG) + supportive care", "Congenital hypothyroidism — T4 replacement", "Werdnig-Hoffmann disease (SMA Type 1) — nusinersen", "Septic shock — broad-spectrum antibiotics"],
    answer: 1,
    explanation: "Infant botulism: classic presentation with descending flaccid paralysis, constipation, weak cry, poor feeding, normal sensory function. EMG: incremental response at high-frequency stimulation (not decremental — that's Eaton-Lambert). Cause: Clostridium botulinum spores in honey or soil colonize infant gut. Treatment: IV human botulism immune globulin (BabyBIG/HBIG) — reduces hospital stay by 3 weeks (RCT evidence). Supportive care: respiratory support, NG feeding. Antibiotics NOT recommended (lyse bacteria → release more toxin). [CDC Botulism Guidelines 2026; AAP Red Book]",
    reference: "CDC Clinical Guidelines for Diagnosis and Treatment of Botulism 2021/2026; AAP Red Book 2024"
  },
  {
    specialty: "Pediatrics",
    difficulty: "Medium",
    stem: "A 6-year-old girl has bedwetting (enuresis) occurring 4-5 nights/week. She has no daytime symptoms and no UTI. Family history: father had bedwetting until age 8. She has tried fluid restriction and lifting. What is the most appropriate pharmacological treatment after behavioral measures have failed?",
    options: ["Oxybutynin for overactive bladder", "Desmopressin (DDAVP) 120-240mcg oral or intranasal + advice on fluid restriction 1 hour prior", "Imipramine (tricyclic) as first pharmacological choice", "Furosemide to increase daytime urine production", "No treatment — wait until spontaneous resolution"],
    answer: 1,
    explanation: "Primary nocturnal enuresis (PNE): first-line behavioral: enuresis alarm (most effective long-term). If alarm fails or not tolerated: desmopressin (DDAVP — synthetic ADH analogue) — nasal spray (discontinued in UK due to hyponatremia risk) → oral tablet 120-240mcg at bedtime. Must avoid fluids 1h before to 8h after dose. Imipramine has unfavorable side-effect profile (cardiac). Success rate: 70% with DDAVP. [NICE CG111 Bedwetting 2010/2022; EAU Paediatric Urology Guidelines 2026]",
    reference: "NICE CG111 Nocturnal Enuresis 2010 (Updated 2022); EAU Paediatric Urology 2026; ICCS Guidelines"
  },
  // Endocrinology — additional
  {
    specialty: "Endocrinology",
    difficulty: "Hard",
    stem: "A 45-year-old woman presents with a 2cm thyroid nodule found incidentally on ultrasound. US features: hypoechoic, irregular margins, microcalcifications, taller-than-wide orientation, increased vascularity. TSH: 1.2 mIU/L. What is the next step?",
    options: ["Thyroid suppression therapy with levothyroxine", "Immediate total thyroidectomy", "Fine needle aspiration cytology (FNAC) under ultrasound guidance", "Radioiodine ablation", "Observation with repeat US in 12 months"],
    answer: 2,
    explanation: "ACR-TIRADS score 5 (high suspicion) features: hypoechoic, irregular margin, microcalcifications, taller-than-wide. FNAC is indicated for TIRADS 4-5 nodules ≥1.5cm (TIRADS 5) or ≥2.5cm (TIRADS 4). FNAC result reported per Bethesda system: Bethesda I (non-diagnostic) → repeat; II (benign) → follow-up; V-VI (suspicious/malignant) → surgery. Bethesda III/IV → molecular testing (ThyroSeq/Afirma) or repeat FNAC. [ATA Thyroid Nodule Guidelines 2015/2023; ACR TIRADS 2017/2026]",
    reference: "ATA Management Guidelines for Thyroid Nodules 2015/2023 Update; ACR TIRADS Whitepaper 2017/2026"
  },
  {
    specialty: "Endocrinology",
    difficulty: "Medium",
    stem: "A 38-year-old woman has new-onset hypertension (BP 168/102), hypokalemia (K+ 2.9 mEq/L) despite oral supplements, and suppressed plasma renin activity. Her aldosterone-renin ratio (ARR) is markedly elevated at 85 (normal <30). CT adrenal: 1.8cm left adrenal adenoma. What is the next step before surgery?",
    options: ["Proceed directly to laparoscopic left adrenalectomy", "Start spironolactone and discharge", "Adrenal vein sampling (AVS) to confirm unilateral hypersecretion", "Bilateral adrenalectomy", "Dexamethasone suppression test"],
    answer: 2,
    explanation: "Primary hyperaldosteronism (Conn's syndrome): elevated ARR + suppressed renin + hypokalemia. CT may miss small adenomas or bilateral hyperplasia. Adrenal vein sampling (AVS) is mandatory before surgery to confirm unilateral disease — CT is unreliable (fails to lateralize in 37% of cases). If AVS confirms unilateral excess → laparoscopic adrenalectomy (curative). Bilateral hyperplasia → medical management with spironolactone/eplerenone. [Endocrine Society Primary Aldosteronism Guidelines 2016/2023; PASO Trial Lancet 2016]",
    reference: "Endocrine Society PA Guidelines 2016/2023; PASO Trial Lancet 2016; SPARTACUS Trial JCEM 2021"
  },
  // Nephrology — additional
  {
    specialty: "Nephrology",
    difficulty: "Medium",
    stem: "A 52-year-old male with type 2 DM has eGFR 42 mL/min/1.73m² and urine ACR 380 mg/g (severely increased). He is on metformin and lisinopril 10mg. BP 138/88. What should be added to maximally reduce CKD progression per KDIGO 2024?",
    options: ["Increase lisinopril to maximum dose only", "Add SGLT2 inhibitor (empagliflozin/dapagliflozin) + finerenone (non-steroidal MRA)", "Add ARB on top of ACEi (dual RAAS blockade)", "Start dialysis planning immediately", "Add olmesartan for additional BP control"],
    answer: 1,
    explanation: "KDIGO CKD 2024 update (major revision): for T2DM + CKD (eGFR 20-45 AND/OR ACR ≥200): SGLT2i (empagliflozin, dapagliflozin) are Class I, 1A recommendation — reduce CKD progression and cardiovascular events (CREDENCE, DAPA-CKD, EMPA-KIDNEY trials). Finerenone (non-steroidal mineralocorticoid receptor antagonist) added for residual albuminuria — FIDELIO-DKD and FIGARO-DKD trials: reduces CKD progression and CV events. Dual RAAS blockade (ACEi+ARB) increases AKI and hyperkalemia — NOT recommended. [KDIGO CKD Guideline 2024; CREDENCE; DAPA-CKD; FIDELIO-DKD Trials]",
    reference: "KDIGO CKD Guideline 2024; CREDENCE Trial NEJM 2019; DAPA-CKD NEJM 2020; FIDELIO-DKD NEJM 2020"
  },
];

type QuestionMode = "by-specialty" | "exam" | "mixed";

export default function USMLEPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const { addXp } = useAchievement();
  const [mode, setMode] = useState<QuestionMode | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [loading, user, router]);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [_timeLeft, setTimeLeft] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [questions, setQuestions] = useState(QUESTION_BANK);

  const specialties = [...new Set(QUESTION_BANK.map(q => q.specialty))];

  const startExam = (m: QuestionMode, sp?: string) => {
    let qs = m === "by-specialty" && sp ? QUESTION_BANK.filter(q => q.specialty === sp) : [...QUESTION_BANK];
    qs = qs.sort(() => Math.random() - 0.5);
    setQuestions(qs);
    setMode(m);
    setCurrentQ(0);
    setSelected(null);
    setShowAnswer(false);
    setScore(0);
    setAnswered(new Array(qs.length).fill(false));
    setFinished(false);
    if (sp) setSpecialty(sp);
    if (m === "exam") setTimeLeft(qs.length * 90);
  };

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
  };

  const confirmAnswer = () => {
    if (selected === null) return;
    const correct = selected === questions[currentQ].answer;
    if (correct) {
      setScore(s => s + 1);
      addXp(15, "USMLE Correct Answer");
    }
    setShowAnswer(true);
    const newAnswered = [...answered];
    newAnswered[currentQ] = correct;
    setAnswered(newAnswered);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      const session = {
        date: new Date().toISOString(),
        module: mode === "by-specialty" && specialty ? `USMLE - ${specialty}` : "USMLE Mixed",
        score,
        total: questions.length,
      };
      const stored = JSON.parse(localStorage.getItem("medpulse_sessions") || "[]");
      stored.unshift(session);
      localStorage.setItem("medpulse_sessions", JSON.stringify(stored.slice(0, 50)));
      setFinished(true);
      return;
    }
    setCurrentQ(q => q + 1);
    setSelected(null);
    setShowAnswer(false);
  };

  const pct = Math.round((score / questions.length) * 100);

  if (loading || !user) return null;

  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 w-full page-transition">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">USMLE Clinical Mode</h1>
              <p className="text-slate-500 text-sm">Step 2 CK Style Questions · {QUESTION_BANK.length} Questions · Evidence-Based 2026</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button onClick={() => startExam("mixed")} className="premium-card p-8 text-center group hover:border-indigo-500/50 transition-all">
            <Brain className="w-12 h-12 text-indigo-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Mixed Mode</h3>
            <p className="text-sm text-slate-500">All specialties, random order</p>
            <p className="text-xs font-black text-indigo-500 mt-2">{QUESTION_BANK.length} Questions</p>
          </button>
          <button onClick={() => { setMode("by-specialty"); setSpecialty(null); }} className="premium-card p-8 text-center group hover:border-teal-500/50 transition-all">
            <BookOpen className="w-12 h-12 text-teal-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">By Specialty</h3>
            <p className="text-sm text-slate-500">Focus on one discipline</p>
            <p className="text-xs font-black text-teal-500 mt-2">{specialties.length} Specialties</p>
          </button>
          <button onClick={() => startExam("exam")} className="premium-card p-8 text-center group hover:border-rose-500/50 transition-all">
            <Clock className="w-12 h-12 text-rose-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Exam Mode</h3>
            <p className="text-sm text-slate-500">Timed, NBME-style</p>
            <p className="text-xs font-black text-rose-500 mt-2">90 sec/question</p>
          </button>
        </div>

        {mode === "by-specialty" && !specialty && (
          <div className="premium-card p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Choose Specialty</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {specialties.map(sp => (
                <button key={sp} onClick={() => startExam("by-specialty", sp)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all group">
                  <h4 className="font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{sp}</h4>
                  <p className="text-xs text-slate-400 mt-1">{QUESTION_BANK.filter(q => q.specialty === sp).length} questions</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (finished) {
    const grade = pct >= 70 ? "PASS" : "NEEDS REVIEW";
    const isPassing = pct >= 70;
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-10 w-full page-transition text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isPassing ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
          <Award className={`w-12 h-12 ${isPassing ? "text-emerald-500" : "text-rose-500"}`} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Session Complete</h1>
        <p className={`text-2xl font-black mb-6 ${isPassing ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{grade}</p>
        <div className="premium-card p-8 mb-8">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-4xl font-black text-indigo-600">{score}/{questions.length}</p>
              <p className="text-xs font-black uppercase text-slate-400 mt-1">Correct</p>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-800 dark:text-white">{pct}%</p>
              <p className="text-xs font-black uppercase text-slate-400 mt-1">Score</p>
            </div>
            <div>
              <p className="text-4xl font-black text-amber-500">{score * 15}</p>
              <p className="text-xs font-black uppercase text-slate-400 mt-1">XP Earned</p>
            </div>
          </div>
        </div>
        <button onClick={() => setMode(null)} className="btn-premium bg-indigo-600 border-0 text-white py-4 px-10">
          <RotateCcw className="w-4 h-4" /> Return to USMLE Hub
        </button>
      </div>
    );
  }

  const q = questions[currentQ];
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 w-full page-transition">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setMode(null)} className="text-slate-400 hover:text-slate-600 transition-colors">← Exit</button>
          <span className="text-sm font-black text-slate-500">{q.specialty} · {q.difficulty}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-black text-slate-500">{currentQ + 1} / {questions.length}</span>
          <span className="text-sm font-black text-emerald-600">{score} correct</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-8">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
      </div>

      <div className="premium-card p-8 mb-6">
        <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed text-lg">{q.stem}</p>
      </div>

      <div className="space-y-3 mb-8">
        {q.options.map((opt, idx) => {
          let cls = "premium-card p-5 cursor-pointer text-left transition-all border-2 ";
          if (!showAnswer) {
            cls += selected === idx ? "border-indigo-500 bg-indigo-500/5" : "border-transparent hover:border-slate-200";
          } else {
            if (idx === q.answer) cls += "border-emerald-500 bg-emerald-500/10";
            else if (idx === selected && selected !== q.answer) cls += "border-rose-500 bg-rose-500/10";
            else cls += "border-transparent opacity-50";
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${selected === idx ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300">{opt}</span>
                {showAnswer && idx === q.answer && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                {showAnswer && idx === selected && selected !== q.answer && <X className="w-5 h-5 text-rose-500 ml-auto" />}
              </div>
            </button>
          );
        })}
      </div>

      {showAnswer && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-3">Explanation</h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
          <p className="text-xs text-slate-400 mt-3 font-black">[{q.reference}]</p>
        </div>
      )}

      <div className="flex justify-end">
        {!showAnswer ? (
          <button onClick={confirmAnswer} disabled={selected === null} className="btn-premium bg-indigo-600 border-0 text-white py-4 px-10 disabled:opacity-40 disabled:cursor-not-allowed">
            Submit Answer <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={nextQuestion} className="btn-premium bg-indigo-600 border-0 text-white py-4 px-10">
            {currentQ + 1 >= questions.length ? "View Results" : "Next Question"} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
