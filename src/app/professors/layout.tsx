import { Metadata } from "next";
export const metadata: Metadata = {
  title: "AI Professor Network | MedPulse AI",
  description: "Chat with 4 specialized AI professors — Internal Medicine, Cardiology, Neurology, and Oncology — each fine-tuned on dedicated clinical corpora.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
