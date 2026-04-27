const fs = require('fs');
const content = fs.readFileSync('c:/Users/wwwha/Downloads/MEDPULSE_MASTER_PROMPT_2.md', 'utf8');

function extractFile(filename) {
    // Escape dots and dashes in the regex
    const fileBase = filename.replace(/\./g, '\\.');
    const regex = new RegExp(`### File [0-9]+\\.[0-9]+:.*${fileBase}.*\\n+\`\`\`typescript\\n([\\s\\S]*?)\\n\`\`\``);
    const match = content.match(regex);
    if (match) {
        fs.writeFileSync(`D:/medpuls/New folder/src/lib/services/medical-sources/sources/${filename}`, match[1]);
        console.log(`Created ${filename}`);
    } else {
        console.log(`Failed to extract ${filename}`);
    }
}

extractFile('pubmed.ts');
extractFile('openalex.ts');
extractFile('europepmc.ts');
extractFile('clinicaltrials.ts');
extractFile('statpearls.ts');
extractFile('rxnorm.ts');
extractFile('openfda.ts');

// Also extract test-sources.ts
const testMatch = content.match(/scripts\/test-sources\.ts[\s\S]*?\`\`\`typescript\n([\s\S]*?)\n\`\`\`/);
if (testMatch) {
    fs.mkdirSync('D:/medpuls/New folder/scripts', { recursive: true });
    fs.writeFileSync('D:/medpuls/New folder/scripts/test-sources.ts', testMatch[1]);
    console.log('Created test-sources.ts');
} else {
    console.log('Failed to extract test-sources.ts');
}
