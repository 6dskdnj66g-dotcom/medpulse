import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Medical Library | MedPulse AI",
  description: "200+ verified medical sources — journals, databases, textbooks, and guidelines organized by type, region, and specialty.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
