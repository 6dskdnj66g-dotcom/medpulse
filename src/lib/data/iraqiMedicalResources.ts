/**
 * Iraqi medical ecosystem — reference data for the resource sidebar.
 *
 * Honesty guardrails baked into this file:
 *   - Colleges: real, publicly verifiable Iraqi medical schools.
 *   - Reference books: real bibliographic data. Edition strings say
 *     "Latest edition" when a specific edition number would be a guess.
 *   - Iraqi-specific rankings / channels / drives / per-college
 *     curriculum specifics are NOT populated here — those need vetted
 *     source material. Consumers should render a proper empty state
 *     for the community-resources tab rather than fabricate entries.
 */

export type IraqiRegion = "baghdad" | "central" | "north" | "south" | "kurdistan";

export interface IraqiMedicalCollege {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
  region: IraqiRegion;
  established?: number;
  website?: string;
  notes?: string;
}

export type ReferenceCategory =
  | "internal-medicine"
  | "surgery"
  | "clinical-skills"
  | "pharmacology"
  | "pediatrics"
  | "obgyn"
  | "psychiatry"
  | "emergency"
  | "anatomy"
  | "physiology"
  | "pathology"
  | "biochemistry"
  | "microbiology"
  | "public-health"
  | "board-review";

export interface MedicalReferenceBook {
  id: string;
  title: string;
  authors: string;
  publisher: string;
  editionNote: string;
  category: ReferenceCategory;
  officialWebsite?: string;
  description: string;
  usedForOsce: boolean;
}

export interface ClinicalGuidelineSource {
  id: string;
  name: string;
  nameAr?: string;
  region: "iraq" | "uk" | "eu" | "us" | "who" | "global";
  url?: string;
  focus: string;
}

export interface StationReferenceLinks {
  stationId: string;
  clinicalTopic: string;
  suggestedReferenceIds: string[];
  suggestedGuidelineIds: string[];
}

// ── Iraqi medical colleges ────────────────────────────────────────────────

