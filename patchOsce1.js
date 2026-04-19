const fs = require('fs');

// 1. Update osceStations.ts
let osceStationsTs = fs.readFileSync('src/lib/osceStations.ts', 'utf8');

// Add interactiveExams to OSCEStation interface
osceStationsTs = osceStationsTs.replace(
  /patientPersona: PatientPersona;/g,
  `patientPersona: PatientPersona;\n  interactiveExams?: { name: string; nameAr: string; icon: string; result: string; category: string }[];`
);

// Add exams to IM-01
if (!osceStationsTs.includes('interactiveExams: [')) {
  osceStationsTs = osceStationsTs.replace(
    /physicalFindings: "Diaphoretic, pale, HR 98 irregular, BP 155\/95, RR 20, SpO2 96% on air. Chest clear. Quiet heart sounds."\n    },/g,
    `physicalFindings: "Diaphoretic, pale, HR 98 irregular, BP 155/95, RR 20, SpO2 96% on air. Chest clear. Quiet heart sounds."\n    },\n    interactiveExams: [\n      { name: "Take Vitals (BP, HR, SpO2)", nameAr: "قياس العلامات الحيوية (الضغط، النبض، الأكسجين)", icon: "Activity", result: "BP 155/95 mmHg, HR 98 bpm (irregular), RR 20, SpO2 96% on room air.", category: "Vitals" },\n      { name: "Auscultate Heart", nameAr: "استماع للقلب", icon: "Heart", result: "Quiet heart sounds, S4 gallop present, no murmurs rubs or gallops.", category: "Cardiovascular" },\n      { name: "Auscultate Lungs", nameAr: "استماع للرئتين", icon: "Stethoscope", result: "Clear to auscultation bilaterally, no crackles or wheezes.", category: "Respiratory" },\n      { name: "Examine Legs (Edema)", nameAr: "فحص الساقين (تورم)", icon: "Target", result: "No peripheral edema palpable bilaterally. Calves are soft and non-tender.", category: "Peripheral" },\n    ],`
  );
}

fs.writeFileSync('src/lib/osceStations.ts', osceStationsTs);
console.log('osceStations.ts updated');

// 2. Update route.ts
let routeTs = fs.readFileSync('src/app/api/osce/chat/route.ts', 'utf8');
routeTs = routeTs.replace(
  /"breakdown": \[\{"name": "<domain>", "earned": <int>, "max": <int>, "comments": "<specific>"\}\],/g,
  `"breakdown": [{"name": "<domain>", "earned": <int>, "max": <int>, "comments": "<specific>"}],\n  "checklist_eval": [{"item": "<exact item text>", "earned": <int>, "marks": <int>}],`
);
fs.writeFileSync('src/app/api/osce/chat/route.ts', routeTs);
console.log('route.ts updated');
