import ClinicalChat from "@/app/components/ClinicalChat";

export const metadata = {
  title: "Clinical Professor | MedPulse",
  description: "Evidence-based clinical query powered by MEDLINE.",
};

export default function ProfessorPage() {
  return (
    <main className="min-h-screen bg-slate-100 py-12">
      <ClinicalChat />
    </main>
  );
}