export const IRAQI_MEDICAL_COLLEGES: IraqiMedicalCollege[] = [
  {
    id: "baghdad-medicine",
    name: "University of Baghdad — College of Medicine",
    nameAr: "جامعة بغداد — كلية الطب",
    city: "Baghdad",
    cityAr: "بغداد",
    region: "baghdad",
    established: 1927,
    website: "https://comed.uobaghdad.edu.iq/",
  },
  {
    id: "al-kindy-medicine",
    name: "Al-Kindy College of Medicine (University of Baghdad)",
    nameAr: "كلية طب الكندي — جامعة بغداد",
    city: "Baghdad",
    cityAr: "بغداد",
    region: "baghdad",
    established: 2001,
    website: "https://kmc.uobaghdad.edu.iq/",
  },
  {
    id: "mustansiriya-medicine",
    name: "Mustansiriya University — College of Medicine",
    nameAr: "الجامعة المستنصرية — كلية الطب",
    city: "Baghdad",
    cityAr: "بغداد",
    region: "baghdad",
    established: 1988,
    website: "https://uomustansiriyah.edu.iq/",
  },
  {
    id: "nahrain-medicine",
    name: "Al-Nahrain University — College of Medicine",
    nameAr: "جامعة النهرين — كلية الطب",
    city: "Baghdad",
    cityAr: "بغداد",
    region: "baghdad",
    established: 1988,
    website: "https://www.nahrainuniv.edu.iq/",
  },
  {
    id: "mosul-medicine",
    name: "University of Mosul — College of Medicine",
    nameAr: "جامعة الموصل — كلية الطب",
    city: "Mosul",
    cityAr: "الموصل",
    region: "north",
    established: 1959,
    website: "https://uomosul.edu.iq/",
  },
  {
    id: "ninevah-medicine",
    name: "University of Ninevah — College of Medicine",
    nameAr: "جامعة نينوى — كلية الطب",
    city: "Mosul",
    cityAr: "الموصل",
    region: "north",
    established: 2014,
  },
  {
    id: "basrah-medicine",
    name: "University of Basrah — College of Medicine",
    nameAr: "جامعة البصرة — كلية الطب",
    city: "Basrah",
    cityAr: "البصرة",
    region: "south",
    established: 1967,
    website: "https://uobasrah.edu.iq/",
  },
  {
    id: "kufa-medicine",
    name: "University of Kufa — Faculty of Medicine",
    nameAr: "جامعة الكوفة — كلية الطب",
    city: "Najaf",
    cityAr: "النجف",
    region: "central",
    established: 1977,
    website: "https://uokufa.edu.iq/",
  },
  {
    id: "babylon-medicine",
    name: "University of Babylon — College of Medicine",
    nameAr: "جامعة بابل — كلية الطب",
    city: "Hillah",
    cityAr: "الحلة",
    region: "central",
    established: 1991,
    website: "https://uobabylon.edu.iq/",
  },
  {
    id: "karbala-medicine",
    name: "University of Karbala — College of Medicine",
    nameAr: "جامعة كربلاء — كلية الطب",
    city: "Karbala",
    cityAr: "كربلاء",
    region: "central",
    established: 2003,
    website: "https://uokerbala.edu.iq/",
  },
  {
    id: "diyala-medicine",
    name: "University of Diyala — College of Medicine",
    nameAr: "جامعة ديالى — كلية الطب",
    city: "Baqubah",
    cityAr: "بعقوبة",
    region: "central",
    established: 2003,
    website: "https://www.uodiyala.edu.iq/",
  },
  {
    id: "tikrit-medicine",
    name: "Tikrit University — College of Medicine",
    nameAr: "جامعة تكريت — كلية الطب",
    city: "Tikrit",
    cityAr: "تكريت",
    region: "central",
    established: 1988,
    website: "https://www.tu.edu.iq/",
  },
  {
    id: "anbar-medicine",
    name: "University of Anbar — College of Medicine",
    nameAr: "جامعة الأنبار — كلية الطب",
    city: "Ramadi",
    cityAr: "الرمادي",
    region: "central",
    established: 2001,
    website: "https://www.uoanbar.edu.iq/",
  },
  {
    id: "wasit-medicine",
    name: "University of Wasit — College of Medicine",
    nameAr: "جامعة واسط — كلية الطب",
    city: "Kut",
    cityAr: "الكوت",
    region: "central",
    established: 2003,
    website: "https://uowasit.edu.iq/",
  },
  {
    id: "muthanna-medicine",
    name: "Al-Muthanna University — College of Medicine",
    nameAr: "جامعة المثنى — كلية الطب",
    city: "Samawah",
    cityAr: "السماوة",
    region: "south",
    website: "https://mu.edu.iq/",
  },
  {
    id: "thi-qar-medicine",
    name: "University of Thi-Qar — College of Medicine",
    nameAr: "جامعة ذي قار — كلية الطب",
    city: "Nasiriyah",
    cityAr: "الناصرية",
    region: "south",
    website: "https://utq.edu.iq/",
  },
  {
    id: "sulaimani-medicine",
    name: "University of Sulaimani — College of Medicine",
    nameAr: "جامعة السليمانية — كلية الطب",
    city: "Sulaymaniyah",
    cityAr: "السليمانية",
    region: "kurdistan",
    established: 1968,
    website: "https://univsul.edu.iq/",
  },
  {
    id: "hawler-medical",
    name: "Hawler Medical University",
    nameAr: "جامعة هولير الطبية",
    city: "Erbil",
    cityAr: "أربيل",
    region: "kurdistan",
    established: 2005,
    website: "https://hmu.edu.krd/",
  },
  {
    id: "duhok-medicine",
    name: "University of Duhok — College of Medicine",
    nameAr: "جامعة دهوك — كلية الطب",
    city: "Duhok",
    cityAr: "دهوك",
    region: "kurdistan",
    established: 1992,
    website: "https://uod.ac/",
  },
];

// ── Reference books widely used in Iraqi medical education ────────────────

