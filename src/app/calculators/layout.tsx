import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Clinical Calculators | MedPulse AI",
  description: "8 evidence-based clinical calculators: CURB-65, CHA₂DS₂-VASc, Wells DVT/PE, MELD, eGFR, BMI, NIHSS.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
