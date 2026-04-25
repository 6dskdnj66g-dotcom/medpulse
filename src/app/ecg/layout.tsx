import { Metadata } from "next";
export const metadata: Metadata = {
  title: "ECG Analysis | MedPulse AI",
  description: "AI-powered ECG interpretation with 6 preset clinical scenarios.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
