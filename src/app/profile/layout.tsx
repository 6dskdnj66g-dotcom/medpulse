import { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Profile | MedPulse AI",
  description: "Manage your MedPulse profile — update personal information, institution, and account settings.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
