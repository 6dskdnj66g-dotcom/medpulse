const fs = require('fs');

function updateFile(filePath, wrapperRegex, wrapperReplacement) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace premium-card with medpulse-card glass level-1
    content = content.replace(/className="premium-card (.*?)"/g, 'className="medpulse-card glass level-1 $1"');
    content = content.replace(/className="premium-card"/g, 'className="medpulse-card glass level-1"');

    // Apply specific wrapper replacement if provided
    if (wrapperRegex && wrapperReplacement) {
      content = content.replace(wrapperRegex, wrapperReplacement);
    }

    // Common colors
    content = content.replace(/text-slate-900 dark:text-white/g, 'text-[var(--text-primary)]');
    content = content.replace(/text-slate-800 dark:text-white/g, 'text-[var(--text-primary)]');
    content = content.replace(/text-slate-500/g, 'text-[var(--text-tertiary)]');
    content = content.replace(/text-slate-400/g, 'text-[var(--text-tertiary)]/70');
    content = content.replace(/text-slate-700 dark:text-slate-200/g, 'text-[var(--text-primary)]');
    content = content.replace(/text-slate-700/g, 'text-[var(--text-secondary)]');
    content = content.replace(/text-slate-800/g, 'text-[var(--text-secondary)]');

    // Backgrounds and borders
    content = content.replace(/border-slate-200 dark:border-slate-700/g, 'border-[var(--border-subtle)]');
    content = content.replace(/border-slate-100 dark:border-slate-800/g, 'border-[var(--border-subtle)]');
    content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-[var(--bg-0)]');
    content = content.replace(/bg-slate-50 dark:bg-slate-800\/50/g, 'bg-[var(--bg-1)] bg-opacity-50');
    content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-800/g, 'hover:bg-[var(--bg-2)] hover:border-[var(--color-medical-indigo)]/30 border border-transparent');
    content = content.replace(/bg-slate-50 dark:bg-slate-900\/50/g, 'bg-[var(--bg-1)]');
    content = content.replace(/bg-slate-50 dark:bg-slate-900/g, 'bg-[var(--bg-1)]');
    content = content.replace(/bg-slate-100 dark:bg-slate-800/g, 'bg-[var(--bg-2)]');
    content = content.replace(/bg-slate-200 dark:bg-slate-700/g, 'bg-[var(--bg-2)]');
    content = content.replace(/bg-slate-200 dark:bg-slate-800/g, 'bg-[var(--bg-2)] border border-[var(--border-subtle)]');
    content = content.replace(/text-slate-600 dark:text-slate-300/g, 'text-[var(--text-secondary)]');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } catch (e) {
    console.error(`Error updating ${filePath}:`, e);
  }
}

// 1. Landing Page
updateFile(
  'src/app/page.tsx', 
  /className="relative min-h-\[90vh\] flex items-center overflow-hidden"/g, 
  `className="relative min-h-[90vh] flex items-center overflow-hidden animate-in fade-in duration-1000"`
);

// 2. Encyclopedia
updateFile(
  'src/app/encyclopedia/page.tsx',
  /className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 relative"/g,
  `className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in zoom-in-95 duration-700 relative"`
);

// 3. MDT
updateFile(
  'src/app/mdt/page.tsx',
  /className="p-4 md:p-8 max-w-\[1600px\] mx-auto w-full h-full md:h-\[calc\(100vh-100px\)\] flex flex-col space-y-6 md:space-y-8 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 perspective-1000"/g,
  `className="p-4 md:p-8 max-w-[1600px] mx-auto w-full h-[calc(100vh-2rem)] md:h-[calc(100vh-100px)] flex flex-col space-y-6 md:space-y-8 overflow-hidden animate-in fade-in zoom-in-95 duration-700 perspective-1000"`
);

// 4. Summarizer
updateFile('src/app/summarizer/page.tsx', null, null);

// 5. Simulator
updateFile('src/app/simulator/page.tsx', null, null);

// 6. ECG
updateFile('src/app/ecg/page.tsx', null, null);

// 7. Drug Checker
updateFile('src/app/drug-checker/page.tsx', null, null);

// 8. Calculators
updateFile('src/app/calculators/page.tsx', null, null);

// 9. Admin
updateFile('src/app/admin/page.tsx', null, null);

// 10. Professors
updateFile('src/app/professors/page.tsx', null, null);

// 11. Auth
updateFile('src/app/auth/login/page.tsx', null, null);
updateFile('src/app/auth/register/page.tsx', null, null);