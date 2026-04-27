const fs = require('fs');
const filepath = 'D:/medpuls/New folder/src/lib/services/ai/query-classifier.ts';
let content = fs.readFileSync(filepath, 'utf8');
if (!content.startsWith('/* eslint-disable @typescript-eslint/no-explicit-any */')) {
    content = '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + content;
    fs.writeFileSync(filepath, content);
}
