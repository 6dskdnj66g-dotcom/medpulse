import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Progress Tracker | MedPulse AI",
  description: "Track your XP, learning streak, accuracy, and session history across all MedPulse clinical modules.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