export const REFERENCE_BOOKS: MedicalReferenceBook[] = [
  {
    id: "davidsons-medicine",
    title: "Davidson's Principles and Practice of Medicine",
    authors: "Ralston, Penman, Strachan, Hobson (eds.)",
    publisher: "Elsevier",
    editionNote: "Latest edition",
    category: "internal-medicine",
    officialWebsite: "https://www.elsevier.com/books/davidsons-principles-and-practice-of-medicine",
    description:
      "The predominant undergraduate internal medicine textbook across UK-style curricula and widely adopted in Iraq. Best for structured symptom-to-diagnosis reasoning and OSCE history-taking backbone.",
    usedForOsce: true,
  },
  {
    id: "kumar-clark",
    title: "Kumar & Clark's Clinical Medicine",
    authors: "Feather, Randall, Waterhouse (eds.)",
    publisher: "Elsevier",
    editionNote: "Latest edition",
    category: "internal-medicine",
    officialWebsite: "https://www.elsevier.com/books/kumar-and-clark-clinical-medicine",
    description:
      "A denser reference than Davidson's, popular for finals-year revision and system-based clinical reasoning.",
    usedForOsce: true,
  },
  {
    id: "macleods-clinical-examination",
    title: "Macleod's Clinical Examination",
    authors: "Innes, Dover, Fairhurst (eds.)",
    publisher: "Elsevier",
    editionNote: "Latest edition",
    category: "clinical-skills",
    officialWebsite: "https://www.elsevier.com/books/macleods-clinical-examination",
    description:
      "The reference for structured physical examination sequences — cardiovascular, respiratory, abdominal, and neurological — and mandatory for OSCE examination stations.",
    usedForOsce: true,
  },
  {
    id: "bailey-love",
    title: "Bailey & Love's Short Practice of Surgery",
    authors: "Williams, Bulstrode, O'Connell (eds.)",
    publisher: "CRC Press / Taylor & Francis",
    editionNote: "Latest edition",
    category: "surgery",
    officialWebsite: "https://www.routledge.com/Bailey-Loves-Short-Practice-of-Surgery/book-series/BLSPS",
    description:
      "The standard surgical textbook for undergraduates in Iraqi and UK curricula. Core reference for acute abdomen, hernia, gallbladder, and trauma OSCE stations.",
    usedForOsce: true,
  },
  {
    id: "oxford-handbook-clinical-medicine",
    title: "Oxford Handbook of Clinical Medicine",
    authors: "Wilkinson, Raine, Wiles et al.",
    publisher: "Oxford University Press",
    editionNote: "Latest edition",
    category: "internal-medicine",
    officialWebsite: "https://global.oup.com/academic/product/oxford-handbook-of-clinical-medicine",
    description:
      "Pocket-sized clinical companion — fast lookups on differentials, drug doses, emergencies, and normal ranges during the OSCE reading window.",
    usedForOsce: true,
  },
  {
    id: "oxford-handbook-specialties",
    title: "Oxford Handbook of Clinical Specialties",
    authors: "Collier, Longmore, Turmezei",
    publisher: "Oxford University Press",
    editionNote: "Latest edition",
    category: "internal-medicine",
    officialWebsite: "https://global.oup.com/academic/product/oxford-handbook-of-clinical-specialties",
    description:
      "Companion to the OHCM covering paediatrics, O&G, psychiatry, ENT, ophthalmology — essential for the broad OSCE circuit.",
    usedForOsce: true,
  },
  {
    id: "nelson-pediatrics",
    title: "Nelson Textbook of Pediatrics",
    authors: "Kliegman, St. Geme, Blum et al.",
    publisher: "Elsevier",
    editionNote: "Latest edition",
    category: "pediatrics",
    officialWebsite: "https://www.elsevier.com/books/nelson-textbook-of-pediatrics",
    description: "Definitive paediatrics reference — used across Iraqi paediatric rotations and MBChB finals.",
    usedForOsce: true,
  },
  {
    id: "williams-obstetrics",
    title: "Williams Obstetrics",
    authors: "Cunningham, Leveno, Bloom et al.",
    publisher: "McGraw-Hill",
    editionNote: "Latest edition",
    category: "obgyn",
    officialWebsite: "https://www.mhprofessional.com/williams-obstetrics",
    description: "Standard obstetrics reference for antenatal, intrapartum, and postpartum management.",
    usedForOsce: true,
  },
  {
    id: "shaw-gynaecology",
    title: "Shaw's Textbook of Gynaecology",
    authors: "Padubidri, Daftary",
    publisher: "Elsevier",
    editionNote: "Latest edition",
    category: "obgyn",
    description: "Concise gynaecology reference commonly used alongside Williams for OSCE and end-of-rotation exams.",
    usedForOsce: true,
  },
  {
    id: "kaplan-clinical-microbiology",
    title: "Jawetz, Melnick & Adelberg's Medical Microbiology",
    authors: "Riedel, Morse, Mietzner, Miller",
    publisher: "McGraw-Hill",
    editionNote: "Latest edition",
    category: "microbiology",
    description: "Standard microbiology reference for organism-based revision and infectious-disease stations.",
    usedForOsce: false,
  },
  {
    id: "robbins-pathology",
    title: "Robbins & Cotran Pathologic Basis of Disease",
    authors: "Kumar, Abbas, Aster",
    publisher: "Elsevier",
    editionNote: "Latest edition",
    category: "pathology",
    officialWebsite: "https://www.elsevier.com/books/robbins-and-cotran-pathologic-basis-of-disease",
    description: "The pathology backbone across MBChB curricula — pairs with Robbins Basic Pathology for exam prep.",
    usedForOsce: false,
  },
  {
    id: "guyton-hall",
    title: "Guyton and Hall Textbook of Medical Physiology",
    authors: "Hall, Hall",
    publisher: "Elsevier",
    editionNote: "Latest edition",
    category: "physiology",
    officialWebsite: "https://www.elsevier.com/books/guyton-and-hall-textbook-of-medical-physiology",
    description: "Core physiology reference used in Iraqi preclinical years.",
    usedForOsce: false,
  },
  {
    id: "harpers-biochemistry",
    title: "Harper's Illustrated Biochemistry",
    authors: "Rodwell, Bender, Botham, Kennelly, Weil",
    publisher: "McGraw-Hill",
    editionNote: "Latest edition",
    category: "biochemistry",
    description: "The standard biochemistry text in Iraqi and regional preclinical curricula.",
    usedForOsce: false,
  },
  {
    id: "snells-anatomy",
    title: "Snell's Clinical Anatomy by Regions",
    authors: "Splittgerber",
    publisher: "Wolters Kluwer",
    editionNote: "Latest edition",
    category: "anatomy",
    description: "Regional clinical anatomy reference — used in preclinical years and surgical revision.",
    usedForOsce: false,
  },
  {
    id: "katzung-pharmacology",
    title: "Katzung's Basic & Clinical Pharmacology",
    authors: "Vanderah",
    publisher: "McGraw-Hill",
    editionNote: "Latest edition",
    category: "pharmacology",
    description: "Standard pharmacology text; useful for the prescribing OSCE stations.",
    usedForOsce: true,
  },
  {
    id: "bnf",
    title: "British National Formulary (BNF)",
    authors: "Joint Formulary Committee",
    publisher: "BMJ / Pharmaceutical Press",
    editionNote: "Latest edition (updated 6-monthly)",
    category: "pharmacology",
    officialWebsite: "https://bnf.nice.org.uk/",
    description:
      "Practical prescribing reference — doses, interactions, and cautions. Widely used by Iraqi FY doctors during clinical work and OSCE prescribing stations.",
    usedForOsce: true,
  },
  {
    id: "kaplan-usmle",
    title: "Kaplan USMLE Step 2 CK Lecture Notes",
    authors: "Kaplan Medical",
    publisher: "Kaplan Publishing",
    editionNote: "Latest edition",
    category: "board-review",
    description: "Concise, exam-focused review series for those preparing for USMLE alongside MBChB finals.",
    usedForOsce: false,
  },
  {
    id: "first-aid-usmle",
    title: "First Aid for the USMLE Step 1",
    authors: "Le, Bhushan",
    publisher: "McGraw-Hill",
    editionNote: "Latest edition",
    category: "board-review",
    description: "High-yield board-review text; increasingly used by Iraqi students planning US-track residency.",
    usedForOsce: false,
  },
];

