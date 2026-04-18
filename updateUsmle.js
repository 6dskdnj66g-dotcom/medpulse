const fs = require('fs');
let content = fs.readFileSync('src/app/usmle/page.tsx', 'utf8');

// Replace standard page-transition wrappers with Apple-tier variants
content = content.replace(
  /<div className="max-w-4xl mx-auto p-6 md:p-10 w-full page-transition">/g, 
  `<div className="max-w-5xl mx-auto p-4 md:p-10 w-full animate-in fade-in zoom-in-95 duration-700 relative">
      {/* Ambient background glows */}
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[40%] h-[40%] bg-[var(--color-vital-cyan)]/5 rounded-full blur-[150px] pointer-events-none" />`
);

content = content.replace(
  /<div className="max-w-2xl mx-auto p-6 md:p-10 w-full page-transition text-center">/g, 
  `<div className="max-w-3xl mx-auto p-4 md:p-10 w-full animate-in fade-in zoom-in-95 duration-700 relative text-center">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[150px] pointer-events-none" />`
);

content = content.replace(
  /className="premium-card p-8 text-center group hover:border-indigo-500\/50 transition-all"/g,
  `className="medpulse-card glass level-1 p-8 text-center group hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-500"`
);

content = content.replace(
  /className="premium-card p-8 text-center group hover:border-teal-500\/50 transition-all"/g,
  `className="medpulse-card glass level-1 p-8 text-center group hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] hover:-translate-y-1 transition-all duration-500"`
);

content = content.replace(
  /className="premium-card p-8 text-center group hover:border-rose-500\/50 transition-all"/g,
  `className="medpulse-card glass level-1 p-8 text-center group hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] hover:-translate-y-1 transition-all duration-500"`
);

content = content.replace(/className="premium-card (.*?)"/g, 'className="medpulse-card glass level-1 $1"');
content = content.replace(/className="premium-card"/g, 'className="medpulse-card glass level-1"');

// Fix text colors
content = content.replace(/text-slate-900 dark:text-white/g, 'text-[var(--text-primary)]');
content = content.replace(/text-slate-500/g, 'text-[var(--text-tertiary)]');
content = content.replace(/text-slate-400/g, 'text-[var(--text-tertiary)]/70');
content = content.replace(/text-slate-700 dark:text-slate-200/g, 'text-[var(--text-primary)]');
content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-[var(--text-secondary)]');

content = content.replace(/border-slate-200 dark:border-slate-700/g, 'border-[var(--border-subtle)]');
content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-[var(--bg-0)]');
content = content.replace(/bg-slate-200 dark:bg-slate-800/g, 'bg-[var(--bg-2)]');
content = content.replace(/bg-slate-100 dark:bg-slate-800/g, 'bg-[var(--bg-2)]');

fs.writeFileSync('src/app/usmle/page.tsx', content, 'utf8');
console.log('USMLE Updated');