import Groq from 'groq-sdk';
import { MedicalSource, SynthesizedAnswer } from './types';

const SYSTEM_PROMPT = `أنت مساعد طبي تعليمي للطلاب العرب يستند للأدلة (Evidence-Based).

قواعد إجبارية:
1. استخدم فقط المعلومات من المصادر المُعطاة. لا تخترع.
2. كل جملة طبية يجب أن تنتهي برقم مرجع [1] [2].
3. اكتب بالعربية الفصحى الطبية، مع المصطلح الإنجليزي بين قوسين.
4. صنّف المصادر في إجابتك:
   📘 Guidelines (الإرشادات السريرية)
   🔬 Research (الأبحاث الحديثة)
   💊 Drug Information (معلومات الأدوية)
   📖 Educational (مرجع تعليمي)
   🧪 Clinical Trials (التجارب السريرية)
5. إذا تضاربت المصادر، اذكر التضارب بوضوح.
6. هيكلة الإجابة:
   - ملخص (سطران)
   - التفاصيل (مع citations)
   - الخلاصة العملية
   - مستوى الدليل (Level of Evidence)

تذكر: المستخدم طالب طب يتعلّم. علّمه كيف يقرأ الدليل، ولا تعطه إجابة سطحية.`;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function synthesizeMultiSource(
  question: string,
  sources: MedicalSource[]
): Promise<SynthesizedAnswer> {
  if (sources.length === 0) {
    return emptyResponse();
  }

  const grouped = groupByCategory(sources);
  const sourcesBlock = buildSourcesBlock(sources, grouped);

  const userMessage = `السؤال: ${question}

المصادر المتاحة (${sources.length} مصدر، مصنّفة حسب النوع):

${sourcesBlock}

اكتب إجابة شاملة تستخدم هذه المصادر فقط، مع citations مرقّمة [1] [2] إلخ.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.1,
    max_tokens: 2000,
  });

  const answer = completion.choices[0]?.message?.content || '';
  const usage = completion.usage;

  // Groq llama-3.3-70b-versatile pricing: $0.05/M input, $0.08/M output
  const cost =
    ((usage?.prompt_tokens || 0) * 0.00000005) +
    ((usage?.completion_tokens || 0) * 0.00000008);

  const citedIndices = new Set<number>();
  for (const m of answer.matchAll(/\[(\d+)\]/g)) {
    const idx = parseInt(m[1]) - 1;
    if (idx >= 0 && idx < sources.length) citedIndices.add(idx);
  }

  const citedSources = sources.filter((_, i) => citedIndices.has(i));

  return {
    answer,
    sources: citedSources.length > 0 ? citedSources : sources,
    disclaimer: getDisclaimer(),
    confidence: assessConfidence(citedSources),
    cached: false,
    cost,
  };
}

function groupByCategory(sources: MedicalSource[]): Record<string, MedicalSource[]> {
  const grouped: Record<string, MedicalSource[]> = {};
  for (const source of sources) {
    if (!grouped[source.category]) grouped[source.category] = [];
    grouped[source.category].push(source);
  }
  return grouped;
}

function buildSourcesBlock(
  allSources: MedicalSource[],
  grouped: Record<string, MedicalSource[]>
): string {
  const categoryEmoji: Record<string, string> = {
    'guideline': '📘',
    'research': '🔬',
    'drug': '💊',
    'educational': '📖',
    'clinical_trial': '🧪',
    'epidemiology': '🌍',
  };

  const indexMap = new Map(allSources.map((s, i) => [s, i + 1]));
  const sections: string[] = [];

  for (const [category, sourcesInCategory] of Object.entries(grouped)) {
    const emoji = categoryEmoji[category] || '📄';
    const header = `\n${emoji} ${category.toUpperCase()}:\n`;

    const items = sourcesInCategory.map(s => {
      const idx = indexMap.get(s);
      const abstractText = s.abstract || 'لا يوجد';
      const truncated = abstractText.length > 600
        ? abstractText.substring(0, 600) + '...'
        : abstractText;

      return `[${idx}] ${s.title}
نوع الدراسة: ${s.studyType} | السنة: ${s.year} | الجودة: ${s.qualityScore?.toFixed(1)}/10
المجلة: ${s.journal || 'N/A'}
الملخص: ${truncated}
الرابط: ${s.url}
${s.doi ? `DOI: ${s.doi}` : ''}`;
    });

    sections.push(header + items.join('\n\n'));
  }

  return sections.join('\n');
}

function emptyResponse(): SynthesizedAnswer {
  return {
    answer: 'لم أجد مصادر طبية موثوقة تجيب على هذا السؤال. حاول إعادة صياغته بمصطلحات إنجليزية أكثر تحديداً.',
    sources: [],
    disclaimer: getDisclaimer(),
    confidence: 'low',
    cached: false,
    cost: 0,
  };
}

function getDisclaimer(): string {
  return 'هذه المعلومات لأغراض تعليمية فقط، وليست بديلاً عن الاستشارة الطبية. تحقق دائماً من المصادر الأصلية.';
}

function assessConfidence(cited: MedicalSource[]): 'high' | 'medium' | 'low' {
  if (cited.length === 0) return 'low';
  const avgScore = cited.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / cited.length;
  if (avgScore >= 7.5) return 'high';
  if (avgScore >= 5.5) return 'medium';
  return 'low';
}
