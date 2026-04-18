import { Metadata } from "next";
export const metadata: Metadata = {
  title: "USMLE Clinical Mode | MedPulse AI",
  description: "50+ Step 2 CK style questions with detailed explanations, evidence-based references, and 2026 clinical guidelines.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
