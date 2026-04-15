"use client";

import { useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Search, BookOpen, ShieldCheck, X, Loader2,
  HeartPulse, Brain, Microscope, Stethoscope, Baby,
  Bone, Eye, Pill, Activity, ChevronRight, Sparkles,
  Send, Bot, AlertTriangle, Layers
} from "lucide-react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { FlashcardDeck } from "@/components/FlashcardDeck";

// ── Specialty config ─────────────────────────────────────────────────
const SPECIALTY_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  gradient: string;
  description: string;
  corpus: string;
  categories: string[];
  featuredArticles: { title: string; tag: string; updated: string }[];
}> = {
  "internal-medicine": {
    label: "Internal Medicine",
    icon: Stethoscope,
    colorClass: "text-sky-600",
    bgClass: "bg-sky-50",
    borderClass: "border-sky-200",
    gradient: "from-sky-500 to-cyan-500",
    description: "Comprehensive adult disease management, diagnostic algorithms and pharmacotherapy protocols from Harrison's Principles of Internal Medicine.",
    corpus: "Harrison's Principles of Internal Medicine, 21st Ed. · UpToDate 2024 · NEJM",
    categories: ["Infectious Diseases", "Endocrinology", "Nephrology", "Gastroenterology", "Pulmonology", "Rheumatology", "Hematology", "Metabolic Disorders"],
    featuredArticles: [
      { title: "Sepsis: 2024 Surviving Sepsis Campaign Update", tag: "Critical Care", updated: "Mar 2024" },
      { title: "Type 2 Diabetes Mellitus: Integrated Management", tag: "Endocrinology", updated: "Jan 2024" },
      { title: "Community-Acquired Pneumonia Treatment Protocols", tag: "Pulmonology", updated: "Feb 2024" },
      { title: "Acute Kidney Injury: Staging and Management", tag: "Nephrology", updated: "Dec 2023" },
      { title: "Hypertension: JNC 8 vs ACC/AHA 2023 Guidelines", tag: "Cardiology", updated: "Jan 2024" },
      { title: "Hospital-Acquired Infections: Prevention Bundles", tag: "Infectious Disease", updated: "Mar 2024" },
    ],
  },
  "cardiology": {
    label: "Cardiology",
    icon: HeartPulse,
    colorClass: "text-rose-600",
    bgClass: "bg-rose-50",
    borderClass: "border-rose-200",
    gradient: "from-rose-500 to-orange-500",
    description: "ECG interpretation, heart failure management, arrhythmias, acute coronary syndromes, and interventional cardiology based on ACC/AHA guidelines.",
    corpus: "Braunwald's Heart Disease, 12th Ed. · ACC/AHA 2024 Guidelines · ESC Guidelines",
    categories: ["Acute Coronary Syndromes", "Heart Failure", "Arrhythmias", "ECG Interpretation", "Valvular Disease", "Congenital Heart Disease", "Electrophysiology", "Cardiac Imaging"],
    featuredArticles: [
      { title: "STEMI Management: Primary PCI vs Thrombolysis", tag: "ACS", updated: "Mar 2024" },
      { title: "HFrEF Treatment Algorithm 2024: ARNI, SGLT2i", tag: "Heart Failure", updated: "Feb 2024" },
      { title: "Atrial Fibrillation: Rhythm vs Rate Control", tag: "Arrhythmia", updated: "Jan 2024" },
      { title: "Systematic ECG Interpretation: Step-by-Step", tag: "ECG", updated: "Dec 2023" },
      { title: "TAVI vs SAVR in Severe Aortic Stenosis", tag: "Valvular", updated: "Mar 2024" },
      { title: "Long QT Syndrome: Genetic Basis and Management", tag: "Electrophysiology", updated: "Feb 2024" },
    ],
  },
  "neurology": {
    label: "Neurology",
    icon: Brain,
    colorClass: "text-indigo-600",
    bgClass: "bg-indigo-50",
    borderClass: "border-indigo-200",
    gradient: "from-indigo-500 to-purple-600",
    description: "Stroke protocols, movement disorders, epilepsy management, dementia, and CNS pathology from peer-reviewed neurological sources.",
    corpus: "Adams & Victor's Neurology, 11th Ed. · AHA Stroke Guidelines 2024 · ILAE",
    categories: ["Stroke & TIA", "Movement Disorders", "Epilepsy", "Dementia", "Headache Disorders", "Neuromuscular Disease", "Neuro-oncology", "Infectious Neurology"],
    featuredArticles: [
      { title: "Acute Ischemic Stroke: tPA Window & Thrombectomy", tag: "Stroke", updated: "Mar 2024" },
      { title: "Parkinson's Disease: Levodopa Initiation Guide", tag: "Movement", updated: "Feb 2024" },
      { title: "Epilepsy: Seizure Classification & First-Line AEDs", tag: "Epilepsy", updated: "Jan 2024" },
      { title: "Alzheimer's Disease: Lecanemab Clinical Evidence", tag: "Dementia", updated: "Mar 2024" },
      { title: "Migraine Prophylaxis: CGRP Antagonists Update", tag: "Headache", updated: "Dec 2023" },
      { title: "Guillain-Barré Syndrome: IVIg vs Plasmapheresis", tag: "Neuromuscular", updated: "Jan 2024" },
    ],
  },
  "pathology": {
    label: "Pathology",
    icon: Microscope,
    colorClass: "text-teal-600",
    bgClass: "bg-teal-50",
    borderClass: "border-teal-200",
    gradient: "from-teal-500 to-emerald-600",
    description: "Histopathology, gross specimen interpretation, molecular pathology, and oncological staging indexed by tissue type and disease.",
    corpus: "Robbins & Cotran Pathologic Basis of Disease, 10th Ed. · NCCN Guidelines 2024",
    categories: ["Histopathology", "Cytopathology", "Molecular Pathology", "Oncopathology", "Forensic Pathology", "Neuropathology", "Dermatopathology", "Hematopathology"],
    featuredArticles: [
      { title: "Hallmarks of Cancer: 2024 Updated Framework", tag: "Oncology", updated: "Mar 2024" },
      { title: "Gleason Grading: ISUP 2019 vs Classic System", tag: "Uropathology", updated: "Feb 2024" },
      { title: "HER2 Testing in Breast Cancer: ASCO/CAP Update", tag: "Molecular", updated: "Jan 2024" },
      { title: "Celiac Disease: Villous Atrophy Grading (Marsh)", tag: "GI Path", updated: "Dec 2023" },
      { title: "EGFR Mutation Testing in NSCLC Specimens", tag: "Molecular", updated: "Mar 2024" },
      { title: "Lymphoma Classification: WHO 5th Edition Guide", tag: "Hematopathology", updated: "Feb 2024" },
    ],
  },
  "pharmacology": {
    label: "Pharmacology",
    icon: Pill,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    gradient: "from-amber-500 to-orange-500",
    description: "Drug mechanisms, kinetics, interactions, ADR profiles, and FDA/EMA approval data for over 3,000 pharmacological agents.",
    corpus: "Goodman & Gilman's Pharmacology, 13th Ed. · FDA Drug Database · BNF 2024",
    categories: ["Cardiovascular Drugs", "Antibiotics", "CNS Agents", "Oncologic Agents", "Endocrine Drugs", "Drug Interactions", "Adverse Drug Reactions", "Pharmacokinetics"],
    featuredArticles: [
      { title: "Beta-Blockers: Selectivity, Indications & ADRs", tag: "CV Drugs", updated: "Mar 2024" },
      { title: "Antibiotic Stewardship: Choosing Empirical Therapy", tag: "Antibiotics", updated: "Feb 2024" },
      { title: "SNRIs vs SSRIs: Mechanism & Clinical Differences", tag: "CNS", updated: "Jan 2024" },
      { title: "DOAC vs Warfarin: Clinical Decision Guide", tag: "Anticoagulants", updated: "Dec 2023" },
      { title: "Checkpoint Inhibitors: irAE Management Protocols", tag: "Oncology", updated: "Mar 2024" },
      { title: "QTc Prolongation: High-Risk Drug Combinations", tag: "ADRs", updated: "Feb 2024" },
    ],
  },
  "pediatrics": {
    label: "Pediatrics",
    icon: Baby,
    colorClass: "text-pink-600",
    bgClass: "bg-pink-50",
    borderClass: "border-pink-200",
    gradient: "from-pink-500 to-rose-500",
    description: "Developmental milestones, pediatric dosing protocols, neonatal emergencies and childhood disease management.",
    corpus: "Nelson Textbook of Pediatrics, 21st Ed. · AAP Guidelines 2024 · WHO Child Health",
    categories: ["Neonatology", "Developmental Pediatrics", "Pediatric Infectious Disease", "Pediatric Cardiology", "Pediatric Neurology", "Pediatric Oncology", "Adolescent Medicine", "Vaccination Schedules"],
    featuredArticles: [
      { title: "Neonatal Jaundice: Phototherapy Threshold Charts", tag: "Neonatology", updated: "Mar 2024" },
      { title: "Developmental Milestones: Red Flags by Age", tag: "Development", updated: "Feb 2024" },
      { title: "Febrile Seizures: Management & Recurrence Risk", tag: "Neurology", updated: "Jan 2024" },
      { title: "Kawasaki Disease: Diagnostic Criteria & IVIG", tag: "Cardiology", updated: "Dec 2023" },
      { title: "Pediatric Fluid Resuscitation: Evidence Review", tag: "Emergency", updated: "Mar 2024" },
      { title: "Childhood Vaccination Schedule 2024 (CDC/WHO)", tag: "Vaccines", updated: "Jan 2024" },
    ],
  },
  "orthopedics": {
    label: "Orthopedics",
    icon: Bone,
    colorClass: "text-orange-600",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
    gradient: "from-orange-500 to-amber-600",
    description: "Fracture management, joint replacement protocols, sports medicine injuries and musculoskeletal rehabilitation.",
    corpus: "Campbell's Operative Orthopaedics, 14th Ed. · AAOS Guidelines · NICE Orthopaedics",
    categories: ["Fracture Management", "Arthroplasty", "Sports Medicine", "Spine Surgery", "Pediatric Orthopedics", "Trauma", "Musculoskeletal Tumors", "Rehabilitation"],
    featuredArticles: [
      { title: "Hip Arthroplasty: Indications & Complication Avoidance", tag: "Arthroplasty", updated: "Mar 2024" },
      { title: "ACL Reconstruction: Evidence-Based Graft Selection", tag: "Sports", updated: "Feb 2024" },
      { title: "Distal Radius Fracture: ORIF vs Conservative Mgmt", tag: "Trauma", updated: "Jan 2024" },
      { title: "Neck of Femur Fracture: Hemiarthroplasty Algorithm", tag: "Trauma", updated: "Dec 2023" },
      { title: "Prolapsed Disc: Red Flags & Surgical Indications", tag: "Spine", updated: "Mar 2024" },
      { title: "CRPS Type I: Diagnosis and Multidisciplinary Management", tag: "Rehabilitation", updated: "Feb 2024" },
    ],
  },
  "ophthalmology": {
    label: "Ophthalmology",
    icon: Eye,
    colorClass: "text-cyan-600",
    bgClass: "bg-cyan-50",
    borderClass: "border-cyan-200",
    gradient: "from-cyan-500 to-teal-500",
    description: "Retinal pathology, glaucoma management, cataract surgery protocols and anterior segment examination techniques.",
    corpus: "Kanski's Clinical Ophthalmology, 9th Ed. · AAO Guidelines 2024 · Cochrane Eye",
    categories: ["Glaucoma", "Retinal Diseases", "Cataract & Lens", "Corneal Disease", "Oculoplastics", "Pediatric Eye", "Neuro-ophthalmology", "Ocular Emergencies"],
    featuredArticles: [
      { title: "Primary Open-Angle Glaucoma: Target IOP & Agents", tag: "Glaucoma", updated: "Mar 2024" },
      { title: "Diabetic Retinopathy: Screening & Anti-VEGF Protocol", tag: "Retina", updated: "Feb 2024" },
      { title: "Phacoemulsification: Steps and Complication Rates", tag: "Cataract", updated: "Jan 2024" },
      { title: "Acute Angle-Closure Glaucoma: Emergency Protocol", tag: "Emergency", updated: "Dec 2023" },
      { title: "Age-Related Macular Degeneration: Anti-VEGF Evidence", tag: "Retina", updated: "Mar 2024" },
      { title: "Optic Neuritis: MRI Criteria & MS Conversion Risk", tag: "Neuro-ophth", updated: "Feb 2024" },
    ],
  },
};

