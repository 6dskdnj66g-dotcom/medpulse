import fs from 'fs';
const text = fs.readFileSync('src/lib/osceStations.ts', 'utf8');
const idMatch = text.match(/id:\s*['"]([^'"]+)['"]/);
console.log("Found station ID:", idMatch ? idMatch[1] : "None");