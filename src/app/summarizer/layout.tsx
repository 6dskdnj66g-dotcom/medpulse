import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Medical Summarizer | MedPulse AI",
  description: "AI-powered medical document summarizer — paste clinical text or upload images for instant structured summaries.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
