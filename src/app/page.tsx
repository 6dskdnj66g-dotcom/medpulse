"use client";

import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ProfessorDashboard } from "@/components/dashboard/ProfessorDashboard";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full h-full flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-teal-500 rounded-full animate-spin-slow"></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">MedPulse Security Protocol</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing encrypted session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-slate-800">Please sign in</h1>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      {user.role === Role.STUDENT ? (
        <StudentDashboard />
      ) : (
        <ProfessorDashboard />
      )}
    </div>
  );
}
