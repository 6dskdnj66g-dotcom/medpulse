import { callGroq } from './groq-client';
import {
  MedicalSource,
  SynthesizedAnswer,
  Confidence,
} from '../medical-sources/types';

const SYSTEM_PROMPT = `أنت مساعد طبي تعليمي للطلاب العرب يستند للأدلة (Evidence-Based Medicine).

قواعد إجبارية لا تُكسر:
1. استخدم فقط المعلومات من المصادر المُعطاة. لا تخترع أو تضيف من معرفتك.
2. كل جملة طبية يجب أن تنتهي برقم مرجع [1] [2] إلخ يشير لرقم المصدر.
3. اكتب بالعربية الفصحى الطبية، مع المصطلح الإنجليزي بين قوسين.
   مثال: "الرجفان الأذيني (Atrial Fibrillation)"
4. صنّف المصادر في إجابتك بهذه الرموز:
   📘 Guidelines (الإرشادات السريرية)
   🔬 Research (الأبحاث الحديثة)
   💊 Drug Information (معلومات الأدوية)
   📖 Educational (مرجع تعليمي)
   🧪 Clinical Trials (التجارب السريرية)
5. إذا تضاربت المصادر، اذكر التضارب بوضوح.
6. هيكلة الإجابة:
   ### الملخص
   (سطران أو ثلاثة)

   ### التفاصيل
   (مع citations [1] [2])

   ### الخلاصة العملية
   (نقاط مختصرة)

   ### مستوى الدليل
   (Level of Evidence إن أمكن)

7. لا تعطِ نصيحة تشخيصية أو علاجية شخصية. أنت أداة تعليمية فقط.

تذكر: المستخدم طالب طب يتعلّم. علّمه كيف يقرأ الدليل، لا تعطه إجابة سطحية.`;

export async function synthesizeAnswer(
  question: string,
  sources: MedicalSource[]
): Promise<SynthesizedAnswer> {
  if (sources.length === 0) {
    return emptyResponse();
  }

  const sourcesBlock = buildSourcesBlock(sources);
  const userMessage = `السؤال: ${question}

المصادر المتاحة (${sources.length} مصدر):

${sourcesBlock}

اكتب إجابة شاملة تستخدم هذه المصادر فقط، مع citations مرقّمة [1] [2] إلخ.`;

  const response = await callGroq(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      maxTokens: 2000,
    }
  );

  const citedSources = detectCitedSources(response.content, sources);

  return {
    answer: response.content,
    sources: citedSources.length > 0 ? citedSources : sources,
    disclaimer: getDisclaimer(),
    confidence: assessConfidence(citedSources),
    cached: false,
    cost: response.cost,
  };
}

function buildSourcesBlock(sources: MedicalSource[]): string {
  const groupedByCategory: Record<string, MedicalSource[]> = {};
  for (const s of sources) {
    if (!groupedByCategory[s.category]) groupedByCategory[s.category] = [];
    groupedByCategory[s.category].push(s);
  }

  const indexMap = new Map(sources.map((s, i) => [s, i + 1]));
  const categoryEmoji: Record<string, string> = {
    guideline: '📘',
    research: '🔬',
    drug: '💊',
    educational: '📖',
    clinical_trial: '🧪',
    epidemiology: '🌍',
  };

  const sections: string[] = [];
  for (const [category, items] of Object.entries(groupedByCategory)) {
    const emoji = categoryEmoji[category] || '📄';
    const header = `\n${emoji} ${category.toUpperCase()}:\n`;

    const formattedItems = items.map((s) => {
      const idx = indexMap.get(s);
      const abstract = (s.abstract || 'لا يوجد ملخص').substring(0, 800);
      const truncated = (s.abstract?.length || 0) > 800 ? '...' : '';

      return `[${idx}] ${s.title}
نوع الدراسة: ${s.studyType} | السنة: ${s.year} | الجودة: ${s.qualityScore?.toFixed(1) || 'N/A'}/10
المجلة: ${s.journal || 'N/A'}
الملخص: ${abstract}${truncated}
الرابط: ${s.url}
${s.doi ? `DOI: ${s.doi}` : ''}`;
    });

    sections.push(header + formattedItems.join('\n\n'));
  }

  return sections.join('\n');
}

function detectCitedSources(
  answer: string,
  allSources: MedicalSource[]
): MedicalSource[] {
  const citedIndices = new Set<number>();
  for (const m of answer.matchAll(/\[(\d+)\]/g)) {
    const idx = parseInt(m[1]) - 1;
    if (idx >= 0 && idx < allSources.length) {
      citedIndices.add(idx);
    }
  }
  return allSources.filter((_, i) => citedIndices.has(i));
}

function emptyResponse(): SynthesizedAnswer {
  return {
    answer:
      'لم أجد مصادر طبية موثوقة تجيب على هذا السؤال. حاول إعادة صياغته بمصطلحات إنجليزية أكثر تحديداً.',
    sources: [],
    disclaimer: getDisclaimer(),
    confidence: 'low',
    cached: false,
    cost: 0,
  };
}

function getDisclaimer(): string {
  return 'هذه المعلومات لأغراض تعليمية فقط، وليست بديلاً عن الاستشارة الطبية المتخصصة. تحقق دائماً من المصادر الأصلية.';
}

function assessConfidence(cited: MedicalSource[]): Confidence {
  if (cited.length === 0) return 'low';
  const avgScore =
    cited.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / cited.length;
  if (avgScore >= 7.5) return 'high';
  if (avgScore >= 5.5) return 'medium';
  return 'low';
}