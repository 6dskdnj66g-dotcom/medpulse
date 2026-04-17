const fs = require('fs');
const path = 'D:/medpuls/New folder/src/lib/medicalSources.ts';
let content = fs.readFileSync(path, 'utf8');

const enhancedSources = `
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

content = content.replace(/ MEGA_SOURCE_PROMPT = `.*?`;/s, " MEGA_SOURCE_PROMPT = `\n" + enhancedSources + "\n`;");
fs.writeFileSync(path, content, 'utf8');
console.log('Sources Enhanced');