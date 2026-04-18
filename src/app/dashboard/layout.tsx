import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dashboard | MedPulse AI",
  description: "Your personal MedPulse dashboard — view XP progress, access all clinical modules, and review recent sessions.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
