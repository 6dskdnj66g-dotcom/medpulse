import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Drug Interaction Checker | MedPulse AI",
  description: "Instant AI-powered drug interaction analysis for 200+ common medications, powered by Gemini AI.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
