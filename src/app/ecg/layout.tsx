import { Metadata } from "next";
export const metadata: Metadata = {
  title: "ECG Analysis | MedPulse AI",
  description: "AI-powered ECG interpretation with 6 preset clinical scenarios — powered by Gemini 2.0 Flash.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
