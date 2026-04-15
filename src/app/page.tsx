"use client";

import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ProfessorDashboard } from "@/components/dashboard/ProfessorDashboard";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Authenticating your secure session...</p>
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
