const fs = require('fs');

let pageTsx = fs.readFileSync('src/app/simulator/[stationId]/page.tsx', 'utf8');

// 1. Add interactiveExams UI and system message
pageTsx = pageTsx.replace(
  /\{sending && \(/,
  `
            {/* Interactive Physical Exams */}
            {station.interactiveExams && (
              <div className="mx-auto max-w-lg my-6">
                <div className="bg-[var(--color-medical-indigo)]/5 border border-[var(--color-medical-indigo)]/20 p-4 rounded-2xl">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] mb-3 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    {isAr ? "الفحص السريري التفاعلي" : "Interactive Physical Exams"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {station.interactiveExams.map((exam, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const msg = {
                            role: "user" as const,
                            content: isAr ? \`[إجراء الطبيب للفحص: "\${exam.nameAr}"]\` : \`[SYSTEM: Student performed "\${exam.name}"]\`,
                            timestamp: Date.now()
                          };
                          // Add the artificial user command, then the immediate system response
                          const sysRes = {
                            role: "assistant" as const,
                            content: isAr ? \`[النتيجة السريرية الثابتة: \${exam.result}]\` : \`[CLINICAL FINDING: \${exam.result}]\`,
                            timestamp: Date.now() + 100
                          };
                          // Since we don't have direct access to setMessages here without modifying the component greatly, we can just send the command as the input if we wanted, but wait wait...
                          // Let's call the onSend with a specific string, or pass down setMessages.
                          // Actually, we can just add a property to the input temporarily:
                          setInput(isAr ? \`[نظام الفحص]: قمت بـ "\${exam.nameAr}". ما هي النتيجة؟\` : \`[EXAM]: I am performing "\${exam.name}". What is the finding?\`);
                          // Then immediately send it:
                          setTimeout(() => onSend(), 100);
                        }}
                        className="bg-[var(--bg-2)] hover:bg-[var(--color-medical-indigo)]/10 border border-[var(--border-subtle)] hover:border-[var(--color-medical-indigo)]/30 rounded-xl p-3 text-left transition-all group flex items-start gap-3"
                      >
                         <div className="bg-[var(--color-medical-indigo)]/10 text-[var(--color-medical-indigo)] p-2 rounded-lg group-hover:scale-110 transition-transform">
                             <Target className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-0.5">{exam.category}</p>
                            <p className="text-[12px] font-bold text-[var(--text-primary)]">{isAr && exam.nameAr ? exam.nameAr : exam.name}</p>
                         </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

  {sending && (`
);

// 2. Add local storage tracking internally in the ResultsPhase
pageTsx = pageTsx.replace(
  /export default function SimulatorPage\(\) \{/,
  `export default function SimulatorPage() {
  const saveResultLocal = useCallback((scoreTotal: number, maxScore: number, passFail: string, stationId: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('osce_history') || '[]');
      history.push({ stationId, score: scoreTotal, maxScore, passFail, date: new Date().toISOString() });
      localStorage.setItem('osce_history', JSON.stringify(history));
    } catch(e) {}
  }, []);`
);

// 3. Make ResultsPhase call the new hook, and show checklist
pageTsx = pageTsx.replace(
  /function ResultsPhase\(\{\n  station,\n  messages,\n  isAr\n\}: \{/g,
  `function ResultsPhase({
  station,
  messages,
  isAr,
  onSave
}: {`
);

pageTsx = pageTsx.replace(
  /const \[result, setResult\] = useState<ExaminerResult \| null>\(null\);/g,
  `const [result, setResult] = useState<(ExaminerResult & {checklist_eval?: {item: string, earned: number, marks: number}[]}) | null>(null);`
);

pageTsx = pageTsx.replace(
  /setResult\(data\);/g,
  `setResult(data);\n          onSave?.(data.total_score, data.max_score, data.pass_fail, station.id);`
);

pageTsx = pageTsx.replace(
  /\{result\.breakdown\.map\(\(bd, i\) => \(/g,
  `
            {/* Strict Checklist */}
            {result.checklist_eval && result.checklist_eval.length > 0 && (
              <div className="bg-[var(--bg-2)] border border-[var(--border-subtle)] rounded-2xl p-5 md:p-6 mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                  {isAr ? "القائمة المرجعية الصارمة (Checklist)" : "Strict AI Examiner Checklist"}
                </h3>
                <div className="space-y-3">
                  {result.checklist_eval.map((chk, idx) => (
                    <div key={idx} className={\`flex items-start gap-3 p-3 rounded-xl border \${chk.earned > 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}\`}>
                       {chk.earned > 0 ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-500 mt-0.5" />}
                       <div className="flex-1">
                          <p className="text-[13px] font-bold text-[var(--text-primary)]">{chk.item}</p>
                       </div>
                       <div className="bg-[var(--bg-0)] px-2 py-1 rounded-md text-[11px] font-black border border-[var(--border-subtle)] text-[var(--text-tertiary)]">
                          {chk.earned} / {chk.marks}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {result.breakdown.map((bd, i) => (`
);

// 4. Update the return to pass onSave
pageTsx = pageTsx.replace(
  /<ResultsPhase\n          station=\{station\}\n          messages=\{messages\}\n          isAr=\{isAr\}\n        \/>/g,
  `<ResultsPhase
          station={station}
          messages={messages}
          isAr={isAr}
          onSave={saveResultLocal}
        />`
);

// Add the onSave prop type to the component definition at the top if necessary
pageTsx = pageTsx.replace(
  /isAr: boolean;/g,
  `isAr: boolean;\n  onSave?: (score: number, max: number, pf: string, id: string) => void;`
);

fs.writeFileSync('src/app/simulator/[stationId]/page.tsx', pageTsx);
console.log('page.tsx updated');
