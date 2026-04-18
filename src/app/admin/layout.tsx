import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Admin Panel | MedPulse AI",
  description: "MedPulse platform administration — visitor analytics, Supabase data management, and platform statistics.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
