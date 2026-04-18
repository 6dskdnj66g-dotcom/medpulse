import { Metadata } from "next";
export const metadata: Metadata = {
  title: "OSCE Clinical Simulator | MedPulse AI",
  description: "Real-time OSCE clinical simulation with AI patient interactions, voice input, and instant feedback.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
