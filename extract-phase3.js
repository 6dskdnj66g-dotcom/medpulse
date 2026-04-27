const fs = require('fs');
const content = fs.readFileSync('c:/Users/wwwha/Downloads/MEDPULSE_MASTER_PROMPT_2.md', 'utf8');

function extractFile(filename) {
    const fileBase = filename.replace(/\./g, '\\.');
    const regex = new RegExp(`### File [0-9]+\\.[0-9]+:.*${fileBase}.*\\n+\`\`\`typescript\\n([\\s\\S]*?)\\n\`\`\``);
    const match = content.match(regex);
    if (match) {
        fs.writeFileSync(`D:/medpuls/New folder/src/lib/services/ai/${filename}`, match[1]);
        console.log(`Created ${filename}`);
    } else {
        console.log(`Failed to extract ${filename}`);
    }
}

extractFile('grok-client.ts');
extractFile('query-classifier.ts');
extractFile('medical-synthesizer.ts');
