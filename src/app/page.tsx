"use client";

import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ProfessorDashboard } from "@/components/dashboard/ProfessorDashboard";
import { Activity } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center z-[200]">
        <div className="relative mb-12">
          <div className="w-32 h-32 border-[6px] border-indigo-500/5 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-32 h-32 border-[6px] border-transparent border-b-teal-400 rounded-full animate-spin-slow"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-10 h-10 text-indigo-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            MedPulse <span className="text-indigo-600">Secure</span>
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-1 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 animate-progress" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
              Initializing Neural Lattice...
            </p>
          </div>
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
