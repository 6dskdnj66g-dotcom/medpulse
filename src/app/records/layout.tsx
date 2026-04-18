import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Patient Records | MedPulse AI",
  description: "Clinical portfolio — manage and review patient case records stored securely in Supabase.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