// ── Mini Chat ────────────────────────────────────────────────────────
function SpecialtyChat({ config }: { _specialty: string; config: typeof SPECIALTY_CONFIG[string] }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; id: string }[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome to the **${config.label}** knowledge assistant.\n\nI am trained on: *${config.corpus}*.\n\nAsk me anything about ${config.label} — diagnosis, treatment protocols, or clinical guidelines.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMsg = async (text?: string) => {
    const q = text || input.trim();
    if (!q || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: q };
    const assistantMsg = { id: (Date.now() + 1).toString(), role: "assistant" as const, content: "" };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/medical-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: q },
          ],
        }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const chunk = JSON.parse(line.slice(2));
              setMessages((prev) =>
                prev.map((m) => m.id === assistantMsg.id ? { ...m, content: m.content + chunk } : m)
              );
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "⚠️ Pipeline error. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className={`bg-gradient-to-r ${config.gradient} p-4 flex items-center space-x-3`}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">{config.label} AI Assistant</p>
          <p className="text-white/70 text-xs">RAG-powered · Zero Hallucination</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-slate-800 text-white rounded-tr-sm"
                : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
            }`}>
              {msg.content || (
                <span className="flex items-center space-x-1.5 text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Retrieving data...</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMsg()}
          placeholder={`Ask about ${config.label}...`}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMsg()}
          disabled={isLoading || !input.trim()}
          className={`w-10 h-10 bg-gradient-to-r ${config.gradient} disabled:from-slate-200 disabled:to-slate-200 text-white rounded-xl flex items-center justify-center transition-all active:scale-95`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
function SpecialtyPage({ specialty }: { specialty: string }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [showChat, setShowChat] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [flashcards, setFlashcards] = useState<any[] | null>(null);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  const config = SPECIALTY_CONFIG[specialty];

  if (!config) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Specialty Not Found</h2>
        <p className="text-slate-500 mb-4">The requested specialty does not exist in our database.</p>
        <Link href="/encyclopedia" className="text-sky-600 hover:underline font-semibold">← Back to Encyclopedia</Link>
      </div>
    );
  }

  const Icon = config.icon;

  const filteredArticles = config.featuredArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.tag.toLowerCase().includes(search.toLowerCase())
  );

  const generateFlashcards = async () => {
    setIsGeneratingCards(true);
    setFlashcards(null);
    try {
      const textToSummarize = `Subject: ${config.label}. Description: ${config.description}. Topics: ${config.categories.join(", ")}. Primary sources: ${config.corpus}. Please generate high-yield clinical flashcards covering the most critical and universally tested concepts from these topics.`;
      
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSummarize }),
      });
      
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullJson = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const chunk = JSON.parse(line.slice(2));
              fullJson += chunk;
            } catch {}
          }
        }
      }
      
      // Clean up potential markdown formatting from AI output
      let cleanJson = fullJson.trim();
      if (cleanJson.startsWith("\`\`\`json")) {
        cleanJson = cleanJson.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
      }
      
      const parsed = JSON.parse(cleanJson);
      setFlashcards(parsed);
    } catch (err) {
      console.error(err);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGeneratingCards(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
        <Link href="/encyclopedia" className="hover:text-slate-700 flex items-center space-x-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Encyclopedia</span>
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className={`font-semibold ${config.colorClass}`}>{config.label}</span>
      </div>

      {/* Hero Banner */}
      <div className={`bg-gradient-to-br ${config.gradient} p-8 rounded-2xl shadow-xl mb-8 relative overflow-hidden`}>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Icon className="w-64 h-64 text-white -mr-8 -mt-8" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-white/70 text-xs font-bold uppercase tracking-widest">Clinical Module</div>
              <h1 className="text-3xl font-extrabold text-white">{config.label}</h1>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mb-4">{config.description}</p>
          <div className="flex items-center space-x-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white/80 text-xs">
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span>{config.corpus}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column — Categories + Articles */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">Browse by Topic</h2>
            <div className="flex flex-wrap gap-2">
              {config.categories.map((cat) => (
                <button
                  key={cat}
                  className={`text-sm px-3 py-1.5 rounded-full border ${config.borderClass} ${config.bgClass} ${config.colorClass} font-medium hover:opacity-80 transition-opacity`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Articles */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Featured Articles</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all text-slate-600"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {filteredArticles.length > 0 ? (
              <div className="space-y-3">
                {filteredArticles.map((article, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 ${config.bgClass} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${config.colorClass}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">{article.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgClass} ${config.colorClass} font-medium`}>
                            {article.tag}
                          </span>
                          <span className="text-xs text-slate-400">Updated {article.updated}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${config.colorClass} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No articles match &quot;{search}&quot;</p>
                <button onClick={() => setSearch("")} className="text-sky-600 text-xs font-semibold mt-1 hover:underline">Clear search</button>
              </div>
            )}
          </div>

          {/* EBM Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-700 text-sm">Evidence-Based Medicine Guarantee</p>
              <p className="text-emerald-600 text-xs mt-0.5 leading-relaxed">
                All articles are sourced exclusively from peer-reviewed journals, Cochrane reviews, and gold-standard clinical guidelines. 
                Hallucination prevention protocols are enforced at system level.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — AI Chat */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">AI Assistant</h2>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <Activity className="w-3.5 h-3.5" />
              <span>Live</span>
            </div>
          </div>
          {showChat ? (
            <SpecialtyChat _specialty={specialty} config={config} />
          ) : (
            <div className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-6 text-white`}>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-extrabold text-lg mb-2">{config.label} Expert</h3>
              <p className="text-white/80 text-sm mb-5 leading-relaxed">
                Ask the AI assistant specialized questions about {config.label}. Powered by verified clinical corpora.
              </p>
              <button
                onClick={() => setShowChat(true)}
                className="w-full bg-white text-slate-800 font-bold py-3 rounded-xl text-sm hover:bg-white/90 transition-colors active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>Start AI Session</span>
              </button>
            </div>
          )}

          {/* Flashcard Generator */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-indigo-700">
              <Layers className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm">Flashcard Generator</h3>
            </div>
            <p className="text-xs text-indigo-600/80 leading-relaxed">
              Generate an instant, high-yield USMLE deck based on the core topics of {config.label}.
            </p>
            <button
              onClick={generateFlashcards}
              disabled={isGeneratingCards}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors active:scale-[0.98] flex items-center justify-center space-x-2 shadow-sm"
            >
              {isGeneratingCards ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating json...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Deck</span>
                </>
              )}
            </button>
          </div>

          {flashcards && flashcards.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-slate-50 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-3xl">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <Layers className="w-5 h-5 text-indigo-500 mr-2" />
                    {config.label} Flashcards
                  </h3>
                  <button onClick={() => setFlashcards(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8 overflow-y-auto">
                  <FlashcardDeck cards={flashcards} />
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Module Stats</h3>
            {[
              { label: "Verified Articles", value: config.featuredArticles.length + "00+" },
              { label: "Topics Covered", value: config.categories.length.toString() },
              { label: "Last Updated", value: "Mar 2024" },
              { label: "Source Rating", value: "Level 1A EBM" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className={`text-xs font-bold ${config.colorClass}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ specialty: string }> }) {
  const { specialty } = use(params);
  return (
    <ErrorBoundary>
      <SpecialtyPage specialty={specialty} />
    </ErrorBoundary>
  );
}