// ── Guideline sources ────────────────────────────────────────────────────

export const GUIDELINE_SOURCES: ClinicalGuidelineSource[] = [
  {
    id: "iraqi-moh",
    name: "Iraqi Ministry of Health",
    nameAr: "وزارة الصحة العراقية",
    region: "iraq",
    url: "https://moh.gov.iq/",
    focus: "National protocols, immunisation, communicable diseases, and pharmacy formulary.",
  },
  {
    id: "iraqi-society-cardiology",
    name: "Iraqi Society of Cardiovascular Medicine",
    nameAr: "الجمعية العراقية للطب القلبي الوعائي",
    region: "iraq",
    focus: "Local cardiology practice guidance and CME.",
  },
  {
    id: "nice",
    name: "NICE Guidelines",
    region: "uk",
    url: "https://www.nice.org.uk/guidance",
    focus: "Evidence-based clinical guidance used across the UK MBBS/PLAB curriculum.",
  },
  {
    id: "bts",
    name: "British Thoracic Society",
    region: "uk",
    url: "https://www.brit-thoracic.org.uk/",
    focus: "Asthma, COPD, pneumonia, pleural disease, and pulmonary emergency guidelines.",
  },
  {
    id: "esc",
    name: "European Society of Cardiology",
    region: "eu",
    url: "https://www.escardio.org/Guidelines",
    focus: "ACS, heart failure, arrhythmia, valvular disease guidelines.",
  },
  {
    id: "aha-acc",
    name: "American Heart Association / American College of Cardiology",
    region: "us",
    url: "https://professional.heart.org/en/guidelines-and-statements",
    focus: "US cardiology guidelines and STEMI/NSTEMI/heart-failure algorithms.",
  },
  {
    id: "who",
    name: "World Health Organization",
    region: "who",
    url: "https://www.who.int/publications/who-guidelines",
    focus: "Global public-health guidance, IMCI, TB, malaria, immunisation schedules.",
  },
  {
    id: "gina",
    name: "Global Initiative for Asthma (GINA)",
    region: "global",
    url: "https://ginasthma.org/",
    focus: "Global asthma stepwise-management report.",
  },
  {
    id: "gold",
    name: "Global Initiative for Chronic Obstructive Lung Disease (GOLD)",
    region: "global",
    url: "https://goldcopd.org/",
    focus: "COPD classification and management report.",
  },
  {
    id: "ada",
    name: "American Diabetes Association Standards of Care",
    region: "us",
    url: "https://diabetesjournals.org/care/issue",
    focus: "Diabetes diagnosis and management standards.",
  },
];

