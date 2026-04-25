// Medical response safety validation layer

const HIGH_RISK_KEYWORDS = [
  "dose", "dosage", "mg/kg", "mg/day", "mcg/kg",
  "contraindication", "lethal", "overdose", "toxic dose",
];

const CITATION_PATTERN = /\[(WHO|CDC|ACC|AHA|ESC|NICE|NEJM|BMJ|Lancet|UpToDate|KDIGO|AAN|ACOG|EMHJ|Saudi Med J)\b/i;

export function addDisclaimer(response: string, language: "ar" | "en"): string {
  const already = response.includes("⚕️");
  if (already) return response;
  const disclaimer =
    language === "ar"
      ? "\n\n---\n⚕️ **تنبيه طبي:** هذه معلومات تعليمية فقط. لا تُغني عن استشارة طبيب مرخص أو التشخيص أو العلاج."
      : "\n\n---\n⚕️ **Medical Disclaimer:** Educational information only. Not a substitute for consultation with a licensed physician.";
  return response + disclaimer;
}

export function validateMedicalResponse(response: string): string {
  const hasHighRisk = HIGH_RISK_KEYWORDS.some((kw) =>
    response.toLowerCase().includes(kw)
  );
  const hasCitation = CITATION_PATTERN.test(response);

  if (hasHighRisk && !hasCitation) {
    return (
      response +
      "\n\n⚠️ This response involves dosing or contraindication information. Verify with a primary clinical reference (BNF, Micromedex, UpToDate) before clinical use."
    );
  }
  return response;
}

export function detectEmergency(text: string): boolean {
  const emergencyPatterns = [
    /chest pain/i,
    /ألم في الصدر/,
    /stroke|CVA|brain attack/i,
    /سكتة دماغية/,
    /anaphylaxis|anaphylactic/i,
    /تأق|صدمة تأقية/,
    /cardiac arrest/i,
    /توقف القلب/,
    /suicide|self.harm/i,
    /انتحار|إيذاء الذات/,
  ];
  return emergencyPatterns.some((p) => p.test(text));
}

export function getEmergencyWarning(language: "ar" | "en"): string {
  return language === "ar"
    ? "⚠️ **تحذير:** إذا كانت هذه حالة طارئة حقيقية، اتصل بالإسعاف فوراً: 997 (السعودية) · 999 (الإمارات) · 911 (أمريكا).\n\n"
    : "⚠️ **Warning:** If this is a real emergency, call emergency services immediately: 911 (USA) · 999 (UAE) · 997 (Saudi Arabia).\n\n";
}
