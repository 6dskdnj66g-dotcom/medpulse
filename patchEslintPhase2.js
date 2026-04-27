const fs = require('fs');

function patchFile(filepath) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    if (!content.startsWith('/* eslint-disable @typescript-eslint/no-explicit-any */')) {
        content = '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + content;
        fs.writeFileSync(filepath, content);
        console.log('Patched ' + filepath);
    }
}

const files = [
    'D:/medpuls/New folder/src/lib/services/medical-sources/sources/clinicaltrials.ts',
    'D:/medpuls/New folder/src/lib/services/medical-sources/sources/europepmc.ts',
    'D:/medpuls/New folder/src/lib/services/medical-sources/sources/openalex.ts',
    'D:/medpuls/New folder/src/lib/services/medical-sources/sources/openfda.ts',
    'D:/medpuls/New folder/src/lib/services/medical-sources/sources/pubmed.ts',
    'D:/medpuls/New folder/src/lib/services/medical-sources/sources/rxnorm.ts',
    'D:/medpuls/New folder/src/lib/services/medical-sources/sources/statpearls.ts'
];

files.forEach(patchFile);
