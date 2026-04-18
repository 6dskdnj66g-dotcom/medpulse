const fs = require('fs');

try {
  let content = fs.readFileSync('src/app/notes/page.tsx', 'utf8');

  // Replace premium-card with medpulse-card glass level-1
  content = content.replace(/className="premium-card (.*?)"/g, 'className="medpulse-card glass level-1 $1"');
  content = content.replace(/className="premium-card"/g, 'className="medpulse-card glass level-1"');

  // Page wrapper
  content = content.replace(
    /<div className="max-w-7xl mx-auto p-4 md:p-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">/g, 
    `<div className="max-w-7xl mx-auto p-4 md:p-10 w-full animate-in fade-in zoom-in-95 duration-700 relative">
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[40%] h-[40%] bg-[var(--color-vital-cyan)]/5 rounded-full blur-[150px] pointer-events-none" />`
  );

  content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-[var(--bg-0)]');
  content = content.replace(/bg-slate-50 dark:bg-slate-800\/50/g, 'bg-[var(--bg-1)] bg-opacity-50');
  content = content.replace(/bg-slate-50 dark:bg-slate-900\/50/g, 'bg-[var(--bg-1)]');
  content = content.replace(/bg-slate-50 dark:bg-slate-900/g, 'bg-[var(--bg-1)]');
  content = content.replace(/bg-slate-100 dark:bg-slate-800/g, 'bg-[var(--bg-2)]');
  content = content.replace(/bg-slate-200 dark:bg-slate-700/g, 'bg-[var(--bg-2)]');
  content = content.replace(/bg-slate-200 dark:bg-slate-800/g, 'bg-[var(--bg-2)] border border-[var(--border-subtle)]');

  fs.writeFileSync('src/app/notes/page.tsx', content, 'utf8');
  console.log('Notes updated successfully');
} catch (e) {
  console.error("Error updating notes:", e);
}