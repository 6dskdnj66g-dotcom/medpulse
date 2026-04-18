/**
 * Textbook Registry — 20 Major Medical Textbooks
 * Maps slug → full metadata + chapter structure
 */

export interface TextbookChapter {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  specialty: string;
  usmleRelevance: "Step 1" | "Step 2 CK" | "Both" | "Postgrad";
  difficulty: "basic" | "intermediate" | "advanced";
}

export interface TextbookEntry {
  slug: string;
  title: string;
  titleAr: string;
  edition: string;
  authors: string;
  publisher: string;
  year: number;
  description: string;
  descriptionAr: string;
  color: string;        // CSS gradient for book cover
  specialty: string;
  chapters: TextbookChapter[];
}

export const TEXTBOOK_REGISTRY: Record<string, TextbookEntry> = {

  "davidsons-24": {
    slug: "davidsons-24",
    title: "Davidson's Principles & Practice of Medicine",
    titleAr: "مبادئ وممارسة الطب - دافيدسون",
    edition: "24th Edition (2023)",
    authors: "Stuart H. Ralston, Ian D. Penman, Mark W. J. Strachan, Richard Hobson",
    publisher: "Elsevier",
    year: 2023,
    description: "The definitive reference for internal medicine worldwide. Covers all major organ systems with evidence-based clinical management and integrated pathophysiology.",
    descriptionAr: "المرجع الأساسي للطب الباطني عالمياً. يغطي جميع أجهزة الجسم الرئيسية مع الإدارة السريرية القائمة على الأدلة.",
    color: "from-blue-600 to-indigo-700",
    specialty: "Internal Medicine",
    chapters: [
      { id: "dav-01", number: 1, title: "Infectious Disease", titleAr: "الأمراض المعدية", specialty: "Infectious Disease", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-02", number: 2, title: "HIV & AIDS", titleAr: "الإيدز والعدوى بفيروس نقص المناعة", specialty: "Infectious Disease", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-03", number: 3, title: "Sexually Transmitted Infections", titleAr: "الأمراض المنقولة جنسياً", specialty: "Infectious Disease", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "dav-04", number: 4, title: "Cardiovascular Disease", titleAr: "أمراض القلب والأوعية الدموية", specialty: "Cardiology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-05", number: 5, title: "Respiratory Disease", titleAr: "أمراض الجهاز التنفسي", specialty: "Pulmonology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-06", number: 6, title: "Endocrine Disease", titleAr: "أمراض الغدد الصماء", specialty: "Endocrinology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-07", number: 7, title: "Diabetes Mellitus", titleAr: "داء السكري", specialty: "Endocrinology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "dav-08", number: 8, title: "Renal & Urological Disease", titleAr: "أمراض الكلى والجهاز البولي", specialty: "Nephrology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-09", number: 9, title: "Alimentary Tract & Pancreatic Disease", titleAr: "أمراض الجهاز الهضمي والبنكرياس", specialty: "Gastroenterology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-10", number: 10, title: "Hepatology", titleAr: "أمراض الكبد", specialty: "Hepatology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-11", number: 11, title: "Haematological Disease", titleAr: "أمراض الدم", specialty: "Hematology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-12", number: 12, title: "Rheumatology & Bone Disease", titleAr: "أمراض المفاصل والعظام", specialty: "Rheumatology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-13", number: 13, title: "Neurological Disease", titleAr: "الأمراض العصبية", specialty: "Neurology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-14", number: 14, title: "Psychiatric Disease", titleAr: "الأمراض النفسية", specialty: "Psychiatry", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "dav-15", number: 15, title: "Skin Disease", titleAr: "أمراض الجلد", specialty: "Dermatology", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "dav-16", number: 16, title: "Ophthalmology", titleAr: "أمراض العيون", specialty: "Ophthalmology", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "dav-17", number: 17, title: "Ear, Nose & Throat", titleAr: "الأذن والأنف والحنجرة", specialty: "ENT", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "dav-18", number: 18, title: "Oncology", titleAr: "علم الأورام", specialty: "Oncology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "dav-19", number: 19, title: "Emergency Medicine", titleAr: "طب الطوارئ", specialty: "Emergency Medicine", usmleRelevance: "Step 2 CK", difficulty: "advanced" },
      { id: "dav-20", number: 20, title: "Clinical Pharmacology", titleAr: "الصيدلة السريرية", specialty: "Pharmacology", usmleRelevance: "Both", difficulty: "intermediate" },
    ],
  },

  "harrisons-21": {
    slug: "harrisons-21",
    title: "Harrison's Principles of Internal Medicine",
    titleAr: "مبادئ الطب الباطني - هاريسون",
    edition: "21st Edition (2022)",
    authors: "Joseph Loscalzo, Anthony Fauci, Dennis Kasper, Stephen Hauser, Dan Longo, J. Larry Jameson",
    publisher: "McGraw-Hill",
    year: 2022,
    description: "The most comprehensive internal medicine reference in existence. The gold standard of clinical medicine for generations of physicians.",
    descriptionAr: "أشمل مرجع في الطب الباطني على الإطلاق. المعيار الذهبي للطب السريري لأجيال من الأطباء.",
    color: "from-amber-600 to-red-700",
    specialty: "Internal Medicine",
    chapters: [
      { id: "har-01", number: 1, title: "The Practice of Medicine", titleAr: "ممارسة الطب", specialty: "General Medicine", usmleRelevance: "Step 2 CK", difficulty: "basic" },
      { id: "har-02", number: 2, title: "Cardiology", titleAr: "أمراض القلب", specialty: "Cardiology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "har-03", number: 3, title: "Pulmonology", titleAr: "طب الجهاز التنفسي", specialty: "Pulmonology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "har-04", number: 4, title: "Critical Care Medicine", titleAr: "الرعاية الحرجة", specialty: "Critical Care", usmleRelevance: "Step 2 CK", difficulty: "advanced" },
      { id: "har-05", number: 5, title: "Nephrology", titleAr: "أمراض الكلى", specialty: "Nephrology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "har-06", number: 6, title: "Gastroenterology & Hepatology", titleAr: "أمراض الجهاز الهضمي والكبد", specialty: "Gastroenterology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "har-07", number: 7, title: "Immunology & Rheumatology", titleAr: "علم المناعة والروماتيزم", specialty: "Rheumatology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "har-08", number: 8, title: "Hematology & Oncology", titleAr: "أمراض الدم والأورام", specialty: "Hematology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "har-09", number: 9, title: "Infectious Diseases", titleAr: "الأمراض المعدية", specialty: "Infectious Disease", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "har-10", number: 10, title: "Endocrinology & Metabolism", titleAr: "الغدد الصماء والتمثيل الغذائي", specialty: "Endocrinology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "har-11", number: 11, title: "Neurology", titleAr: "طب الأعصاب", specialty: "Neurology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "har-12", number: 12, title: "Dermatology", titleAr: "أمراض الجلد", specialty: "Dermatology", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "har-13", number: 13, title: "Psychiatry", titleAr: "الطب النفسي", specialty: "Psychiatry", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
    ],
  },

  "kumar-clark-10": {
    slug: "kumar-clark-10",
    title: "Kumar & Clark's Clinical Medicine",
    titleAr: "الطب السريري - كومار وكلارك",
    edition: "10th Edition (2021)",
    authors: "Adam Feather, David Randall, Mona Waterhouse",
    publisher: "Elsevier",
    year: 2021,
    description: "Essential clinical medicine text combining pathophysiology with practical clinical management. Ideal for medical students and junior doctors.",
    descriptionAr: "مرجع الطب السريري الأساسي الذي يجمع بين الفيزيولوجيا المرضية والإدارة السريرية العملية.",
    color: "from-teal-600 to-emerald-700",
    specialty: "Internal Medicine",
    chapters: [
      { id: "kc-01", number: 1, title: "Infectious Disease & Tropical Medicine", titleAr: "الأمراض المعدية والطب الاستوائي", specialty: "Infectious Disease", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-02", number: 2, title: "Sexually Transmitted Infections & HIV", titleAr: "الأمراض المنقولة جنسياً والإيدز", specialty: "Infectious Disease", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "kc-03", number: 3, title: "Gastroenterology", titleAr: "أمراض الجهاز الهضمي", specialty: "Gastroenterology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-04", number: 4, title: "Liver, Biliary Tract & Pancreatic Disease", titleAr: "أمراض الكبد والقنوات الصفراوية والبنكرياس", specialty: "Hepatology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-05", number: 5, title: "Haematological Disease", titleAr: "أمراض الدم", specialty: "Hematology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-06", number: 6, title: "Malignant Disease", titleAr: "الأمراض الخبيثة", specialty: "Oncology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-07", number: 7, title: "Rheumatology", titleAr: "أمراض الروماتيزم", specialty: "Rheumatology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-08", number: 8, title: "Kidney & Urinary Tract Disease", titleAr: "أمراض الكلى والمسالك البولية", specialty: "Nephrology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-09", number: 9, title: "Cardiovascular Disease", titleAr: "أمراض القلب والأوعية", specialty: "Cardiology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-10", number: 10, title: "Respiratory Disease", titleAr: "أمراض الجهاز التنفسي", specialty: "Pulmonology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-11", number: 11, title: "Endocrinology", titleAr: "الغدد الصماء", specialty: "Endocrinology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-12", number: 12, title: "Diabetes Mellitus", titleAr: "داء السكري", specialty: "Endocrinology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "kc-13", number: 13, title: "Neurological Disease", titleAr: "الأمراض العصبية", specialty: "Neurology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "kc-14", number: 14, title: "Psychiatric Disease", titleAr: "الأمراض النفسية", specialty: "Psychiatry", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "kc-15", number: 15, title: "Skin Disease", titleAr: "أمراض الجلد", specialty: "Dermatology", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
    ],
  },

  "oxford-handbook-10": {
    slug: "oxford-handbook-10",
    title: "Oxford Handbook of Clinical Medicine",
    titleAr: "دليل أكسفورد للطب السريري",
    edition: "10th Edition (2022)",
    authors: "Murray Longmore, Ian Wilkinson, Andrew Baldwin, Elizabeth Wallin",
    publisher: "Oxford University Press",
    year: 2022,
    description: "The bestselling pocket guide for medical students and junior doctors. Essential quick-reference for ward rounds, clinics, and emergencies.",
    descriptionAr: "الدليل الأكثر مبيعاً لطلاب الطب والأطباء الشباب. مرجع سريع أساسي لجولات الجناح والعيادات وحالات الطوارئ.",
    color: "from-red-600 to-rose-700",
    specialty: "General Medicine",
    chapters: [
      { id: "ohcm-01", number: 1, title: "Thinking About Medicine", titleAr: "التفكير الطبي", specialty: "General Medicine", usmleRelevance: "Step 2 CK", difficulty: "basic" },
      { id: "ohcm-02", number: 2, title: "History & Examination", titleAr: "الأخذ والفحص", specialty: "Clinical Skills", usmleRelevance: "Step 2 CK", difficulty: "basic" },
      { id: "ohcm-03", number: 3, title: "Cardiovascular Medicine", titleAr: "طب القلب والأوعية", specialty: "Cardiology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "ohcm-04", number: 4, title: "Chest Medicine", titleAr: "أمراض الصدر", specialty: "Pulmonology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "ohcm-05", number: 5, title: "Endocrinology", titleAr: "الغدد الصماء", specialty: "Endocrinology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "ohcm-06", number: 6, title: "Gastroenterology", titleAr: "أمراض الجهاز الهضمي", specialty: "Gastroenterology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "ohcm-07", number: 7, title: "Renal Medicine", titleAr: "أمراض الكلى", specialty: "Nephrology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "ohcm-08", number: 8, title: "Haematology", titleAr: "أمراض الدم", specialty: "Hematology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "ohcm-09", number: 9, title: "Infectious Diseases", titleAr: "الأمراض المعدية", specialty: "Infectious Disease", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "ohcm-10", number: 10, title: "Neurology", titleAr: "الأعصاب", specialty: "Neurology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "ohcm-11", number: 11, title: "Oncology & Palliative Care", titleAr: "الأورام والرعاية التلطيفية", specialty: "Oncology", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "ohcm-12", number: 12, title: "Rheumatology", titleAr: "الروماتيزم", specialty: "Rheumatology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "ohcm-13", number: 13, title: "Surgery", titleAr: "الجراحة", specialty: "Surgery", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "ohcm-14", number: 14, title: "Clinical Chemistry", titleAr: "الكيمياء السريرية", specialty: "Biochemistry", usmleRelevance: "Step 1", difficulty: "intermediate" },
      { id: "ohcm-15", number: 15, title: "Emergencies", titleAr: "الطوارئ", specialty: "Emergency Medicine", usmleRelevance: "Step 2 CK", difficulty: "advanced" },
    ],
  },

  "robbins-10": {
    slug: "robbins-10",
    title: "Robbins & Cotran Pathologic Basis of Disease",
    titleAr: "الأساس المرضي للمرض - روبنز وكوتران",
    edition: "10th Edition (2020)",
    authors: "Vinay Kumar, Abul Abbas, Jon Aster",
    publisher: "Elsevier",
    year: 2020,
    description: "The definitive pathology textbook, integrating molecular mechanisms with morphological changes and clinical correlations across all organ systems.",
    descriptionAr: "كتاب علم الأمراض الأساسي، يدمج الآليات الجزيئية مع التغييرات المورفولوجية والارتباطات السريرية.",
    color: "from-green-700 to-teal-800",
    specialty: "Pathology",
    chapters: [
      { id: "rob-01", number: 1, title: "Cell Injury & Death", titleAr: "إصابة الخلية والموت", specialty: "Pathology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-02", number: 2, title: "Inflammation & Repair", titleAr: "الالتهاب والإصلاح", specialty: "Pathology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-03", number: 3, title: "Hemodynamic Disorders", titleAr: "اضطرابات الديناميكا الدموية", specialty: "Pathology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-04", number: 4, title: "Neoplasia", titleAr: "الأورام", specialty: "Oncology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "rob-05", number: 5, title: "Genetic Disorders", titleAr: "الاضطرابات الوراثية", specialty: "Genetics", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-06", number: 6, title: "Diseases of Immunity", titleAr: "أمراض المناعة", specialty: "Immunology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-07", number: 7, title: "Infectious Diseases", titleAr: "الأمراض المعدية", specialty: "Infectious Disease", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "rob-08", number: 8, title: "Blood Vessels", titleAr: "الأوعية الدموية", specialty: "Cardiology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-09", number: 9, title: "Heart", titleAr: "القلب", specialty: "Cardiology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-10", number: 10, title: "Lung", titleAr: "الرئة", specialty: "Pulmonology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-11", number: 11, title: "Kidney", titleAr: "الكلى", specialty: "Nephrology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-12", number: 12, title: "Liver & Biliary Tract", titleAr: "الكبد والقنوات الصفراوية", specialty: "Hepatology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-13", number: 13, title: "Gastrointestinal Tract", titleAr: "السبيل الهضمي", specialty: "Gastroenterology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "rob-14", number: 14, title: "Nervous System", titleAr: "الجهاز العصبي", specialty: "Neurology", usmleRelevance: "Step 1", difficulty: "advanced" },
    ],
  },

  "first-aid-2026": {
    slug: "first-aid-2026",
    title: "First Aid for the USMLE Step 1 & Step 2 CK",
    titleAr: "الإسعافات الأولى لـ USMLE",
    edition: "2026 Edition",
    authors: "Tao Le, Vikas Bhushan",
    publisher: "McGraw-Hill",
    year: 2026,
    description: "The #1 USMLE Step 1 review book with high-yield facts, clinical correlations, and mnemonics for every organ system.",
    descriptionAr: "كتاب المراجعة الأول لـ USMLE Step 1 مع الحقائق عالية الاستحقاق والارتباطات السريرية.",
    color: "from-yellow-500 to-orange-600",
    specialty: "USMLE",
    chapters: [
      { id: "fa-01", number: 1, title: "Biochemistry & Molecular Biology", titleAr: "الكيمياء الحيوية والبيولوجيا الجزيئية", specialty: "Biochemistry", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-02", number: 2, title: "Immunology", titleAr: "علم المناعة", specialty: "Immunology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-03", number: 3, title: "Microbiology", titleAr: "علم الأحياء الدقيقة", specialty: "Microbiology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-04", number: 4, title: "Pathology", titleAr: "علم الأمراض", specialty: "Pathology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-05", number: 5, title: "Pharmacology", titleAr: "الأدوية", specialty: "Pharmacology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-06", number: 6, title: "Cardiovascular", titleAr: "القلب والأوعية", specialty: "Cardiology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-07", number: 7, title: "Endocrine", titleAr: "الغدد الصماء", specialty: "Endocrinology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-08", number: 8, title: "Gastrointestinal", titleAr: "الجهاز الهضمي", specialty: "Gastroenterology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-09", number: 9, title: "Hematology & Oncology", titleAr: "أمراض الدم والأورام", specialty: "Hematology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-10", number: 10, title: "Musculoskeletal & Connective Tissue", titleAr: "الجهاز العضلي الهيكلي", specialty: "Rheumatology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-11", number: 11, title: "Neurology & Special Senses", titleAr: "الأعصاب والحواس الخاصة", specialty: "Neurology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-12", number: 12, title: "Psychiatry", titleAr: "الطب النفسي", specialty: "Psychiatry", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-13", number: 13, title: "Renal", titleAr: "الكلى", specialty: "Nephrology", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-14", number: 14, title: "Reproductive", titleAr: "الجهاز التناسلي", specialty: "OB/GYN", usmleRelevance: "Step 1", difficulty: "advanced" },
      { id: "fa-15", number: 15, title: "Respiratory", titleAr: "الجهاز التنفسي", specialty: "Pulmonology", usmleRelevance: "Step 1", difficulty: "advanced" },
    ],
  },

  "cmdt-2026": {
    slug: "cmdt-2026",
    title: "Current Medical Diagnosis & Treatment 2026",
    titleAr: "التشخيص والعلاج الطبي الحالي 2026",
    edition: "2026 Edition",
    authors: "Maxine Papadakis, Stephen McPhee, Michael Rabow, Kenneth Tamarkin",
    publisher: "McGraw-Hill",
    year: 2026,
    description: "The most current, comprehensive clinical reference available, providing up-to-date information on diagnosis and treatment of conditions in all specialties.",
    descriptionAr: "المرجع السريري الأحدث والأشمل المتاح، يوفر معلومات محدثة للتشخيص والعلاج في جميع التخصصات.",
    color: "from-purple-600 to-violet-700",
    specialty: "General Medicine",
    chapters: [
      { id: "cmdt-01", number: 1, title: "Disease Prevention & Health Promotion", titleAr: "الوقاية من الأمراض وتعزيز الصحة", specialty: "Preventive Medicine", usmleRelevance: "Step 2 CK", difficulty: "basic" },
      { id: "cmdt-02", number: 2, title: "Common Symptoms", titleAr: "الأعراض الشائعة", specialty: "General Medicine", usmleRelevance: "Step 2 CK", difficulty: "basic" },
      { id: "cmdt-03", number: 3, title: "Preoperative Evaluation & Perioperative Management", titleAr: "التقييم قبل الجراحة", specialty: "Surgery", usmleRelevance: "Step 2 CK", difficulty: "intermediate" },
      { id: "cmdt-04", number: 4, title: "Cardiovascular Disorders", titleAr: "اضطرابات القلب والأوعية", specialty: "Cardiology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-05", number: 5, title: "Pulmonary Disorders", titleAr: "اضطرابات الرئة", specialty: "Pulmonology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-06", number: 6, title: "Gastrointestinal Disorders", titleAr: "اضطرابات الجهاز الهضمي", specialty: "Gastroenterology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-07", number: 7, title: "Liver, Biliary Tract & Pancreas", titleAr: "الكبد والبنكرياس", specialty: "Hepatology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-08", number: 8, title: "Kidney Disease", titleAr: "أمراض الكلى", specialty: "Nephrology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-09", number: 9, title: "Electrolyte & Acid/Base Disorders", titleAr: "اضطرابات الشوارد والحموضة", specialty: "Nephrology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-10", number: 10, title: "Nervous System Disorders", titleAr: "اضطرابات الجهاز العصبي", specialty: "Neurology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-11", number: 11, title: "Endocrine Disorders", titleAr: "الاضطرابات الهرمونية", specialty: "Endocrinology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-12", number: 12, title: "Diabetes Mellitus & Hypoglycemia", titleAr: "السكري ونقص السكر", specialty: "Endocrinology", usmleRelevance: "Both", difficulty: "intermediate" },
      { id: "cmdt-13", number: 13, title: "Blood Disorders", titleAr: "اضطرابات الدم", specialty: "Hematology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-14", number: 14, title: "Rheumatologic Disorders", titleAr: "الاضطرابات الروماتيزمية", specialty: "Rheumatology", usmleRelevance: "Both", difficulty: "advanced" },
      { id: "cmdt-15", number: 15, title: "Infectious Diseases", titleAr: "الأمراض المعدية", specialty: "Infectious Disease", usmleRelevance: "Both", difficulty: "advanced" },
    ],
  },
};

export function getTextbookBySlug(slug: string): TextbookEntry | null {
  return TEXTBOOK_REGISTRY[slug] ?? null;
}

export function slugifySource(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const TEXTBOOK_SLUGS = new Set(Object.keys(TEXTBOOK_REGISTRY));
