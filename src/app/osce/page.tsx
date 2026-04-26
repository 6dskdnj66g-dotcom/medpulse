import OsceChat from "@/components/medical/OsceChat";

export const metadata = {
  title: "OSCE Simulator | MedPulse",
  description: "Real-time patient history simulation for OSCE preparation.",
};

export default function OscePage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <OsceChat />
    </main>
  );
}
