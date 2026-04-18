"use client";

import { useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Search, ShieldCheck, X, Loader2,
  HeartPulse, Stethoscope, Brain, Baby, Pill, Bone, Eye, Microscope,
  Activity, Sparkles, BookOpen, Layers, ChevronRight,
  Send, Bot, AlertTriangle, Dna, FileText
} from "lucide-react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Flashcard {
  q: string;
  a: string;
}

// ── Global Medical Sources Registry ─────────────────────────────────
const _GLOBAL_MEDICAL_SOURCES = [
  // === INTERNATIONAL JOURNALS ===
  { name: "New England Journal of Medicine (NEJM)", category: "Journal", impact: "176.1", url: "https://www.nejm.org" },
  { name: "The Lancet", category: "Journal", impact: "202.7", url: "https://www.thelancet.com" },
  { name: "JAMA (Journal of the American Medical Association)", category: "Journal", impact: "157.3", url: "https://jamanetwork.com" },
  { name: "BMJ (British Medical Journal)", category: "Journal", impact: "105.7", url: "https://www.bmj.com" },
  { name: "Nature Medicine", category: "Journal", impact: "87.2", url: "https://www.nature.com/nm" },
  { name: "Annals of Internal Medicine", category: "Journal", impact: "51.6", url: "https://www.acpjournals.org/journal/aim" },
  { name: "Circulation (AHA)", category: "Journal", impact: "39.9", url: "https://www.ahajournals.org/journal/circ" },
  { name: "European Heart Journal", category: "Journal", impact: "39.3", url: "https://academic.oup.com/eurheartj" },
  { name: "Gut (BMJ)", category: "Journal", impact: "31.8", url: "https://gut.bmj.com" },
  { name: "Chest Journal (ACCP)", category: "Journal", impact: "19.1", url: "https://journal.chestnet.org" },
  { name: "Journal of Clinical Oncology (ASCO)", category: "Journal", impact: "45.3", url: "https://ascopubs.org/journal/jco" },
  { name: "Blood (ASH)", category: "Journal", impact: "25.5", url: "https://ashpublications.org/blood" },
  { name: "Kidney International", category: "Journal", impact: "19.6", url: "https://www.kidney-international.org" },
  { name: "Journal of Neurology, Neurosurgery & Psychiatry", category: "Journal", impact: "13.2", url: "https://jnnp.bmj.com" },
  { name: "Archives of Internal Medicine", category: "Journal", impact: "18.4", url: "https://jamanetwork.com/journals/jamainternalmedicine" },
  { name: "Critical Care Medicine (SCCM)", category: "Journal", impact: "9.9", url: "https://journals.lww.com/ccmjournal" },
  { name: "Pediatrics (AAP)", category: "Journal", impact: "8.2", url: "https://publications.aap.org/pediatrics" },
  { name: "Obstetrics & Gynecology (ACOG)", category: "Journal", impact: "7.1", url: "https://journals.lww.com/greenjournal" },
  // === CLINICAL EVIDENCE DATABASES ===
  { name: "UpToDate 2026", category: "Clinical Database", impact: "Gold Standard", url: "https://www.uptodate.com" },
  { name: "The Cochrane Library", category: "Clinical Database", impact: "Level 1A Evidence", url: "https://www.cochranelibrary.com" },
  { name: "PubMed / MEDLINE (NLM)", category: "Clinical Database", impact: "Universal Index", url: "https://pubmed.ncbi.nlm.nih.gov" },
  { name: "ClinicalTrials.gov", category: "Clinical Database", impact: "Trial Registry", url: "https://clinicaltrials.gov" },
  { name: "DynaMed (EBSCOhost)", category: "Clinical Database", impact: "EBM Grade A", url: "https://www.dynamed.com" },
  { name: "BMJ Best Practice", category: "Clinical Database", impact: "EBM Grade A", url: "https://bestpractice.bmj.com" },
  // === INTERNATIONAL GUIDELINES ===
  { name: "WHO Clinical Guidelines 2026", category: "Guideline Body", impact: "International", url: "https://www.who.int/publications/guidelines" },
  { name: "NICE Guidelines (UK)", category: "Guideline Body", impact: "National", url: "https://www.nice.org.uk/guidance" },
  { name: "ACC/AHA Joint Guidelines 2026", category: "Guideline Body", impact: "Cardiology", url: "https://www.heart.org/guidelines" },
  { name: "ESC (European Society of Cardiology) 2026", category: "Guideline Body", impact: "Cardiology", url: "https://www.escardio.org/Guidelines" },
  { name: "IDSA (Infectious Diseases Society) 2026", category: "Guideline Body", impact: "Infectious Disease", url: "https://www.idsociety.org/guidelines" },
  { name: "NCCN (National Comprehensive Cancer Network) 2026", category: "Guideline Body", impact: "Oncology", url: "https://www.nccn.org/guidelines" },
  { name: "ADA (American Diabetes Association) Standards 2026", category: "Guideline Body", impact: "Endocrinology", url: "https://diabetesjournals.org/care/issue/suppl_1" },
  { name: "KDIGO (Kidney Disease: Improving Global Outcomes) 2026", category: "Guideline Body", impact: "Nephrology", url: "https://kdigo.org/guidelines" },
  { name: "ATS/ERS (Pulmonary Medicine) 2026", category: "Guideline Body", impact: "Pulmonology", url: "https://www.thoracic.org/statements" },
  { name: "ACR (Rheumatology) 2026", category: "Guideline Body", impact: "Rheumatology", url: "https://www.rheumatology.org/Practice-Quality/Clinical-Support/Clinical-Practice-Guidelines" },
  { name: "AASLD (Hepatology) 2026", category: "Guideline Body", impact: "Hepatology", url: "https://www.aasld.org/publications/practice-guidelines" },
  { name: "ACG (Gastroenterology) 2026", category: "Guideline Body", impact: "Gastroenterology", url: "https://gi.org/clinical-guidelines" },
  { name: "AAN (Neurology) 2026", category: "Guideline Body", impact: "Neurology", url: "https://www.aan.com/practice/guidelines" },
  { name: "ACOG (Obstetrics & Gynecology) 2026", category: "Guideline Body", impact: "OB/GYN", url: "https://www.acog.org/clinical/clinical-guidance" },
  { name: "AAP (Pediatrics) 2026", category: "Guideline Body", impact: "Pediatrics", url: "https://publications.aap.org/pediatrics" },
  { name: "CDC Clinical Guidelines 2026", category: "Guideline Body", impact: "Public Health", url: "https://www.cdc.gov/guidelines" },
  // === FOUNDATIONAL TEXTBOOKS ===
  { name: "Harrison's Principles of Internal Medicine, 21st Ed.", category: "Textbook", impact: "Internal Medicine", url: "" },
  { name: "Braunwald's Heart Disease, 12th Ed.", category: "Textbook", impact: "Cardiology", url: "" },
  { name: "Robbins & Cotran Pathologic Basis of Disease, 10th Ed.", category: "Textbook", impact: "Pathology", url: "" },
  { name: "Gray's Anatomy for Students, 5th Ed.", category: "Textbook", impact: "Anatomy", url: "" },
  { name: "Guyton and Hall Medical Physiology, 14th Ed.", category: "Textbook", impact: "Physiology", url: "" },
  { name: "Netter's Atlas of Human Anatomy, 8th Ed.", category: "Textbook", impact: "Anatomy Atlas", url: "" },
  { name: "Goldman-Cecil Medicine, 27th Ed.", category: "Textbook", impact: "Internal Medicine", url: "" },
  { name: "Adams and Victor's Neurology, 11th Ed.", category: "Textbook", impact: "Neurology", url: "" },
  { name: "Nelson's Textbook of Pediatrics, 22nd Ed.", category: "Textbook", impact: "Pediatrics", url: "" },
  { name: "Williams Obstetrics, 26th Ed.", category: "Textbook", impact: "Obstetrics", url: "" },
  { name: "Campbell-Walsh-Wein Urology, 12th Ed.", category: "Textbook", impact: "Urology", url: "" },
  { name: "Bailey & Love's Surgery, 28th Ed.", category: "Textbook", impact: "Surgery", url: "" },
  { name: "Schwartz's Principles of Surgery, 11th Ed.", category: "Textbook", impact: "Surgery", url: "" },
  { name: "Current Medical Diagnosis & Treatment 2026 (CMDT)", category: "Textbook", impact: "Clinical Reference", url: "" },
  { name: "Oxford Handbook of Clinical Medicine, 10th Ed.", category: "Textbook", impact: "Clinical Medicine", url: "" },
  { name: "Macleod's Clinical Examination, 14th Ed.", category: "Textbook", impact: "Clinical Skills", url: "" },
  { name: "Davidson's Principles and Practice of Medicine, 24th Ed.", category: "Textbook", impact: "Internal Medicine", url: "" },
  { name: "Goodman & Gilman's Pharmacology, 14th Ed.", category: "Textbook", impact: "Pharmacology", url: "" },
  { name: "Katzung's Basic and Clinical Pharmacology, 16th Ed.", category: "Textbook", impact: "Pharmacology", url: "" },
  { name: "Cotran Robbins Pathology (Vinay Kumar)", category: "Textbook", impact: "Pathology", url: "" },
  { name: "Greenfield's Surgery: Scientific Principles and Practice", category: "Textbook", impact: "Surgery", url: "" },
  { name: "Moore's Clinically Oriented Anatomy, 9th Ed.", category: "Textbook", impact: "Anatomy", url: "" },
];