// ── Station → reference mapping ──────────────────────────────────────────
// Mapping is by *clinical topic*, which is a matter of general clinical
// knowledge; page numbers and per-college syllabus alignment are not
// fabricated here.

export const STATION_REFERENCE_MAP: StationReferenceLinks[] = [
  {
    stationId: "chest-pain-stemi-001",
    clinicalTopic: "Acute coronary syndrome / STEMI",
    suggestedReferenceIds: ["davidsons-medicine", "oxford-handbook-clinical-medicine", "kumar-clark"],
    suggestedGuidelineIds: ["esc", "aha-acc", "nice"],
  },
  {
    stationId: "headache-sah-002",
    clinicalTopic: "Subarachnoid haemorrhage / thunderclap headache",
    suggestedReferenceIds: ["davidsons-medicine", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "sob-pe-003",
    clinicalTopic: "Pulmonary embolism / VTE",
    suggestedReferenceIds: ["davidsons-medicine", "kumar-clark", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice", "bts"],
  },
  {
    stationId: "abdominal-pain-appendicitis-004",
    clinicalTopic: "Acute appendicitis / acute abdomen",
    suggestedReferenceIds: ["bailey-love", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "weight-loss-malignancy-005",
    clinicalTopic: "Unintentional weight loss / red-flag oncology",
    suggestedReferenceIds: ["davidsons-medicine", "kumar-clark"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "dysphagia-oesophageal-ca-006",
    clinicalTopic: "Dysphagia / upper GI malignancy",
    suggestedReferenceIds: ["davidsons-medicine", "bailey-love"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "polyuria-t1dm-007",
    clinicalTopic: "New-onset diabetes / DKA in adolescence",
    suggestedReferenceIds: ["davidsons-medicine", "nelson-pediatrics", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["ada", "nice"],
  },
  {
    stationId: "pv-bleeding-ectopic-008",
    clinicalTopic: "Early pregnancy bleeding / ectopic pregnancy",
    suggestedReferenceIds: ["williams-obstetrics", "shaw-gynaecology", "oxford-handbook-specialties"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "cardiovascular-exam-mr-009",
    clinicalTopic: "Cardiovascular examination / mitral regurgitation",
    suggestedReferenceIds: ["macleods-clinical-examination", "davidsons-medicine"],
    suggestedGuidelineIds: ["esc"],
  },
  {
    stationId: "respiratory-exam-pneumonia-010",
    clinicalTopic: "Respiratory examination / consolidation",
    suggestedReferenceIds: ["macleods-clinical-examination", "davidsons-medicine"],
    suggestedGuidelineIds: ["bts", "nice"],
  },
  {
    stationId: "neurological-exam-stroke-011",
    clinicalTopic: "Neurological examination / stroke",
    suggestedReferenceIds: ["macleods-clinical-examination", "davidsons-medicine", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "abdominal-exam-hepatomegaly-012",
    clinicalTopic: "Abdominal examination / hepatomegaly / chronic liver disease",
    suggestedReferenceIds: ["macleods-clinical-examination", "davidsons-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "breaking-bad-news-cancer-013",
    clinicalTopic: "Breaking bad news (SPIKES framework)",
    suggestedReferenceIds: ["oxford-handbook-clinical-medicine", "macleods-clinical-examination"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "consent-laparoscopic-cholecystectomy-014",
    clinicalTopic: "Informed consent for laparoscopic cholecystectomy",
    suggestedReferenceIds: ["bailey-love", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "angry-patient-delayed-results-015",
    clinicalTopic: "Communication — de-escalation and delayed results",
    suggestedReferenceIds: ["oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "confidentiality-15yo-016",
    clinicalTopic: "Confidentiality and Gillick competence",
    suggestedReferenceIds: ["oxford-handbook-specialties"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "interpreter-needed-017",
    clinicalTopic: "Consultation with a language barrier",
    suggestedReferenceIds: ["oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "domestic-violence-screen-018",
    clinicalTopic: "Intimate partner violence screening / safeguarding",
    suggestedReferenceIds: ["oxford-handbook-clinical-medicine", "oxford-handbook-specialties"],
    suggestedGuidelineIds: ["who", "nice"],
  },
  {
    stationId: "anaphylaxis-management-019",
    clinicalTopic: "Anaphylaxis emergency management",
    suggestedReferenceIds: ["oxford-handbook-clinical-medicine", "bnf"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "dka-management-020",
    clinicalTopic: "Diabetic ketoacidosis management",
    suggestedReferenceIds: ["davidsons-medicine", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["ada", "nice"],
  },
  {
    stationId: "acute-asthma-severe-021",
    clinicalTopic: "Acute severe / life-threatening asthma",
    suggestedReferenceIds: ["davidsons-medicine", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["bts", "gina"],
  },
  {
    stationId: "tonic-clonic-seizure-022",
    clinicalTopic: "Status epilepticus management",
    suggestedReferenceIds: ["davidsons-medicine", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "ecg-interpretation-stemi-023",
    clinicalTopic: "ECG interpretation — inferior STEMI",
    suggestedReferenceIds: ["davidsons-medicine", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["esc", "aha-acc"],
  },
  {
    stationId: "abg-interpretation-mixed-024",
    clinicalTopic: "Arterial blood gas — mixed acid-base",
    suggestedReferenceIds: ["davidsons-medicine", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice", "gold"],
  },
  {
    stationId: "cxr-interpretation-pneumothorax-025",
    clinicalTopic: "CXR — tension pneumothorax",
    suggestedReferenceIds: ["davidsons-medicine", "oxford-handbook-clinical-medicine", "bailey-love"],
    suggestedGuidelineIds: ["bts"],
  },
  {
    stationId: "explain-lumbar-puncture-026",
    clinicalTopic: "Lumbar puncture consent and procedure explanation",
    suggestedReferenceIds: ["oxford-handbook-clinical-medicine", "macleods-clinical-examination"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "explain-colonoscopy-027",
    clinicalTopic: "Colonoscopy consent",
    suggestedReferenceIds: ["bailey-love", "oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "explain-mri-claustrophobic-028",
    clinicalTopic: "MRI explanation with claustrophobia support",
    suggestedReferenceIds: ["oxford-handbook-clinical-medicine"],
    suggestedGuidelineIds: ["nice"],
  },
  {
    stationId: "smoking-cessation-029",
    clinicalTopic: "Smoking cessation brief intervention (5 As)",
    suggestedReferenceIds: ["oxford-handbook-clinical-medicine", "davidsons-medicine"],
    suggestedGuidelineIds: ["who", "nice"],
  },
  {
    stationId: "end-of-life-discussion-030",
    clinicalTopic: "End-of-life goals-of-care discussion",
    suggestedReferenceIds: ["oxford-handbook-clinical-medicine", "oxford-handbook-specialties"],
    suggestedGuidelineIds: ["nice"],
  },
];

export function getReferenceById(id: string): MedicalReferenceBook | undefined {
  return REFERENCE_BOOKS.find((r) => r.id === id);
}

export function getGuidelineById(id: string): ClinicalGuidelineSource | undefined {
  return GUIDELINE_SOURCES.find((g) => g.id === id);
}

export function getStationReferenceLinks(stationId: string): StationReferenceLinks | undefined {
  return STATION_REFERENCE_MAP.find((s) => s.stationId === stationId);
}
