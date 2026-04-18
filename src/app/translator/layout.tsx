import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Medical Translator | MedPulse AI",
  description: "Bilingual Arabic–English medical translator for clinical terms, diagnoses, and medical reports.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
