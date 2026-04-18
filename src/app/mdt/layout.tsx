import { Metadata } from "next";
export const metadata: Metadata = {
  title: "MDT AI Debate | MedPulse AI",
  description: "Multi-Disciplinary Team AI debate system — 3 clinical agents debate complex medical cases to reach evidence-based consensus.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
