"use client";

import { useAuth } from "@/core/auth/useAuth";
import { Role } from "@/core/auth/auth.types";
import { UserCircle, ShieldCheck } from "lucide-react";

export function DevRoleToggle() {
  const { user } = useAuth();
  
  if (!user) return null;

  const isProfessor = user.role === Role.PROFESSOR;

  return (
    <div className="flex flex-col gap-2 w-full mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
      <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
        <button 
          onClick={() => {/* toggleRole(Role.STUDENT) TODO: Implement properly with Supabase */}}
          className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${!isProfessor ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <UserCircle className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Student View</span>
        </button>

        <button 
          onClick={() => {/* toggleRole(Role.PROFESSOR) */}}
          className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${isProfessor ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Professor View</span>
        </button>
      </div>
    </div>
  );
}

