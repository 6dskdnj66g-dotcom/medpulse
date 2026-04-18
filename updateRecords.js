const fs = require('fs');

try {
  let content = fs.readFileSync('src/app/records/page.tsx', 'utf8');

  // Replace premium-card with medpulse-card glass level-1
  content = content.replace(/className="premium-card (.*?)"/g, 'className="medpulse-card glass level-1 $1"');
  content = content.replace(/className="premium-card"/g, 'className="medpulse-card glass level-1"');

  // Page wrapper
  content = content.replace(
    /<div className="max-w-7xl mx-auto p-6 md:p-10 w-full page-transition">/g, 
    `<div className="max-w-7xl mx-auto p-4 md:p-10 w-full animate-in fade-in zoom-in-95 duration-700 relative">
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[40%] h-[40%] bg-[var(--color-vital-cyan)]/5 rounded-full blur-[150px] pointer-events-none" />`
  );

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

  fs.writeFileSync('src/app/records/page.tsx', content, 'utf8');
  console.log('Records updated successfully');
} catch (e) {
  console.error("Error updating records:", e);
}