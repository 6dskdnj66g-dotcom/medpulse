const fs = require('fs');

let fileContent = fs.readFileSync('src/lib/osceStations.ts', 'utf8');

// Add physicalExamFindings?: Record<string, string>; to PatientPersona interface
if (!fileContent.includes('physicalExamFindings?: Record<string, string>')) {
  fileContent = fileContent.replace(
    'physicalFindings: string;',
    'physicalFindings: string;\n  physicalExamFindings?: Record<string, string>;'
  );
}

// Add strictChecklist?: { task: string, points: number }[]; to OSCEStation interface
if (!fileContent.includes('strictChecklist?: { task: string, points: number }[]')) {
  fileContent = fileContent.replace(
    'tags: string[];',
    'tags: string[];\n  strictChecklist?: { task: string; points: number; category: string; }[];'
  );
}

// Now let's find each station and add a strictChecklist generated from markingScheme, and basic physicalExamFindings.
// Since parsing TS is hard with regex, we can compile it with ts-node or just use regex replacement carefully.

const stationRegex = /markingScheme:\s*{\s*totalMarks:\s*(\d+),\s*passThreshold:\s*(\d+),\s*domains:\s*\[([\s\S]*?)],\s*modelAnswer/g;

fileContent = fileContent.replace(stationRegex, (match, totalMarks, passThreshold, domainsContent) => {
  // We can try to extract domains and criteria
  const criteria = [];
  const domainRegex = /name:\s*"([^"]+)"[\s\S]*?criteria:\s*\[([\s\S]*?)]/g;
  let domainMatch;
  while ((domainMatch = domainRegex.exec(domainsContent)) !== null) {
    const domainName = domainMatch[1];
    const criteriaContent = domainMatch[2];
    const itemRegex = /{[\s]*item:\s*"([^"]+)",[\s]*marks:\s*(\d+),[\s]*category:\s*"([^"]+)"[\s]*}/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(criteriaContent)) !== null) {
      criteria.push({
        task: itemMatch[1],
        points: parseInt(itemMatch[2]),
        category: itemMatch[3]
      });
    }
  }

  // Compile replacement string
  const checklistString = `strictChecklist: [\n    ` + criteria.map(c => `{ task: ${JSON.stringify(c.task)}, points: ${c.points}, category: ${JSON.stringify(c.category)} }`).join(',\n    ') + `\n  ],\n  ` + match;

  return checklistString;
});

// We also want to inject physicalExamFindings into patientPersona.
// Just insert it after physicalFindings variable.
const physicalFindingsRegex = /physicalFindings:\s*"([^"]*)"(?!,\s*physicalExamFindings)/g;
fileContent = fileContent.replace(physicalFindingsRegex, (match, text) => {
    // Generate some mock findings based on the text just for the demo.
    return match + `,\n      physicalExamFindings: {\n        "Vitals (BP, HR, RR, Temp)": ${JSON.stringify("BP 120/80, HR 78, RR 16, Temp 37.1C")},\n        "Cardiovascular": ${JSON.stringify("S1, S2 audible, no murmurs")},\n        "Respiratory": ${JSON.stringify("Clear to auscultation bilaterally")},\n        "Abdomen": ${JSON.stringify("Soft, non-tender, no organomegaly")}\n      }`;
});

fs.writeFileSync('src/lib/osceStations.ts', fileContent);
console.log("Patched osceStations.ts successfully.");