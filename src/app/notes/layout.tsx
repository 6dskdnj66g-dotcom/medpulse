import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Clinical Notes | MedPulse AI",
  description: "AI-assisted SOAP note generation with PDF export, template library, and Supabase cloud storage.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