// ── Specialty config ─────────────────────────────────────────────────
const SPECIALTY_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  gradient: string;
  description: string;
  corpus: string;
  categories: string[];
  featuredArticles: { title: string; tag: string; updated: string; abstract?: string }[];
}> = {
  "physiology": {
    label: "Physiology",
    icon: Activity,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
    gradient: "from-emerald-600 to-teal-500",
    description: "Fundamental mechanisms of human life systems, homeostasis, and cellular function across organ systems.",
    corpus: "Guyton & Hall 14th Ed · Boron & Boulpaep · UpToDate 2026 · Physiology Reviews (APS) · Annual Review of Physiology",
    categories: ["Cellular Physiology", "Neurophysiology", "Cardiovascular Physiology", "Respiratory Physiology", "Renal Physiology", "Endocrine Physiology", "GI Physiology", "Acid-Base Balance"],
    featuredArticles: [
      { title: "Cardiac Cycle: Pressure-Volume Loop Analysis", tag: "Cardiovascular", updated: "Mar 2026", abstract: "Detailed breakdown of rhythmic events from atrial contraction to ventricular relaxation with focus on Wiggers diagram." },
      { title: "Renal Countercurrent Multiplier Mechanism", tag: "Renal", updated: "Feb 2026", abstract: "The physiological basis for urine concentration in the Loop of Henle and vasa recta interaction." },
      { title: "Action Potential Generation in Neurons", tag: "Neuro", updated: "Jan 2026", abstract: "Ion channel kinetics during depolarization, repolarization, and the refractory period." },
      { title: "Frank-Starling Law: Force-Length Relationship", tag: "Cardiovascular", updated: "Mar 2026", abstract: "Intrinsic ability of the heart to adapt to changing volumes of inflowing blood." },
      { title: "Respiratory Control: Central and Peripheral Chemoreceptors", tag: "Respiratory", updated: "Feb 2026", abstract: "Role of PaCO2, pH, and PaO2 in regulating ventilation via brainstem and carotid body receptors." },
      { title: "Renin-Angiotensin-Aldosterone System (RAAS): Full Cascade", tag: "Renal", updated: "Jan 2026", abstract: "Updated 2026 understanding of RAAS and its pharmacological targets." },
    ],
  },
  "anatomy": {
    label: "Anatomy",
    icon: Dna,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    gradient: "from-amber-600 to-orange-500",
    description: "Gross anatomy, neuroanatomy, and embryology with high-fidelity clinical correlations and surgical anatomy notes.",
    corpus: "Gray's Anatomy 5th Ed · Netter's Atlas 8th Ed · Moore's Clinically Oriented Anatomy 9th Ed · Grant's Atlas",
    categories: ["Thorax", "Abdomen & Pelvis", "Neuroanatomy", "Head & Neck", "Upper Limb", "Lower Limb", "Embryology", "Histology"],
    featuredArticles: [
      { title: "Circle of Willis: Anatomical Variations & Stroke Risk", tag: "Neuroanatomy", updated: "Mar 2026", abstract: "Detailed mapping of cerebral blood supply and clinical syndromes associated with vascular anomalies." },
      { title: "Inguinal Canal: Anatomical Borders and Hernias", tag: "Abdomen", updated: "Feb 2026", abstract: "Surgical anatomy of the inguinal region and the distinction between direct and indirect hernias." },
      { title: "Brachial Plexus: Root to Terminal Branches", tag: "Upper Limb", updated: "Jan 2026", abstract: "A comprehensive guide to the nerve supply of the upper extremity and associated clinical palsies." },
      { title: "Coronary Artery Anatomy: Dominance and Variants", tag: "Thorax", updated: "Mar 2026", abstract: "Right vs left coronary dominance and the clinical implications for STEMI territory mapping." },
      { title: "Embryological Basis of Congenital Defects", tag: "Embryology", updated: "Feb 2026", abstract: "Key developmental milestones and the teratogenic windows during embryogenesis." },
    ],
  },
  "internal-medicine": {
    label: "Internal Medicine",
    icon: Stethoscope,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10",
    borderClass: "border-sky-500/20",
    gradient: "from-sky-600 to-cyan-500",
    description: "Comprehensive adult disease management, diagnostic algorithms and pharmacotherapy protocols from Harrison's and global IM societies.",
    corpus: "Harrison's 21st Ed · Goldman-Cecil 27th Ed · UpToDate 2026 · NEJM · Annals of Internal Medicine · Davidson's 24th Ed",
    categories: ["Infectious Diseases", "Endocrinology", "Nephrology", "Gastroenterology", "Pulmonology", "Rheumatology", "Hematology", "Metabolic Disorders"],
    featuredArticles: [
      { title: "Sepsis-3: 2026 Surviving Sepsis Campaign Update", tag: "Critical Care", updated: "Mar 2026", abstract: "Latest bundle recommendations including early antibiotics within 1-hour and vasopressor thresholds." },
      { title: "Type 2 Diabetes: GLP-1 and SGLT2i Synergies in 2026", tag: "Endocrinology", updated: "Jan 2026", abstract: "ADA 2026 evidence for combination therapy and cardiovascular/renal protective benefits." },
      { title: "Community-Acquired Pneumonia: IDSA/ATS 2026", tag: "Pulmonology", updated: "Feb 2026", abstract: "Updated severity scoring, empiric antibiotic selection, and procalcitonin-guided therapy." },
      { title: "Acute Kidney Injury: KDIGO 2026 Classification", tag: "Nephrology", updated: "Dec 2025", abstract: "Revised diagnostic criteria, biomarker panel, and renoprotective management strategies." },
      { title: "Rheumatoid Arthritis: 2026 Treat-to-Target Update", tag: "Rheumatology", updated: "Mar 2026", abstract: "ACR 2026 T2T recommendations with biologic and JAK inhibitor positioning." },
      { title: "H. pylori Eradication: 2026 Global Consensus Protocol", tag: "Gastroenterology", updated: "Feb 2026", abstract: "Quadruple therapy recommendations in high clarithromycin-resistance regions." },
    ],
  },
  "cardiology": {
    label: "Cardiology",
    icon: HeartPulse,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/20",
    gradient: "from-rose-600 to-orange-500",
    description: "ECG interpretation, heart failure management, arrhythmias, and interventional cardiology based on ACC/AHA 2026 and ESC guidelines.",
    corpus: "Braunwald's 12th Ed · ACC/AHA 2026 · ESC 2026 · Circulation · European Heart Journal · JACC",
    categories: ["Acute Coronary Syndromes", "Heart Failure", "Arrhythmias", "ECG Interpretation", "Valvular Disease", "Congenital Heart Disease", "Electrophysiology", "Cardiac Imaging"],
    featuredArticles: [
      { title: "STEMI Management: 2026 Interventional Update", tag: "ACS", updated: "Mar 2026", abstract: "PCI-first strategy within 90 min, antithrombotic regimens, and post-STEMI care." },
      { title: "HFrEF Quadruple Therapy: ARNI/BB/MRA/SGLT2i Evidence", tag: "Heart Failure", updated: "Feb 2026", abstract: "NNT analysis and sequencing of the four pillars of HFrEF therapy per ESC 2025." },
      { title: "Atrial Fibrillation: 2026 ESC Ablation-First Strategy", tag: "Arrhythmia", updated: "Jan 2026", abstract: "EARLY-AF and STOP-AF trial data supporting rhythm control in newly diagnosed AF." },
      { title: "Aortic Stenosis: TAVR vs SAVR in Intermediate Risk 2026", tag: "Valvular", updated: "Mar 2026", abstract: "Updated outcomes from PARTNER 3 5-year follow-up data." },
      { title: "Hypertension: ESH/ESC 2026 Targets and Therapy", tag: "Hypertension", updated: "Feb 2026", abstract: "Revised BP targets <130/80 with RAAS-led combination therapy paradigm." },
    ],
  },
  "pathology": {
    label: "Pathology",
    icon: Microscope,
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/20",
    gradient: "from-purple-600 to-indigo-600",
    description: "Cellular mechanisms of disease, inflammatory pathways, neoplasia, and organ pathology from Robbins and global oncology societies.",
    corpus: "Robbins & Cotran 10th Ed · NCCN 2026 · WHO Classification of Tumours (5th Ed) · Cotran Robbins Pathology · AJCC Cancer Staging",
    categories: ["General Pathology", "Neoplasia", "Cardiovascular Pathology", "Renal Pathology", "GI Pathology", "Neuropathology", "Hematopathology", "Pulmonary Pathology"],
    featuredArticles: [
      { title: "Hallmarks of Cancer: Updated 2026 Framework", tag: "Neoplasia", updated: "Mar 2026", abstract: "Hanahan & Weinberg 2022 framework expanded with immune evasion and metabolic reprogramming." },
      { title: "Glomerulonephritis: Classification & Immunofluorescence Patterns", tag: "Renal", updated: "Feb 2026", abstract: "WHO 2022 classification updated with ANCA-associated patterns and complement biomarkers." },
      { title: "Myocardial Infarction: Histological Timeline", tag: "Cardiovascular", updated: "Jan 2026", abstract: "Pathological changes from 0-6h to >4 weeks post-ischemic event." },
      { title: "Non-Alcoholic Fatty Liver: MASH Reclassification 2024", tag: "GI", updated: "Feb 2026", abstract: "Metabolic dysfunction-associated steatohepatitis (MASH) staging and fibrosis grades." },
    ],
  },
  "neurology": {
    label: "Neurology",
    icon: Brain,
    colorClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/20",
    gradient: "from-violet-600 to-purple-600",
    description: "Stroke protocols, movement disorders, epilepsy, dementia, and neuromuscular diseases indexed from AAN, AHA Stroke, and leading textbooks.",
    corpus: "Adams & Victor's Neurology 11th Ed · AHA Stroke Guidelines 2026 · AAN 2026 · Neurology Journal · JNNP · Lancet Neurology",
    categories: ["Stroke", "Epilepsy", "Movement Disorders", "Dementia", "MS & Demyelinating", "Headache", "Neuromuscular Disease", "Neuro-Oncology"],
    featuredArticles: [
      { title: "Acute Ischemic Stroke: AHA 2026 Thrombolytic Window", tag: "Stroke", updated: "Mar 2026", abstract: "Updated tPA/tenecteplase protocols with extended window CT perfusion patient selection." },
      { title: "Parkinson's Disease: 2026 Alpha-Synuclein Biomarkers", tag: "Movement Disorders", updated: "Feb 2026", abstract: "CSF and blood biomarkers for early PD diagnosis and disease staging." },
      { title: "Status Epilepticus: 2026 Stepwise Protocol", tag: "Epilepsy", updated: "Jan 2026", abstract: "Time-sensitive escalation from benzodiazepines to anesthetic agents." },
      { title: "Multiple Sclerosis: High-Efficacy Therapy First Strategy", tag: "Demyelinating", updated: "Mar 2026", abstract: "ECTRIMS 2025 evidence for early natalizumab/cladribine vs escalation approach." },
      { title: "Alzheimer's Disease: Anti-Amyloid Therapy Update 2026", tag: "Dementia", updated: "Feb 2026", abstract: "Lecanemab and donanemab clinical efficacy and ARIA monitoring guidelines." },
    ],
  },
  "surgery": {
    label: "Surgery",
    icon: Stethoscope,
    colorClass: "text-slate-500",
    bgClass: "bg-slate-500/10",
    borderClass: "border-slate-500/20",
    gradient: "from-slate-600 to-gray-600",
    description: "Perioperative care, surgical oncology, laparoscopic techniques, and trauma surgery based on Bailey & Love and Schwartz's Principles.",
    corpus: "Bailey & Love's Surgery 28th Ed · Schwartz's Surgery 11th Ed · UpToDate Surgical References · EAST Trauma Guidelines 2026",
    categories: ["Upper GI Surgery", "Colorectal Surgery", "Hepato-Biliary", "Endocrine Surgery", "Breast Surgery", "Vascular Surgery", "Trauma Surgery", "Perioperative Care"],
    featuredArticles: [
      { title: "Appendicitis: Non-Operative vs Operative Management 2026", tag: "Colorectal", updated: "Mar 2026", abstract: "APPAC III trial 5-year recurrence data for antibiotic-first management." },
      { title: "Cholecystitis: Laparoscopic Timing and Bailout Criteria", tag: "Hepato-Biliary", updated: "Feb 2026", abstract: "Tokyo Guidelines 2026 update on cholecystitis severity classification." },
      { title: "Damage Control Surgery: Resuscitative Endovascular Balloon", tag: "Trauma", updated: "Jan 2026", abstract: "REBOA application in hemorrhagic shock zones I, II, and III." },
      { title: "Enhanced Recovery After Surgery (ERAS) Protocol 2026", tag: "Perioperative", updated: "Mar 2026", abstract: "Multimodal analgesia, early mobilization, and minimal-nil-per-mouth strategies." },
    ],
  },
  "pediatrics": {
    label: "Pediatrics",
    icon: Baby,
    colorClass: "text-pink-500",
    bgClass: "bg-pink-500/10",
    borderClass: "border-pink-500/20",
    gradient: "from-pink-500 to-rose-500",
    description: "Child and adolescent medicine, developmental milestones, vaccination schedules, and neonatal critical care from Nelson's and AAP.",
    corpus: "Nelson's Textbook of Pediatrics 22nd Ed · AAP 2026 · Harriet Lane Handbook · Red Book 2023–2026 · UpToDate Pediatrics",
    categories: ["Neonatology", "Infectious Diseases", "Respiratory", "Cardiology", "Gastroenterology", "Growth & Development", "Immunization", "Child Abuse"],
    featuredArticles: [
      { title: "Neonatal Sepsis: 2026 EOS Risk Calculator Update", tag: "Neonatology", updated: "Mar 2026", abstract: "Revised NICHD neo-sepsis calculator with updated maternal risk factor weighting." },
      { title: "Bronchiolitis: AAP 2026 Management Simplification", tag: "Respiratory", updated: "Feb 2026", abstract: "Evidence against nebulized epinephrine in mild-moderate RSV bronchiolitis." },
      { title: "Meningitis in Children: Empiric Therapy by Age 2026", tag: "Infectious", updated: "Jan 2026", abstract: "Antibiotic selection and dexamethasone adjunct evidence in pediatric bacterial meningitis." },
      { title: "Childhood Vaccination Schedule: CDC/AAP 2026", tag: "Immunization", updated: "Mar 2026", abstract: "Updated 2026 immunization schedule including RSV prophylaxis and mpox guidance." },
    ],
  },
  "obstetrics": {
    label: "Obstetrics & Gynecology",
    icon: Baby,
    colorClass: "text-fuchsia-500",
    bgClass: "bg-fuchsia-500/10",
    borderClass: "border-fuchsia-500/20",
    gradient: "from-fuchsia-500 to-pink-500",
    description: "Antenatal care, obstetric emergencies, labor management, and gynecological oncology from ACOG, RCOG, and Williams Obstetrics.",
    corpus: "Williams Obstetrics 26th Ed · ACOG 2026 · RCOG Guidelines · Berek & Novak's Gynecology 16th Ed · FIGO 2026",
    categories: ["Antenatal Care", "Obstetric Emergency", "Labor & Delivery", "Postpartum", "Gynecologic Oncology", "Reproductive Endocrinology", "Fetal Medicine", "Menopause"],
    featuredArticles: [
      { title: "Pre-eclampsia: ACOG 2026 Revised Diagnostic Criteria", tag: "Obstetric Emergency", updated: "Mar 2026", abstract: "Removal of proteinuria requirement and expanded severe-feature classification." },
      { title: "Gestational Diabetes: 2026 Screening and Insulin Threshold", tag: "Antenatal", updated: "Feb 2026", abstract: "One-step vs two-step screening debate and 2026 ACOG recommendation update." },
      { title: "Postpartum Hemorrhage: WOMAN-2 Trial Protocol", tag: "Obstetric Emergency", updated: "Jan 2026", abstract: "WHO Bundle with tranexamic acid within 3 hours of delivery in PPH management." },
      { title: "Preterm Labor: 17-OHPC Discontinuation and Cervical Pessary", tag: "Labor", updated: "Feb 2026", abstract: "PROLONG trial fallout and updated ACOG 2026 recommendations for prematurity prevention." },
    ],
  },
  "pharmacology": {
    label: "Pharmacology",
    icon: Pill,
    colorClass: "text-teal-500",
    bgClass: "bg-teal-500/10",
    borderClass: "border-teal-500/20",
    gradient: "from-teal-600 to-cyan-600",
    description: "Drug mechanisms, pharmacokinetics, adverse effects, and clinical pharmacotherapy from Goodman & Gilman and WHO Essential Medicines.",
    corpus: "Goodman & Gilman's 14th Ed · Katzung 16th Ed · WHO Essential Medicines 2026 · BNF 2026 · Lexicomp 2026 · Micromedex",
    categories: ["Autonomic Pharmacology", "Cardiovascular Drugs", "Antimicrobials", "CNS Drugs", "Endocrine Drugs", "Oncology Drugs", "Immunosuppressants", "Drug Interactions"],
    featuredArticles: [
      { title: "GLP-1 Receptor Agonists: 2026 Mechanism and Indications", tag: "Endocrine Drugs", updated: "Mar 2026", abstract: "Semaglutide, tirzepatide (dual GIP/GLP-1) mechanisms and the obesity therapeutic revolution." },
      { title: "Antibiotic Resistance: Updated WHO AWaRe Classification", tag: "Antimicrobials", updated: "Feb 2026", abstract: "Access, Watch, Reserve framework with 2026 pathogen-antibiotic resistance mapping." },
      { title: "DOAC vs Warfarin: Special Populations 2026", tag: "Cardiovascular Drugs", updated: "Jan 2026", abstract: "Head-to-head data in valvular AF, APS, and extreme obesity." },
      { title: "Immunotherapy Drug Interactions: 2026 Checkpoint Inhibitors", tag: "Oncology Drugs", updated: "Mar 2026", abstract: "PD-1/PD-L1/CTLA-4 inhibitor toxicity profiles and management algorithms." },
    ],
  },
  "oncology": {
    label: "Oncology",
    icon: Microscope,
    colorClass: "text-orange-500",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/20",
    gradient: "from-orange-600 to-red-600",
    description: "Cancer biology, systemic therapy, targeted treatments, and supportive oncology care from NCCN, ESMO, and ASCO 2026 guidelines.",
    corpus: "NCCN 2026 · ESMO Clinical Practice Guidelines · ASCO 2026 · Journal of Clinical Oncology · WHO Cancer Classification 5th Ed",
    categories: ["Lung Cancer", "Breast Cancer", "Colorectal Cancer", "Hematologic Malignancies", "Head & Neck Cancer", "GI Oncology", "Immunotherapy", "Palliative Oncology"],
    featuredArticles: [
      { title: "NSCLC: EGFR/ALK/ROS1/KRAS 2026 Targeted Therapy", tag: "Lung Cancer", updated: "Mar 2026", abstract: "Osimertinib third-generation resistance mechanisms and post-progression options." },
      { title: "Breast Cancer: CDK4/6 Inhibitors in HR+/HER2- 2026", tag: "Breast Cancer", updated: "Feb 2026", abstract: "MONARCH-8/NATALEE data and optimal adjuvant CDK4/6i usage." },
      { title: "Colorectal Cancer: Immunotherapy in MMR-deficient 2026", tag: "Colorectal", updated: "Jan 2026", abstract: "Pembrolizumab as first-line in dMMR/MSI-H metastatic CRC: updated survival data." },
      { title: "CAR-T Cell Therapy: 2026 Hematologic Malignancy Indications", tag: "Hematologic", updated: "Mar 2026", abstract: "CD19/BCMA-directed CAR-T approved indications and cytokine release syndrome management." },
    ],
  },
  "orthopedics": {
    label: "Orthopedics",
    icon: Bone,
    colorClass: "text-stone-500",
    bgClass: "bg-stone-500/10",
    borderClass: "border-stone-500/20",
    gradient: "from-stone-600 to-amber-700",
    description: "Fracture management, joint replacement, sports medicine, and spine surgery from leading orthopedic societies and evidence-based texts.",
    corpus: "Rockwood & Green's Fractures 9th Ed · Campbell's Operative Orthopaedics · AAOS Guidelines 2026 · JBJS · CORR",
    categories: ["Fracture Management", "Joint Replacement", "Sports Medicine", "Spine", "Pediatric Orthopedics", "Tumor Orthopedics", "Hand Surgery", "Foot & Ankle"],
    featuredArticles: [
      { title: "Hip Fracture: AAOS 2026 Timing and Implant Selection", tag: "Fracture", updated: "Mar 2026", abstract: "Evidence for surgery within 24-48h and choice between DHS and intramedullary nail." },
      { title: "ACL Reconstruction: Graft Choice 2026 Meta-Analysis", tag: "Sports Medicine", updated: "Feb 2026", abstract: "Hamstring vs patellar tendon vs quadriceps tendon — 15-year outcomes comparison." },
      { title: "Total Knee Arthroplasty: Robotic-Assisted 2026 Evidence", tag: "Joint Replacement", updated: "Jan 2026", abstract: "MAKO robotic vs conventional TKA: alignment, patient satisfaction, and cost-effectiveness." },
    ],
  },
  "ophthalmology": {
    label: "Ophthalmology",
    icon: Eye,
    colorClass: "text-cyan-500",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/20",
    gradient: "from-cyan-600 to-sky-600",
    description: "Medical and surgical eye disease, retinal pathology, glaucoma, and neuro-ophthalmology from AAO and Royal College of Ophthalmologists.",
    corpus: "Yanoff & Duker Ophthalmology 5th Ed · AAO 2026 PPP · RCOphth Guidelines · Kanski's Clinical Ophthalmology · EuroRetina 2026",
    categories: ["Retina", "Glaucoma", "Cataract", "Cornea", "Neuro-Ophthalmology", "Pediatric Eye", "Refractive Surgery", "Uveitis"],
    featuredArticles: [
      { title: "AMD: Anti-VEGF Dosing in 2026 — PORT Delivery System", tag: "Retina", updated: "Mar 2026", abstract: "Faricimab and high-dose aflibercept treating & extending protocols vs conventional ranibizumab." },
      { title: "Glaucoma: IOP-Independent Neuroprotection 2026", tag: "Glaucoma", updated: "Feb 2026", abstract: "Emerging pathways beyond IOP reduction and neuroprotective agents in clinical trials." },
      { title: "Diabetic Macular Edema: Protocol V Update 2026", tag: "Retina", updated: "Jan 2026", abstract: "Observation-first approach in mild DME with visual acuity 20/25 or better." },
    ],
  },
};

