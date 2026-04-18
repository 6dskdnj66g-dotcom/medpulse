/**
 * ════════════════════════════════════════════════════════════════════════
 *  MEDPULSE AI — GLOBAL MEDICAL SOURCES REGISTRY v4.0 (April 2026)
 *  The most comprehensive medical knowledge index ever assembled.
 *  Covers: International + Arab/MENA + Subspecialty + Open Access sources.
 * ════════════════════════════════════════════════════════════════════════
 */

export interface MedicalSource {
  name: string;
  abbreviation?: string;
  url?: string;
  slug?: string;
  type: "journal" | "database" | "guideline" | "textbook" | "organization" | "database_arab" | "journal_arab";
  specialty?: string;
  impactFactor?: number;
  region?: "global" | "arab" | "europe" | "usa" | "asia" | "mena";
  language?: "english" | "arabic" | "bilingual";
  openAccess?: boolean;
}

// ════════════════════════════════════════════════════════════════
// TIER 1 — PREMIER GENERAL MEDICAL JOURNALS
// ════════════════════════════════════════════════════════════════
export const PREMIER_JOURNALS: MedicalSource[] = [
  { name: "New England Journal of Medicine", abbreviation: "NEJM", url: "https://nejm.org", type: "journal", impactFactor: 176.1, region: "usa", specialty: "General Medicine" },
  { name: "The Lancet", url: "https://thelancet.com", type: "journal", impactFactor: 202.7, region: "europe", specialty: "General Medicine" },
  { name: "JAMA — Journal of the American Medical Association", abbreviation: "JAMA", url: "https://jamanetwork.com", type: "journal", impactFactor: 157.3, region: "usa", specialty: "General Medicine" },
  { name: "The BMJ (British Medical Journal)", abbreviation: "BMJ", url: "https://bmj.com", type: "journal", impactFactor: 105.7, region: "europe", specialty: "General Medicine" },
  { name: "Nature Medicine", url: "https://nature.com/nm", type: "journal", impactFactor: 87.2, region: "global", specialty: "General Medicine" },
  { name: "Annals of Internal Medicine", url: "https://annals.org", type: "journal", impactFactor: 51.6, region: "usa", specialty: "Internal Medicine" },
  { name: "PLOS Medicine", url: "https://journals.plos.org/plosmedicine", type: "journal", impactFactor: 15.8, region: "global", openAccess: true },
  { name: "CMAJ — Canadian Medical Association Journal", url: "https://cmaj.ca", type: "journal", impactFactor: 17.4, region: "global" },
  { name: "Medical Journal of Australia", abbreviation: "MJA", url: "https://mja.com.au", type: "journal", impactFactor: 11.1, region: "asia" },
  { name: "The Lancet Regional Health — Eastern Mediterranean", url: "https://thelancet.com/journals/lanem", type: "journal", region: "mena", openAccess: true },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — CARDIOLOGY & CARDIOVASCULAR
// ════════════════════════════════════════════════════════════════
export const CARDIOLOGY_JOURNALS: MedicalSource[] = [
  { name: "Circulation", url: "https://ahajournals.org/journal/circ", type: "journal", impactFactor: 39.9, specialty: "Cardiology" },
  { name: "Journal of the American College of Cardiology", abbreviation: "JACC", url: "https://jacc.org", type: "journal", impactFactor: 24.0, specialty: "Cardiology" },
  { name: "European Heart Journal", abbreviation: "EHJ", url: "https://academic.oup.com/eurheartj", type: "journal", impactFactor: 39.3, specialty: "Cardiology" },
  { name: "JAMA Cardiology", url: "https://jamanetwork.com/journals/jamacardiology", type: "journal", impactFactor: 24.0, specialty: "Cardiology" },
  { name: "Heart", url: "https://heart.bmj.com", type: "journal", impactFactor: 8.1, specialty: "Cardiology" },
  { name: "Circulation: Heart Failure", url: "https://ahajournals.org", type: "journal", impactFactor: 9.0, specialty: "Heart Failure" },
  { name: "JACC: Cardiovascular Interventions", url: "https://jacc.org/journal/interventions", type: "journal", specialty: "Interventional Cardiology" },
  { name: "JACC: Heart Failure", url: "https://jacc.org/journal/heart-failure", type: "journal", specialty: "Heart Failure" },
  { name: "Europace", url: "https://academic.oup.com/europace", type: "journal", impactFactor: 7.4, specialty: "Electrophysiology" },
  { name: "Heart Rhythm", url: "https://heartrhythmjournal.com", type: "journal", specialty: "Electrophysiology" },
  { name: "Journal of Cardiac Failure", type: "journal", specialty: "Heart Failure" },
  { name: "American Heart Journal", url: "https://ahjonline.com", type: "journal", specialty: "Cardiology" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — ONCOLOGY & HEMATOLOGY
// ════════════════════════════════════════════════════════════════
export const ONCOLOGY_JOURNALS: MedicalSource[] = [
  { name: "CA: A Cancer Journal for Clinicians", abbreviation: "CA Cancer J Clin", type: "journal", impactFactor: 254.7, specialty: "Oncology" },
  { name: "The Lancet Oncology", url: "https://thelancet.com/journals/lanonc", type: "journal", impactFactor: 51.1, specialty: "Oncology" },
  { name: "Journal of Clinical Oncology", abbreviation: "JCO", url: "https://ascopubs.org/journal/jco", type: "journal", impactFactor: 45.3, specialty: "Oncology" },
  { name: "JAMA Oncology", url: "https://jamanetwork.com/journals/jamaoncology", type: "journal", impactFactor: 28.4, specialty: "Oncology" },
  { name: "Cancer Cell", url: "https://cell.com/cancer-cell", type: "journal", impactFactor: 50.3, specialty: "Oncology" },
  { name: "Cancer Discovery", url: "https://cancerdiscovery.aacrjournals.org", type: "journal", impactFactor: 38.3, specialty: "Oncology" },
  { name: "Annals of Oncology", url: "https://annalsofoncology.org", type: "journal", impactFactor: 51.8, specialty: "Oncology" },
  { name: "Nature Cancer", url: "https://nature.com/natcancer", type: "journal", impactFactor: 23.5, specialty: "Oncology" },
  { name: "Blood", url: "https://ashpublications.org/blood", type: "journal", impactFactor: 25.5, specialty: "Hematology" },
  { name: "Journal of Hematology & Oncology", type: "journal", impactFactor: 28.5, specialty: "Hematology/Oncology", openAccess: true },
  { name: "Leukemia", url: "https://nature.com/leu", type: "journal", specialty: "Hematology" },
  { name: "Haematologica", url: "https://haematologica.org", type: "journal", specialty: "Hematology" },
  { name: "npj Precision Oncology", type: "journal", openAccess: true, specialty: "Precision Medicine" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — NEUROLOGY & PSYCHIATRY
// ════════════════════════════════════════════════════════════════
export const NEURO_JOURNALS: MedicalSource[] = [
  { name: "The Lancet Neurology", url: "https://thelancet.com/journals/laneur", type: "journal", impactFactor: 48.0, specialty: "Neurology" },
  { name: "Neuron", url: "https://cell.com/neuron", type: "journal", impactFactor: 17.2, specialty: "Neuroscience" },
  { name: "Brain", url: "https://academic.oup.com/brain", type: "journal", impactFactor: 15.3, specialty: "Neurology" },
  { name: "Journal of Neurology, Neurosurgery & Psychiatry", abbreviation: "JNNP", url: "https://jnnp.bmj.com", type: "journal", impactFactor: 13.2, specialty: "Neurology" },
  { name: "JAMA Neurology", url: "https://jamanetwork.com/journals/jamaneurology", type: "journal", impactFactor: 29.0, specialty: "Neurology" },
  { name: "Annals of Neurology", url: "https://onlinelibrary.wiley.com/journal/15318249", type: "journal", impactFactor: 11.2, specialty: "Neurology" },
  { name: "Neurology", url: "https://neurology.org", type: "journal", impactFactor: 11.6, specialty: "Neurology" },
  { name: "Stroke", url: "https://ahajournals.org/journal/str", type: "journal", impactFactor: 10.1, specialty: "Stroke" },
  { name: "The Lancet Psychiatry", type: "journal", impactFactor: 64.3, specialty: "Psychiatry" },
  { name: "JAMA Psychiatry", url: "https://jamanetwork.com/journals/jamapsychiatry", type: "journal", impactFactor: 22.5, specialty: "Psychiatry" },
  { name: "American Journal of Psychiatry", type: "journal", impactFactor: 20.1, specialty: "Psychiatry" },
  { name: "Molecular Psychiatry", type: "journal", impactFactor: 11.0, specialty: "Psychiatry" },
  { name: "Multiple Sclerosis Journal", type: "journal", specialty: "Neurology" },
  { name: "Epilepsia", url: "https://onlinelibrary.wiley.com/journal/15281167", type: "journal", specialty: "Epilepsy" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — RESPIRATORY & PULMONOLOGY
// ════════════════════════════════════════════════════════════════
export const RESPIRATORY_JOURNALS: MedicalSource[] = [
  { name: "American Journal of Respiratory and Critical Care Medicine", abbreviation: "AJRCCM", url: "https://atsjournals.org/journal/ajrccm", type: "journal", impactFactor: 33.0, specialty: "Pulmonology" },
  { name: "Chest", url: "https://journal.chestnet.org", type: "journal", impactFactor: 19.1, specialty: "Pulmonology" },
  { name: "The Lancet Respiratory Medicine", url: "https://thelancet.com/journals/lanres", type: "journal", impactFactor: 76.2, specialty: "Pulmonology" },
  { name: "European Respiratory Journal", abbreviation: "ERJ", url: "https://erj.ersjournals.com", type: "journal", impactFactor: 24.3, specialty: "Pulmonology" },
  { name: "Thorax", url: "https://thorax.bmj.com", type: "journal", impactFactor: 10.3, specialty: "Pulmonology" },
  { name: "Respiratory Medicine", type: "journal", specialty: "Pulmonology" },
  { name: "Journal of Allergy and Clinical Immunology", abbreviation: "JACI", type: "journal", impactFactor: 14.2, specialty: "Allergy/Immunology" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — GASTROENTEROLOGY & HEPATOLOGY
// ════════════════════════════════════════════════════════════════
export const GI_JOURNALS: MedicalSource[] = [
  { name: "Gastroenterology", url: "https://gastrojournal.org", type: "journal", impactFactor: 33.9, specialty: "Gastroenterology" },
  { name: "Gut", url: "https://gut.bmj.com", type: "journal", impactFactor: 31.8, specialty: "Gastroenterology" },
  { name: "The Lancet Gastroenterology & Hepatology", type: "journal", impactFactor: 35.7, specialty: "Gastroenterology" },
  { name: "American Journal of Gastroenterology", abbreviation: "AJG", url: "https://journals.lww.com/ajg", type: "journal", impactFactor: 12.0, specialty: "Gastroenterology" },
  { name: "Clinical Gastroenterology and Hepatology", abbreviation: "CGH", type: "journal", specialty: "Gastroenterology" },
  { name: "Journal of Hepatology", url: "https://journal-of-hepatology.eu", type: "journal", impactFactor: 25.7, specialty: "Hepatology" },
  { name: "Hepatology", url: "https://aasldpubs.onlinelibrary.wiley.com/journal/15273350", type: "journal", impactFactor: 17.4, specialty: "Hepatology" },
  { name: "Gastrointestinal Endoscopy", type: "journal", specialty: "Endoscopy" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — NEPHROLOGY & UROLOGY
// ════════════════════════════════════════════════════════════════
export const NEPHROLOGY_JOURNALS: MedicalSource[] = [
  { name: "Journal of the American Society of Nephrology", abbreviation: "JASN", url: "https://jasn.asnjournals.org", type: "journal", impactFactor: 14.9, specialty: "Nephrology" },
  { name: "Kidney International", url: "https://kidney-international.org", type: "journal", impactFactor: 19.6, specialty: "Nephrology" },
  { name: "American Journal of Kidney Diseases", abbreviation: "AJKD", type: "journal", specialty: "Nephrology" },
  { name: "Clinical Journal of the American Society of Nephrology", abbreviation: "CJASN", type: "journal", specialty: "Nephrology" },
  { name: "Nature Reviews Nephrology", type: "journal", impactFactor: 29.4, specialty: "Nephrology" },
  { name: "Nephrology Dialysis Transplantation", abbreviation: "NDT", type: "journal", specialty: "Nephrology" },
  { name: "Journal of Urology", type: "journal", impactFactor: 6.6, specialty: "Urology" },
  { name: "European Urology", type: "journal", impactFactor: 25.3, specialty: "Urology" },
  { name: "BJU International", abbreviation: "BJUI", type: "journal", specialty: "Urology" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — ENDOCRINOLOGY & DIABETES
// ════════════════════════════════════════════════════════════════
export const ENDO_JOURNALS: MedicalSource[] = [
  { name: "Diabetes Care", url: "https://care.diabetesjournals.org", type: "journal", impactFactor: 16.2, specialty: "Diabetology" },
  { name: "The Lancet Diabetes & Endocrinology", url: "https://thelancet.com/journals/landia", type: "journal", impactFactor: 44.5, specialty: "Endocrinology" },
  { name: "Diabetologia", url: "https://link.springer.com/journal/125", type: "journal", impactFactor: 10.1, specialty: "Diabetology" },
  { name: "Journal of Clinical Endocrinology & Metabolism", abbreviation: "JCEM", type: "journal", impactFactor: 6.0, specialty: "Endocrinology" },
  { name: "Endocrine Reviews", type: "journal", impactFactor: 22.6, specialty: "Endocrinology" },
  { name: "Diabetes", url: "https://diabetesjournals.org/diabetes", type: "journal", specialty: "Diabetology" },
  { name: "Thyroid", type: "journal", specialty: "Thyroidology" },
  { name: "Journal of Diabetes Investigation", type: "journal", openAccess: true, specialty: "Diabetology" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — INFECTIOUS DISEASES & MICROBIOLOGY
// ════════════════════════════════════════════════════════════════
export const ID_JOURNALS: MedicalSource[] = [
  { name: "The Lancet Infectious Diseases", url: "https://thelancet.com/journals/laninf", type: "journal", impactFactor: 56.3, specialty: "Infectious Diseases" },
  { name: "Clinical Infectious Diseases", abbreviation: "CID", url: "https://academic.oup.com/cid", type: "journal", impactFactor: 11.8, specialty: "Infectious Diseases" },
  { name: "Journal of Infectious Diseases", abbreviation: "JID", type: "journal", specialty: "Infectious Diseases" },
  { name: "PLOS Pathogens", type: "journal", openAccess: true, specialty: "Microbiology" },
  { name: "Antimicrobial Agents and Chemotherapy", type: "journal", specialty: "Antimicrobials" },
  { name: "Emerging Infectious Diseases", abbreviation: "EID", url: "https://cdc.gov/eid", type: "journal", openAccess: true, specialty: "Infectious Diseases" },
  { name: "International Journal of Infectious Diseases", abbreviation: "IJID", type: "journal", openAccess: true, specialty: "Infectious Diseases" },
  { name: "mBio", type: "journal", openAccess: true, specialty: "Microbiology" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — SURGERY
// ════════════════════════════════════════════════════════════════
export const SURGERY_JOURNALS: MedicalSource[] = [
  { name: "Annals of Surgery", url: "https://journals.lww.com/annalsofsurgery", type: "journal", impactFactor: 13.0, specialty: "Surgery" },
  { name: "JAMA Surgery", url: "https://jamanetwork.com/journals/jamasurgery", type: "journal", impactFactor: 16.9, specialty: "Surgery" },
  { name: "British Journal of Surgery", abbreviation: "BJS", url: "https://academic.oup.com/bjs", type: "journal", impactFactor: 10.0, specialty: "Surgery" },
  { name: "Journal of the American College of Surgeons", abbreviation: "JACS", type: "journal", specialty: "Surgery" },
  { name: "Surgery", url: "https://surgjournal.com", type: "journal", specialty: "Surgery" },
  { name: "Journal of Vascular Surgery", abbreviation: "JVS", type: "journal", specialty: "Vascular Surgery" },
  { name: "European Journal of Surgical Oncology", abbreviation: "EJSO", type: "journal", specialty: "Surgical Oncology" },
  { name: "Surgical Endoscopy", type: "journal", specialty: "Minimally Invasive Surgery" },
  { name: "World Journal of Surgery", type: "journal", specialty: "Surgery" },
  { name: "Hernia", type: "journal", specialty: "Surgery" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — OBSTETRICS & GYNECOLOGY
// ════════════════════════════════════════════════════════════════
export const OBGYN_JOURNALS: MedicalSource[] = [
  { name: "American Journal of Obstetrics & Gynecology", abbreviation: "AJOG", url: "https://ajog.org", type: "journal", impactFactor: 12.4, specialty: "OB/GYN" },
  { name: "BJOG: An International Journal of Obstetrics & Gynaecology", url: "https://obgyn.onlinelibrary.wiley.com/journal/14710528", type: "journal", impactFactor: 7.7, specialty: "OB/GYN" },
  { name: "Obstetrics & Gynecology", abbreviation: "Ob/Gyn Green Journal", type: "journal", specialty: "OB/GYN" },
  { name: "Human Reproduction", url: "https://academic.oup.com/humrep", type: "journal", impactFactor: 6.1, specialty: "Reproductive Medicine" },
  { name: "Fertility and Sterility", type: "journal", specialty: "Reproductive Medicine" },
  { name: "Gynecologic Oncology", type: "journal", specialty: "Gynecologic Oncology" },
  { name: "Ultrasound in Obstetrics & Gynecology", type: "journal", specialty: "Maternal-Fetal Medicine" },
  { name: "The Lancet Child & Adolescent Health", type: "journal", impactFactor: 22.0, specialty: "Pediatrics/OB" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — PEDIATRICS
// ════════════════════════════════════════════════════════════════
export const PEDIATRICS_JOURNALS: MedicalSource[] = [
  { name: "Pediatrics", url: "https://pediatrics.aappublications.org", type: "journal", impactFactor: 8.2, specialty: "Pediatrics" },
  { name: "JAMA Pediatrics", url: "https://jamanetwork.com/journals/jamapediatrics", type: "journal", impactFactor: 22.1, specialty: "Pediatrics" },
  { name: "The Journal of Pediatrics", type: "journal", impactFactor: 5.8, specialty: "Pediatrics" },
  { name: "Archives of Disease in Childhood", url: "https://adc.bmj.com", type: "journal", specialty: "Pediatrics" },
  { name: "Pediatric Research", url: "https://nature.com/pr", type: "journal", specialty: "Pediatrics" },
  { name: "Journal of Pediatric Gastroenterology & Nutrition", abbreviation: "JPGN", type: "journal", specialty: "Pediatric Gastroenterology" },
  { name: "Neonatology", type: "journal", specialty: "Neonatology" },
];

// ════════════════════════════════════════════════════════════════
// TIER 2 — OTHER SPECIALTIES
// ════════════════════════════════════════════════════════════════
export const OTHER_SPECIALTY_JOURNALS: MedicalSource[] = [
  // Rheumatology
  { name: "Annals of the Rheumatic Diseases", abbreviation: "ARD", url: "https://ard.bmj.com", type: "journal", impactFactor: 29.7, specialty: "Rheumatology" },
  { name: "Arthritis & Rheumatology", type: "journal", specialty: "Rheumatology" },
  { name: "Rheumatology", url: "https://academic.oup.com/rheumatology", type: "journal", impactFactor: 8.6, specialty: "Rheumatology" },
  // Dermatology
  { name: "JAMA Dermatology", type: "journal", impactFactor: 15.0, specialty: "Dermatology" },
  { name: "Journal of Investigative Dermatology", abbreviation: "JID", type: "journal", specialty: "Dermatology" },
  { name: "British Journal of Dermatology", abbreviation: "BJD", type: "journal", specialty: "Dermatology" },
  // Ophthalmology
  { name: "Ophthalmology", url: "https://aaojournal.org", type: "journal", impactFactor: 14.0, specialty: "Ophthalmology" },
  { name: "JAMA Ophthalmology", type: "journal", specialty: "Ophthalmology" },
  { name: "British Journal of Ophthalmology", abbreviation: "BJO", type: "journal", specialty: "Ophthalmology" },
  // Orthopedics
  { name: "Journal of Bone and Joint Surgery", abbreviation: "JBJS", url: "https://jbjs.org", type: "journal", specialty: "Orthopedics" },
  { name: "Bone & Joint Journal", abbreviation: "BJJ", type: "journal", specialty: "Orthopedics" },
  { name: "Spine", type: "journal", specialty: "Spine Surgery" },
  // Radiology
  { name: "Radiology", url: "https://pubs.rsna.org/journal/radiology", type: "journal", impactFactor: 12.1, specialty: "Radiology" },
  { name: "European Radiology", type: "journal", specialty: "Radiology" },
  { name: "AJR American Journal of Roentgenology", abbreviation: "AJR", type: "journal", specialty: "Radiology" },
  // Emergency Medicine
  { name: "Annals of Emergency Medicine", url: "https://annemergmed.com", type: "journal", specialty: "Emergency Medicine" },
  { name: "Emergency Medicine Journal", abbreviation: "EMJ", url: "https://emj.bmj.com", type: "journal", specialty: "Emergency Medicine" },
  // Critical Care
  { name: "Critical Care Medicine", url: "https://journals.lww.com/ccmjournal", type: "journal", impactFactor: 9.9, specialty: "Critical Care" },
  { name: "Intensive Care Medicine", url: "https://link.springer.com/journal/134", type: "journal", impactFactor: 40.9, specialty: "Critical Care" },
  { name: "Critical Care", url: "https://ccforum.biomedcentral.com", type: "journal", openAccess: true, specialty: "Critical Care" },
  // Pharmacology
  { name: "British Journal of Clinical Pharmacology", abbreviation: "BJCP", type: "journal", specialty: "Pharmacology" },
  { name: "Clinical Pharmacology & Therapeutics", abbreviation: "CPT", type: "journal", specialty: "Pharmacology" },
  // Nutrition
  { name: "American Journal of Clinical Nutrition", abbreviation: "AJCN", type: "journal", specialty: "Nutrition" },
  { name: "Clinical Nutrition", type: "journal", specialty: "Nutrition" },
  // Neurosurgery
  { name: "Journal of Neurosurgery", abbreviation: "JNS", url: "https://thejns.org", type: "journal", specialty: "Neurosurgery" },
  { name: "Neurosurgery", url: "https://academic.oup.com/neurosurgery", type: "journal", specialty: "Neurosurgery" },
  // Transplant
  { name: "American Journal of Transplantation", abbreviation: "AJT", type: "journal", specialty: "Transplantation" },
  { name: "Transplantation", type: "journal", specialty: "Transplantation" },
];

// ════════════════════════════════════════════════════════════════
// TIER 3 — ARAB & MENA MEDICAL JOURNALS
// ════════════════════════════════════════════════════════════════
export const ARAB_JOURNALS: MedicalSource[] = [
  { name: "Eastern Mediterranean Health Journal", abbreviation: "EMHJ", url: "https://emro.who.int/emhj", type: "journal_arab", region: "mena", language: "bilingual", openAccess: true, specialty: "General Medicine" },
  { name: "Saudi Medical Journal", abbreviation: "SMJ", url: "https://smj.org.sa", type: "journal_arab", region: "mena", language: "english", openAccess: true, specialty: "General Medicine" },
  { name: "Annals of Saudi Medicine", abbreviation: "ASM", url: "https://annsaudimed.net", type: "journal_arab", region: "mena", language: "english", openAccess: true },
  { name: "Saudi Journal of Gastroenterology", url: "https://saudijgastro.com", type: "journal_arab", region: "mena", openAccess: true, specialty: "Gastroenterology" },
  { name: "Saudi Journal of Kidney Diseases & Transplantation", abbreviation: "SJKDT", type: "journal_arab", region: "mena", specialty: "Nephrology" },
  { name: "Oman Medical Journal", abbreviation: "OMJ", url: "https://omjournal.org", type: "journal_arab", region: "mena", openAccess: true },
  { name: "Qatar Medical Journal", abbreviation: "QMJ", url: "https://qscience.com/content/journals/qmj", type: "journal_arab", region: "mena", openAccess: true },
  { name: "Emirates Medical Journal", abbreviation: "EMJ", type: "journal_arab", region: "mena" },
  { name: "Kuwait Medical Journal", abbreviation: "KMJ", url: "https://kma-kmj.com", type: "journal_arab", region: "mena" },
  { name: "Bahrain Medical Bulletin", abbreviation: "BMB", type: "journal_arab", region: "mena" },
  { name: "Jordan Medical Journal", type: "journal_arab", region: "mena" },
  { name: "Egyptian Journal of Internal Medicine", type: "journal_arab", region: "mena" },
  { name: "Egyptian Heart Journal", type: "journal_arab", region: "mena", specialty: "Cardiology" },
  { name: "Journal of the Egyptian Society of Nephrology & Transplantation", type: "journal_arab", region: "mena", specialty: "Nephrology" },
  { name: "AlQalam — Saudi Medical Sciences", type: "journal_arab", region: "mena", language: "arabic" },
  { name: "Lebanese Medical Journal", type: "journal_arab", region: "mena" },
  { name: "Iraqi Journal of Medical Sciences", type: "journal_arab", region: "mena" },
  { name: "Syrian Journal of Internal Medicine", type: "journal_arab", region: "mena" },
  { name: "Libyan Journal of Medicine", url: "https://libyanjournal.org", type: "journal_arab", region: "mena", openAccess: true },
  { name: "Tunisian Medical Journal — La Tunisie Médicale", type: "journal_arab", region: "mena" },
  { name: "Moroccan Journal of Clinical & Experimental Medicine", type: "journal_arab", region: "mena" },
  { name: "Algerian Journal of Medicine", type: "journal_arab", region: "mena" },
  { name: "Sudan Journal of Medical Sciences", type: "journal_arab", region: "mena", openAccess: true },
  { name: "King Faisal Specialist Hospital Medical Journal", region: "mena", type: "journal_arab" },
  { name: "Avicenna Journal of Medicine", url: "https://avicennajmed.com", type: "journal_arab", region: "mena", openAccess: true },
  { name: "International Journal of Medicine in Developing Countries", type: "journal_arab", region: "mena", openAccess: true },
];

// ════════════════════════════════════════════════════════════════
// TIER 3 — CLINICAL EVIDENCE DATABASES
// ════════════════════════════════════════════════════════════════
export const CLINICAL_DATABASES: MedicalSource[] = [
  { name: "UpToDate 2026", url: "https://uptodate.com", type: "database", specialty: "General" },
  { name: "The Cochrane Library — Level 1A Evidence", url: "https://cochranelibrary.com", type: "database", openAccess: true },
  { name: "PubMed/MEDLINE — NLM/NIH", url: "https://pubmed.ncbi.nlm.nih.gov", type: "database", openAccess: true },
  { name: "ClinicalTrials.gov", url: "https://clinicaltrials.gov", type: "database", openAccess: true },
  { name: "DynaMed 2026", url: "https://dynamed.com", type: "database" },
  { name: "BMJ Best Practice 2026", url: "https://bestpractice.bmj.com", type: "database" },
  { name: "Embase (Elsevier)", url: "https://embase.com", type: "database" },
  { name: "CINAHL — Nursing & Allied Health", url: "https://ebsco.com/products/research-databases/cinahl", type: "database" },
  { name: "Micromedex — Drug Information", url: "https://micromedexsolutions.com", type: "database" },
  { name: "Lexicomp — Drug References", url: "https://wolterskluwer.com/en/solutions/lexicomp", type: "database" },
  { name: "DrugBank 2026", url: "https://drugbank.com", type: "database", openAccess: true },
  { name: "WHO Global Health Observatory (GHO)", url: "https://who.int/data/gho", type: "database", openAccess: true },
  { name: "Global Index Medicus (GIM) — WHO", url: "https://globalindexmedicus.net", type: "database", openAccess: true },
  { name: "Index Medicus for EMRO (IMEMR) — WHO", url: "https://who.int/emro", type: "database_arab", openAccess: true, region: "mena" },
  { name: "Arab World Research Source — EBSCO", type: "database_arab", region: "mena" },
  { name: "Scopus (Elsevier)", url: "https://scopus.com", type: "database" },
  { name: "Web of Science (Clarivate)", url: "https://webofscience.com", type: "database" },
  { name: "HINARI — WHO Research4Life", url: "https://who.hinari-access.net", type: "database", openAccess: true },
  { name: "AccessMedicine (McGraw-Hill)", url: "https://accessmedicine.mhmedical.com", type: "database" },
  { name: "ClinicalKey (Elsevier)", url: "https://clinicalkey.com", type: "database" },
  { name: "ProQuest Health & Medical Complete", type: "database" },
  { name: "Trip Database (Clinical Answers)", url: "https://tripdatabase.com", type: "database", openAccess: true },
  { name: "PROSPERO — International Systematic Review Registry", url: "https://crd.york.ac.uk/prospero", type: "database", openAccess: true },
  { name: "OpenDOAR — Directory of Open Access Repositories", type: "database", openAccess: true },
  { name: "MEDNAR — Deep Web Medical Search", type: "database" },
];

// ════════════════════════════════════════════════════════════════
// TIER 4 — INTERNATIONAL GUIDELINES ORGANIZATIONS
// ════════════════════════════════════════════════════════════════
export const GUIDELINES_ORGS: MedicalSource[] = [
  // GLOBAL
  { name: "World Health Organization (WHO) Clinical Guidelines 2026", url: "https://who.int/publications/guidelines", type: "guideline", region: "global" },
  { name: "NICE — National Institute for Health & Care Excellence (UK)", url: "https://nice.org.uk/guidance", type: "guideline", region: "europe" },
  { name: "CDC Clinical Guidelines 2026", url: "https://cdc.gov/guidelines", type: "guideline", region: "usa" },
  { name: "U.S. Preventive Services Task Force (USPSTF)", url: "https://uspreventiveservicestaskforce.org", type: "guideline", region: "usa" },
  // CARDIOLOGY
  { name: "ACC/AHA Cardiovascular Guidelines 2026", url: "https://acc.org/guidelines", type: "guideline", specialty: "Cardiology" },
  { name: "ESC — European Society of Cardiology Guidelines 2026", url: "https://escardio.org/guidelines", type: "guideline", specialty: "Cardiology" },
  { name: "ACCF/AHA/HRS — Heart Rhythm Guidelines 2026", type: "guideline", specialty: "Electrophysiology" },
  { name: "ESH/ESC Hypertension Guidelines 2023 (Updated 2026)", type: "guideline", specialty: "Hypertension" },
  { name: "AHA/ASA Stroke Guidelines 2026", url: "https://stroke.ahajournals.org", type: "guideline", specialty: "Stroke" },
  // NEPHROLOGY
  { name: "KDIGO — Kidney Disease Improving Global Outcomes 2026", url: "https://kdigo.org/guidelines", type: "guideline", specialty: "Nephrology" },
  { name: "KDOQI — Kidney Disease Outcomes Quality Initiative", type: "guideline", specialty: "Nephrology" },
  // RESPIRATORY
  { name: "GINA — Global Initiative for Asthma 2026", url: "https://ginasthma.org", type: "guideline", specialty: "Asthma" },
  { name: "GOLD — Global Initiative for COPD 2026", url: "https://goldcopd.org", type: "guideline", specialty: "COPD" },
  { name: "IDSA/ATS — Infectious Diseases/Pulmonology Guidelines 2026", url: "https://idsociety.org/guidelines", type: "guideline", specialty: "Infectious Diseases" },
  { name: "BTS — British Thoracic Society Guidelines", url: "https://brit-thoracic.org.uk/quality-improvement/guidelines", type: "guideline", specialty: "Pulmonology" },
  // DIABETES/ENDOCRINE
  { name: "ADA Standards of Medical Care in Diabetes 2026", url: "https://diabetesjournals.org/care/issue/47/Supplement_1", type: "guideline", specialty: "Diabetology" },
  { name: "AACE/ACE — Endocrinology Clinical Practice Guidelines", url: "https://aace.com/resources", type: "guideline", specialty: "Endocrinology" },
  { name: "IDF — International Diabetes Federation Guidelines 2025", url: "https://idf.org/guidelines", type: "guideline", specialty: "Diabetology" },
  // ONCOLOGY
  { name: "NCCN Clinical Practice Guidelines in Oncology 2026", url: "https://nccn.org/guidelines", type: "guideline", specialty: "Oncology" },
  { name: "ESMO Clinical Practice Guidelines 2026", url: "https://esmo.org/guidelines", type: "guideline", specialty: "Oncology" },
  { name: "ASCO Guidelines 2026", url: "https://asco.org/practice-guidelines", type: "guideline", specialty: "Oncology" },
  { name: "ASH — American Society of Hematology Guidelines 2026", url: "https://ash.org/guidelines", type: "guideline", specialty: "Hematology" },
  // GI/HEPATOLOGY
  { name: "ACG — American College of Gastroenterology Guidelines 2026", url: "https://gi.org/guidelines", type: "guideline", specialty: "Gastroenterology" },
  { name: "AASLD — Liver Disease Guidelines 2026", url: "https://aasld.org/practice-guidelines", type: "guideline", specialty: "Hepatology" },
  { name: "EASL — European Association for the Study of the Liver 2026", url: "https://easl.eu/clinical-practice-guidelines", type: "guideline", specialty: "Hepatology" },
  { name: "ESGE — European Society of Gastrointestinal Endoscopy", url: "https://esge.com/guidelines", type: "guideline", specialty: "Endoscopy" },
  // RHEUMATOLOGY
  { name: "ACR — American College of Rheumatology Guidelines 2026", url: "https://rheumatology.org/guidelines", type: "guideline", specialty: "Rheumatology" },
  { name: "EULAR — European League Against Rheumatism Recommendations 2026", url: "https://eular.org/recommendations", type: "guideline", specialty: "Rheumatology" },
  // OB/GYN
  { name: "ACOG — American College of OB/GYN Practice Bulletins 2026", url: "https://acog.org/clinical/clinical-guidance", type: "guideline", specialty: "OB/GYN" },
  { name: "RCOG — Royal College of Obstetricians & Gynaecologists 2026", url: "https://rcog.org.uk/guidance", type: "guideline", specialty: "OB/GYN" },
  { name: "FIGO — International Federation of Gynecology & Obstetrics", url: "https://figo.org/guidelines", type: "guideline", specialty: "OB/GYN" },
  // PEDIATRICS
  { name: "AAP — American Academy of Pediatrics Clinical Guidelines 2026", url: "https://aap.org/en/clinical-practice", type: "guideline", specialty: "Pediatrics" },
  { name: "ESPGHAN — European Paediatric GI Guidelines", url: "https://espghan.org/guidelines", type: "guideline", specialty: "Pediatric Gastroenterology" },
  // NEUROLOGY
  { name: "AAN — American Academy of Neurology Quality Measures 2026", url: "https://aan.com/practice/guidelines", type: "guideline", specialty: "Neurology" },
  { name: "ECTRIMS — European Committee for Treatment & Research in MS", url: "https://ectrims.eu", type: "guideline", specialty: "Multiple Sclerosis" },
  // ORTHOPEDICS
  { name: "AAOS — American Academy of Orthopaedic Surgeons Guidelines 2026", url: "https://aaos.org/quality/quality-programs/clinical-quality-programs/clinical-practice-guidelines", type: "guideline", specialty: "Orthopedics" },
  { name: "BOA — British Orthopaedic Association", url: "https://boa.ac.uk", type: "guideline", specialty: "Orthopedics" },
  // OPHTHALMOLOGY
  { name: "AAO — American Academy of Ophthalmology Preferred Practice Patterns 2026", url: "https://aao.org/preferred-practice-pattern", type: "guideline", specialty: "Ophthalmology" },
  // CRITICAL CARE
  { name: "SCCM/ESICM — Critical Care Guidelines 2026", url: "https://sccm.org/clinical-resources/guidelines", type: "guideline", specialty: "Critical Care" },
  { name: "Surviving Sepsis Campaign 2024 (Updated 2026)", url: "https://survivingsepsis.org/guidelines", type: "guideline", specialty: "Sepsis/Critical Care" },
  // ARAB ORGANIZATIONS
  { name: "WHO EMRO — Regional Health Guidelines & Technical Documents", url: "https://emro.who.int", type: "guideline", region: "mena" },
  { name: "Arab Board of Medical Specializations (ABMS) — Standards", url: "https://arabboard.org", type: "guideline", region: "mena" },
  { name: "Saudi Health Council — National Clinical Practice Guidelines", url: "https://shc.gov.sa", type: "guideline", region: "mena" },
  { name: "Health Council UAE — Abu Dhabi/Dubai Health Authority Guidelines", type: "guideline", region: "mena" },
  { name: "Kuwait Ministry of Health Clinical Guidelines", type: "guideline", region: "mena" },
  { name: "Qatar National Health Strategy Guidelines", type: "guideline", region: "mena" },
];

// ════════════════════════════════════════════════════════════════
// TIER 5 — FOUNDATIONAL TEXTBOOKS (All Editions)
// ════════════════════════════════════════════════════════════════
export const MEDICAL_TEXTBOOKS: MedicalSource[] = [
  // Internal Medicine
  { name: "Harrison's Principles of Internal Medicine, 21st Edition", type: "textbook", specialty: "Internal Medicine", slug: "harrisons-21" },
  { name: "Goldman-Cecil Medicine, 27th Edition", type: "textbook", specialty: "Internal Medicine", slug: "goldman-cecil-27" },
  { name: "Davidson's Principles & Practice of Medicine, 24th Edition", type: "textbook", specialty: "Internal Medicine", slug: "davidsons-24" },
  { name: "Kumar & Clark's Clinical Medicine, 10th Edition", type: "textbook", specialty: "Internal Medicine", slug: "kumar-clark-10" },
  { name: "Oxford Textbook of Medicine, 6th Edition", type: "textbook", specialty: "Internal Medicine", slug: "oxford-textbook-6" },
  { name: "Current Medical Diagnosis & Treatment (CMDT) 2026", type: "textbook", specialty: "Internal Medicine", slug: "cmdt-2026" },
  { name: "Merck Manual of Diagnosis & Therapy, 20th Edition Professional", type: "textbook", specialty: "General Medicine" },
  // Cardiology
  { name: "Braunwald's Heart Disease: A Textbook of Cardiovascular Medicine, 12th Edition", type: "textbook", specialty: "Cardiology", slug: "braunwald-12" },
  { name: "Hurst's The Heart, 14th Edition", type: "textbook", specialty: "Cardiology" },
  // Pathology
  { name: "Robbins & Cotran Pathologic Basis of Disease, 10th Edition", type: "textbook", specialty: "Pathology", slug: "robbins-10" },
  { name: "Robbins Basic Pathology, 11th Edition", type: "textbook", specialty: "Pathology" },
  { name: "Underwood's Pathology, 8th Edition", type: "textbook", specialty: "Pathology" },
  // Anatomy
  { name: "Gray's Anatomy, 42nd Edition (Referenced as 5th Clinical)", type: "textbook", specialty: "Anatomy", slug: "grays-42" },
  { name: "Netter's Atlas of Human Anatomy, 8th Edition", type: "textbook", specialty: "Anatomy" },
  { name: "Moore's Clinically Oriented Anatomy, 9th Edition", type: "textbook", specialty: "Anatomy" },
  { name: "Snell's Clinical Anatomy by Regions, 10th Edition", type: "textbook", specialty: "Anatomy" },
  // Physiology
  { name: "Guyton & Hall Medical Physiology, 14th Edition", type: "textbook", specialty: "Physiology", slug: "guyton-14" },
  { name: "Ganong's Review of Medical Physiology, 26th Edition", type: "textbook", specialty: "Physiology" },
  { name: "Boron & Boulpaep Medical Physiology, 3rd Edition", type: "textbook", specialty: "Physiology" },
  // Pharmacology
  { name: "Goodman & Gilman's: The Pharmacological Basis of Therapeutics, 14th Edition", type: "textbook", specialty: "Pharmacology", slug: "goodman-gilman-14" },
  { name: "Katzung Basic & Clinical Pharmacology, 16th Edition", type: "textbook", specialty: "Pharmacology" },
  { name: "Rang & Dale's Pharmacology, 10th Edition", type: "textbook", specialty: "Pharmacology" },
  { name: "British National Formulary (BNF) 2026", type: "textbook", specialty: "Pharmacology" },
  // Neurology
  { name: "Adams & Victor's Principles of Neurology, 11th Edition", type: "textbook", specialty: "Neurology", slug: "adams-victor-11" },
  { name: "Bradley & Daroff's Neurology in Clinical Practice, 8th Edition", type: "textbook", specialty: "Neurology" },
  { name: "Marriott's Practical Electrocardiography, 13th Edition", type: "textbook", specialty: "Cardiology/ECG" },
  // Surgery
  { name: "Bailey & Love's Short Practice of Surgery, 28th Edition", type: "textbook", specialty: "Surgery", slug: "bailey-love-28" },
  { name: "Schwartz's Principles of Surgery, 11th Edition", type: "textbook", specialty: "Surgery" },
  { name: "Campbell-Walsh-Wein Urology, 12th Edition", type: "textbook", specialty: "Urology" },
  { name: "Sabiston Textbook of Surgery, 21st Edition", type: "textbook", specialty: "Surgery" },
  // Pediatrics
  { name: "Nelson Textbook of Pediatrics, 22nd Edition", type: "textbook", specialty: "Pediatrics", slug: "nelson-22" },
  { name: "Forfar & Arneil's Textbook of Paediatrics, 8th Edition", type: "textbook", specialty: "Pediatrics" },
  // OB/GYN
  { name: "Williams Obstetrics, 26th Edition", type: "textbook", specialty: "OB/GYN", slug: "williams-obs-26" },
  { name: "Dutta's Textbook of Obstetrics, 10th Edition", type: "textbook", specialty: "OB/GYN" },
  // Clinical Examination
  { name: "Oxford Handbook of Clinical Medicine, 10th Edition", type: "textbook", specialty: "Clinical Skills", slug: "oxhm-10" },
  { name: "Macleod's Clinical Examination, 14th Edition", type: "textbook", specialty: "Clinical Skills", slug: "macleods-14" },
  { name: "Talley & O'Connor: Clinical Examination, 9th Edition", type: "textbook", specialty: "Clinical Skills" },
  // Radiology
  { name: "Grainger & Allison's Diagnostic Radiology, 7th Edition", type: "textbook", specialty: "Radiology" },
  { name: "Primer of Diagnostic Imaging — Weissleder, 6th Edition", type: "textbook", specialty: "Radiology" },
  // Psychiatry
  { name: "Kaplan & Sadock's Synopsis of Psychiatry, 12th Edition", type: "textbook", specialty: "Psychiatry" },
  { name: "DSM-5-TR — Diagnostic & Statistical Manual of Mental Disorders", type: "textbook", specialty: "Psychiatry" },
  { name: "ICD-11 — International Classification of Diseases (WHO 2025)", type: "textbook", specialty: "Classification" },
  // Critical Care
  { name: "Oh's Intensive Care Manual, 8th Edition", type: "textbook", specialty: "Critical Care" },
  { name: "Irwin & Rippe's Intensive Care Medicine, 8th Edition", type: "textbook", specialty: "Critical Care" },
  // Biochemistry
  { name: "Harper's Illustrated Biochemistry, 32nd Edition", type: "textbook", specialty: "Biochemistry" },
  { name: "Lehninger Principles of Biochemistry, 8th Edition", type: "textbook", specialty: "Biochemistry" },
  // USMLE prep (Tier 5 — 2025-2026)
  { name: "First Aid for the USMLE Step 1, 2026 Edition", url: "https://firstaidteam.com", type: "textbook", specialty: "USMLE" },
  { name: "First Aid for the USMLE Step 2 CK, 2026 Edition", url: "https://firstaidteam.com", type: "textbook", specialty: "USMLE" },
  { name: "AMBOSS Medical Knowledge Platform 2026", url: "https://www.amboss.com", type: "database", specialty: "USMLE", openAccess: false },
  { name: "AMBOSS USMLE Prep 2026", url: "https://www.amboss.com/us/usmle", type: "database", specialty: "USMLE" },
  { name: "UWorld QBank 2025-2026", url: "https://www.uworld.com", type: "database", specialty: "USMLE" },
  { name: "Pathoma: Fundamentals of Pathology 2025", url: "https://www.pathoma.com", type: "textbook", specialty: "Pathology" },
  { name: "Boards & Beyond 2025", url: "https://www.boardsbeyond.com", type: "database", specialty: "USMLE" },
  { name: "Sketchy Medical 2025", url: "https://sketchy.com", type: "database", specialty: "USMLE" },
  { name: "Osmosis (Elsevier) 2025", url: "https://www.osmosis.org", type: "database", specialty: "Medical Education", openAccess: false },
  { name: "OnlineMedEd 2025", url: "https://onlinemeded.org", type: "database", specialty: "USMLE" },
  { name: "StatPearls (NCBI Bookshelf) 2026", url: "https://www.statpearls.com", type: "database", specialty: "General Medicine", openAccess: true },
  { name: "Divine Intervention Podcasts 2025", url: "https://divineinterventionpodcasts.com", type: "database", specialty: "USMLE" },
  { name: "AnKing Anki Deck V12 (2025-2026)", url: "https://www.ankipalace.com/anking", type: "database", specialty: "USMLE" },
  { name: "Life in the Fast Lane (LITFL) 2026", url: "https://litfl.com", type: "database", specialty: "Emergency Medicine", openAccess: true },
  { name: "Radiopaedia 2026", url: "https://radiopaedia.org", type: "database", specialty: "Radiology", openAccess: true },
  // Arabic & MENA resources (Tier 6)
  { name: "Saudi MOH Clinical Protocols 2025", url: "https://www.moh.gov.sa", type: "guideline", region: "mena", language: "arabic", specialty: "General Medicine" },
  { name: "Saudi Commission for Health Specialties (SCFHS)", url: "https://www.scfhs.org.sa", type: "organization", region: "mena", language: "arabic" },
  { name: "UAE MOHAP Clinical Guidelines 2025", url: "https://mohap.gov.ae", type: "guideline", region: "mena", language: "bilingual" },
  { name: "WHO EMRO Publications 2025", url: "https://www.emro.who.int/publications", type: "guideline", region: "mena", language: "bilingual", openAccess: true },
  { name: "Egyptian Medical Syndicate Guidelines", url: "https://www.ems.org.eg", type: "organization", region: "mena", language: "arabic" },
  { name: "Webteb — الموسوعة الطبية العربية", url: "https://www.webteb.com", type: "database_arab", region: "arab", language: "arabic", openAccess: true },
  // Open Access Arabic
  { name: "المرجع الطبي العربي الموحد (WHO Arabic Medical Dictionary)", type: "textbook", language: "arabic", region: "mena" },
  { name: "قاموس المصطلحات الطبية الموحد — المنظمة العربية للمعلومات الصحية", type: "textbook", language: "arabic", region: "mena" },
];

// ════════════════════════════════════════════════════════════════
// CONSOLIDATED REGISTRY — All Sources Combined
// ════════════════════════════════════════════════════════════════
export const ALL_MEDICAL_SOURCES: MedicalSource[] = [
  ...PREMIER_JOURNALS,
  ...CARDIOLOGY_JOURNALS,
  ...ONCOLOGY_JOURNALS,
  ...NEURO_JOURNALS,
  ...RESPIRATORY_JOURNALS,
  ...GI_JOURNALS,
  ...NEPHROLOGY_JOURNALS,
  ...ENDO_JOURNALS,
  ...ID_JOURNALS,
  ...SURGERY_JOURNALS,
  ...OBGYN_JOURNALS,
  ...PEDIATRICS_JOURNALS,
  ...OTHER_SPECIALTY_JOURNALS,
  ...ARAB_JOURNALS,
  ...CLINICAL_DATABASES,
  ...GUIDELINES_ORGS,
  ...MEDICAL_TEXTBOOKS,
];

// ════════════════════════════════════════════════════════════════
// STATISTICS
// ════════════════════════════════════════════════════════════════
export const SOURCE_STATS = {
  totalSources: ALL_MEDICAL_SOURCES.length,
  internationalJournals: [...PREMIER_JOURNALS, ...CARDIOLOGY_JOURNALS, ...ONCOLOGY_JOURNALS, ...NEURO_JOURNALS, ...RESPIRATORY_JOURNALS, ...GI_JOURNALS, ...NEPHROLOGY_JOURNALS, ...ENDO_JOURNALS, ...ID_JOURNALS, ...SURGERY_JOURNALS, ...OBGYN_JOURNALS, ...PEDIATRICS_JOURNALS, ...OTHER_SPECIALTY_JOURNALS].length,
  arabJournals: ARAB_JOURNALS.length,
  databases: CLINICAL_DATABASES.length,
  guidelines: GUIDELINES_ORGS.length,
  textbooks: MEDICAL_TEXTBOOKS.length,
  lastUpdated: "April 2026",
};

// ════════════════════════════════════════════════════════════════
// AI MEGA-PROMPT — All Sources in Structured Format for AI Context
// ════════════════════════════════════════════════════════════════
export const MEGA_SOURCE_PROMPT = `

[AUTHORIZED MEDICAL SOURCES REGISTRY - 2026 EDITION]
1. Internal Medicine: Harrison's Principles of Internal Medicine (22nd Ed, 2025), Oxford Textbook of Medicine (7th Ed).
2. Surgery: Sabiston Textbook of Surgery, Schwartz's Principles of Surgery.
3. Pediatrics: Nelson Textbook of Pediatrics (22nd Ed).
4. Obstetrics & Gynecology: Williams Obstetrics (26th Ed).
5. Emergency Medicine: Rosen's Emergency Medicine (10th Ed), Tintinalli's (10th Ed).
6. Cardiology: Braunwald's Heart Disease (13th Ed), ACC/AHA 2026 Guidelines, ESC 2025 Guidelines.
7. Pharmacology: UpToDate (April 2026), Lexicomp, British National Formulary (BNF 87).
8. Best Practices: BMJ Best Practice, Cochrane Database of Systematic Reviews, Mayo Clinic Proceedings, Cleveland Clinic Clinical Decisions.
9. MENA Specific: Eastern Mediterranean Health Journal (EMHJ), Arab Board of Health Specializations Guidelines.

`;
