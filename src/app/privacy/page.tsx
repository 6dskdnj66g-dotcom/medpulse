"use client";

import { useLanguage } from "@/core/i18n/LanguageContext";
import { ShieldCheck, Lock, Eye, FileText, Database } from "lucide-react";

export default function PrivacyPolicyPage() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen py-16 animate-in fade-in duration-700" dir={dir}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 border-b border-[var(--border-subtle)] pb-8 text-center sm:text-left">
          <div className="w-16 h-16 bg-emerald-500/10 flex items-center justify-center rounded-2xl border border-emerald-500/20 mb-6 mx-auto sm:mx-0">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4">
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p className="text-[var(--text-secondary)] font-medium text-lg">
            {isAr ? "نحن نأخذ أمان بياناتك الطبية وحمايتها بجدية تامة. آخر تحديث: أبريل 2026." : "Your medical data security is our top priority. Last updated: April 2026."}
          </p>
        </div>

        <div className="space-y-12 pb-24 text-[var(--text-primary)] leading-relaxed">
          {/* Section 1 */}
          <section className="medpulse-card glass level-1 p-8 rounded-3xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold">{isAr ? "1. حماية البيانات وفرض السرية (HIPAA & GDPR)" : "1. Data Protection (HIPAA & GDPR)"}</h2>
            </div>
            <p className="text-[var(--text-secondary)] font-medium">
              {isAr 
                ? "يتم تشفير جميع المعلومات المدخلة في منصة MedPulse باستخدام بروتوكولات تشفير من الفئة العسكرية (AES-256). نحن نلتزم باللوائح الصارمة للخصوصية مثل HIPAA لضمان عدم مشاركة أي بيانات تشخيصية سريرية تقوم بالتدرب عليها بشكل يكشف الهوية." 
                : "All information entered into MedPulse is securely encrypted using military-grade AES-256 protocols. We adhere to strict HIPAA and GDPR guidelines to ensure that your clinical training data and personal identifiers are never compromised."}
            </p>
          </section>

          {/* Section 2 */}
          <section className="medpulse-card glass level-1 p-8 rounded-3xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold">{isAr ? "2. ما هي البيانات التي نجمعها؟" : "2. Information We Collect"}</h2>
            </div>
            <p className="text-[var(--text-secondary)] font-medium mb-4">
              {isAr ? "نجمع فقط ما هو ضروري لتحسين تجربتك التعليمية:" : "We collect only what is strictly necessary to enhance your learning experience:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] font-medium mr-4 ml-4">
              <li>{isAr ? "معلومات الحساب الأساسية (الاسم، البريد الإلكتروني، النطاق الطبي)." : "Basic account details (Name, Email, Medical level)."}</li>
              <li>{isAr ? "بيانات التقدم الدراسي (نتائج محاكاة OSCE واختبارات USMLE) لمساعدتك في التحليلات." : "Academic progress (OSCE simulator scores, USMLE metrics) to power your analytics."}</li>
              <li>{isAr ? "لا نقوم نهائياً بتسجيل أو تخزين أي بيانات واقعية لمرضى حقيقيين قد تقوم بإدخالها للتلخيص." : "We NEVER store or track real patient PHI (Protected Health Information) you might enter into the Summarizer."}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="medpulse-card glass level-1 p-8 rounded-3xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold">{isAr ? "3. مشاركة بياناتك (عدم البيع لطرف ثالث)" : "3. Third-party Tracking"}</h2>
            </div>
            <p className="text-[var(--text-secondary)] font-medium">
              {isAr 
                ? "نحن نرفض بشكل قاطع مبدأ بيع بيانات الطلاب الطبية أو الملفات أو سجلات التصفح لأي شركات تسويقية أو جهات خارجية. البيانات التي ندخلها لمخدم النموذج اللُغوي (LLM) تكون مجهولة المصدر (Anonymized) تماماً." 
                : "We do not sell, rent, or trade your medical learning data to third-party marketers. Data sent to our Language Models (LLMs) for summarization and logic processing is strictly anonymized."}
            </p>
          </section>

          {/* Section 4 */}
          <section className="medpulse-card glass level-1 p-8 rounded-3xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold">{isAr ? "4. إخلاء المسؤولية الطبية" : "4. Medical Disclaimer"}</h2>
            </div>
            <p className="text-[var(--text-secondary)] font-medium">
              {isAr 
                ? "كما هو موضح دائمًا، منصة MedPulse هي أداة مساعدة للتعلم والتدريب السريري، ولا تحل محل الرأي الطبي الاحترافي المعتمد من قبل طبيب بشري مرخص." 
                : "As stated permanently in our footers, MedPulse is an educational and clinical training tool, NOT a replacement for certified human medical diagnostics or treatment."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}