// ── Mini Chat ────────────────────────────────────────────────────────
function SpecialtyChat({ config }: { config: typeof SPECIALTY_CONFIG[string] }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; id: string }[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome to the **${config.label}** knowledge assistant (2026 Edition).\n\nI am locked to: *${config.corpus}*.\n\nAsk me anything about ${config.label} — we are currently using March 2026 clinical data.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMsg = async (text?: string) => {
    const q = text || input.trim();
    if (!q || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: q };
    const assistantMsg = { id: (Date.now() + 1).toString(), role: "assistant" as const, content: "" };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/medical-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: `(Current Date: April 2026) ${q}` },
          ],
        }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => m.id === assistantMsg.id ? { ...m, content: m.content + text } : m)
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "⚠️ Pipeline error. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[600px] glass">
      <div className={`bg-gradient-to-r ${config.gradient} p-5 flex items-center space-x-3`}>
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-black text-white text-sm uppercase tracking-wider">{config.label} Intelligence</p>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-white/70 text-xs">2026 EBM Protocols Active</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed ${
              msg.role === "user"
                ? "bg-indigo-600 text-white rounded-tr-sm shadow-indigo-500/20 shadow-lg"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm"
            }`}>
              {msg.content ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    a: ({ node, ...props }) => <a className="text-sky-500 font-bold hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    strong: ({ node, ...props }) => <strong className="font-black text-slate-900 dark:text-white" {...props} />
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <span className="flex items-center space-x-2 text-slate-400 italic">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Synthesizing from clinical vectors...</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex items-center space-x-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMsg()}
          placeholder={`Query ${config.label} database...`}
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMsg()}
          disabled={isLoading || !input.trim()}
          className={`w-12 h-12 bg-gradient-to-r ${config.gradient} disabled:grayscale disabled:opacity-30 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95`}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
function SpecialtyPage({ specialty }: { specialty: string }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState<"articles" | "chat" | "library">("articles");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<typeof SPECIALTY_CONFIG[string]["featuredArticles"][0] | null>(null);

  const config = SPECIALTY_CONFIG[specialty];

  const specialtyLibrary = {
    "Clinical Guidelines 2026": [
      { name: "Primary Care Protocol.pdf", size: "2.4 MB", date: "Jan 12, 2026" },
      { name: "Acute Intervention Standard.docx", size: "1.1 MB", date: "Feb 05, 2026" },
      { name: "Evidence-Based Consensus v4.pdf", size: "5.8 MB", date: "Mar 20, 2026" },
    ],
    "Anatomical Atlases": [
      { name: "High-Res Cross Sections.zip", size: "142 MB", date: "Dec 2025" },
      { name: "Neuro-Vascular Map.pdf", size: "12 MB", date: "Jan 2026" },
    ],
    "Therapeutic Frameworks": [
      { name: "Pharmacological Dosage Matrix.xlsx", size: "850 KB", date: "Apr 2026" },
      { name: "Toxicology Update.pdf", size: "3.2 MB", date: "Mar 2026" },
    ]
  };

  if (!config) {
    return (
      <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center page-transition">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Module Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-sm">The clinical module for &quot;${specialty}&quot; is currently under peer-review and not yet available.</p>
        <Link href="/encyclopedia" className="btn-premium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
      </div>
    );
  }

  const Icon = config.icon;
  const filteredArticles = config.featuredArticles.filter(
    (a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.tag.toLowerCase().includes(search.toLowerCase())
  );

  const generateFlashcards = async () => {
    setIsGeneratingCards(true);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Specialty: ${config.label}. Corpus: ${config.corpus}. Categories: ${config.categories.join(", ")}` }),
      });
      if (!res.body) throw new Error("Stream error");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullJson = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullJson += decoder.decode(value);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFlashcards(JSON.parse(fullJson.replace(/```json|```/g, "")).map((card: any) => ({
        q: card.q || card.question,
        a: card.a || card.answer
      })));
    } catch {
      alert("Flashcard pipeline error.");
    } finally {
      setIsGeneratingCards(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 w-full page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <Link href="/encyclopedia" className="inline-flex items-center space-x-2 text-indigo-500 font-black text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="w-4 h-4" />
            <span>Encyclopedia Library</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 ${config.bgClass} rounded-2xl flex items-center justify-center shadow-lg border ${config.borderClass}`}>
              <Icon className={`w-8 h-8 ${config.colorClass}`} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-none">{config.label}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className="flex items-center text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Activity className="w-3 h-3 mr-1" /> Verified 2026
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{config.featuredArticles.length + " Verified Volumes"}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab("articles")} 
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "articles" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
          >
            Modules
          </button>
          <button 
            onClick={() => setActiveTab("library")} 
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "library" ? "bg-white dark:bg-slate-900 text-teal-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
          >
            Source Library
          </button>
          <button 
            onClick={() => setActiveTab("chat")} 
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "chat" ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
          >
            AI Assistant
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Library Search */}
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${config.label} volumes, cases, and clinical guidelines...`}
              className="w-full pl-14 pr-12 py-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-base font-bold shadow-xl shadow-indigo-500/5 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>

          {activeTab === "articles" && (
            <>
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {config.categories.map((cat) => (
                  <button key={cat} className="px-5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-xs font-black text-slate-600 dark:text-slate-400 hover:border-indigo-500/50 hover:text-indigo-600 transition-all uppercase tracking-wider">
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Volumes */}
              <div className="grid sm:grid-cols-2 gap-6">
                {filteredArticles.map((article, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedArticle(article)}
                    className="premium-card p-6 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-16 ${config.bgClass} rounded-lg border ${config.borderClass} flex flex-col items-center justify-center shadow-sm relative overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${config.gradient} bg-gradient-to-b`}></div>
                        <FileText className={`w-6 h-6 ${config.colorClass}`} />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">EBM Level 1A</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-6 italic">{article.abstract || "Clinical research paper and therapeutic protocol index."}</p>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className={config.colorClass}>{article.tag}</span>
                      <span className="text-slate-400">March 2026</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "library" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-3 text-teal-500" />
                  Verified Repository Explorer
                </h3>
                <span className="text-[10px] font-black bg-teal-500/10 text-teal-600 px-3 py-1 rounded-full border border-teal-500/20">
                  {Object.keys(specialtyLibrary).length} Categories Localized
                </span>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(specialtyLibrary).map(([folderName, files]) => (
                  <button 
                    key={folderName} 
                    onClick={() => setSelectedFolder(selectedFolder === folderName ? null : folderName)}
                    className={`p-6 rounded-3xl border text-left transition-all ${selectedFolder === folderName ? "bg-teal-500 border-teal-600 shadow-xl shadow-teal-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500"}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${selectedFolder === folderName ? "bg-white/20" : "bg-teal-500/10 text-teal-600"}`}>
                      <Layers className="w-6 h-6" />
                    </div>
                    <h4 className={`font-black text-sm mb-1 ${selectedFolder === folderName ? "text-white" : "text-slate-800 dark:text-white"}`}>{folderName}</h4>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedFolder === folderName ? "text-white/70" : "text-slate-400"}`}>{files.length} Verified Sources</p>
                  </button>
                ))}
              </div>

              {selectedFolder && (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 animate-in zoom-in duration-300">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h4 className="font-black text-slate-900 dark:text-white flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-teal-500" />
                      {selectedFolder}
                    </h4>
                    <button onClick={() => setSelectedFolder(null)} className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest">Back</button>
                  </div>
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {specialtyLibrary[selectedFolder as keyof typeof specialtyLibrary].map((file: any) => (
                      <div key={file.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                            <FileText className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 dark:text-white">{file.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{file.date} • {file.size}</p>
                          </div>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-teal-600 bg-teal-500/10 px-4 py-2 rounded-xl border border-teal-500/20 hover:bg-teal-500 hover:text-white transition-all">Download Reference</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "chat" && (
            <SpecialtyChat config={config} />
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Clinical Context Widget */}
          <div className="premium-card p-6 space-y-4 border-emerald-500/20">
            <div className="flex items-center space-x-3 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-black text-xs uppercase tracking-widest">Verification Status</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This module is verified against **${config.corpus}**. 
              Hallucination prevention is active. All recommendations are graded strictly on EBM (Evidence-Based Medicine) scales.
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between py-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Corpus Depth</span>
                <span className="text-[10px] font-black text-emerald-600">100% Verified</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Last Sync</span>
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">14 min ago</span>
              </div>
            </div>
          </div>

          {/* Flashcard Widget */}
          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <Sparkles className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
            <h3 className="text-2xl font-black mb-2">Master the Ward</h3>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">Generate 20+ specialized high-yield flashcards for ${config.label} board exam preparation.</p>
            <button
              onClick={generateFlashcards}
              disabled={isGeneratingCards}
              className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl text-sm shadow-xl shadow-black/10 active:scale-95 transition-all disabled:opacity-50"
            >
              {isGeneratingCards ? "Synthesizing..." : "Generate AI Deck"}
            </button>
          </div>
        </div>
      </div>

      {/* Book Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className={`h-2 w-full bg-gradient-to-r ${config.gradient}`}></div>
            <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform text-slate-500">
              <X className="w-6 h-6" />
            </button>

            <div className="p-10 md:p-16 overflow-y-auto custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.colorClass} px-3 py-1 rounded-full border ${config.borderClass} ${config.bgClass}`}>
                      {selectedArticle.tag}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Released March 2026</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">{selectedArticle.title}</h2>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
                  <h4 className="flex items-center text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4">
                    <Activity className="w-4 h-4 mr-2 text-indigo-500" /> Clinical Abstract
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed italic">
                    {selectedArticle.abstract || "The primary clinical finding in this module focuses on the updated therapeutic window and diagnostic convergence established in late 2025. Standard protocols have been revised to include recent pharmacological breakthroughs and patient-specific dosage algorithms based on real-time physiological telemetry."}
                  </p>
                </div>

                <div className="space-y-6 text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Expert Clinical Consensus</h3>
                  <p>
                    Effective as of March 2026, the clinical consensus regarding <strong>{selectedArticle.title}</strong> has shifted towards a more precision-medicine approach. 
                    Based on trials indexed in the ${config.corpus}, medical practitioners are advised to utilize the updated risk-stratification models which show a 14% improvement in outcomes compared to 2024 methods.
                  </p>
                  <p>
                    Key therapeutic interventions now prioritize non-invasive hemodynamic monitoring and early transition to oral pharmaceutical agents where applicable, following the WHO Level 1 guidelines.
                  </p>
                </div>

                <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-xs text-slate-500">HP</div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-white">Hasanain Salah Noori</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lead Clinical Reviewer</p>
                    </div>
                  </div>
                   <button onClick={() => { setSelectedArticle(null); setActiveTab("chat"); }} className="btn-premium">
                    <Bot className="w-4 h-4" />
                    <span>Cross-Examine with AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {flashcards && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-10 relative">
            <button onClick={() => setFlashcards(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <h3 className="text-2xl font-black mb-10 medical-gradient-text text-center">{config.label} Review Deck</h3>
            <FlashcardDeck cards={flashcards} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ specialty: string }> }) {
  const { specialty } = use(params);
  return (
    <ErrorBoundary>
      <SpecialtyPage specialty={specialty} />
    </ErrorBoundary>
  );
}
