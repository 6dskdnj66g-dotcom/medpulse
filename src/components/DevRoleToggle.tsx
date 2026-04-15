"use client";

import { useAuth } from "@/components/AuthContext";
import { Role } from "@/types/auth";
import { UserCircle, ShieldCheck } from "lucide-react";

export function DevRoleToggle() {
  const { user, toggleRole } = useAuth();
  
  if (!user) return null;

  const isProfessor = user.role === Role.PROFESSOR;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-2 rounded-full shadow-2xl flex items-center space-x-2 border-2 border-slate-700/50 backdrop-blur-md transition-all">
      <button 
        onClick={() => toggleRole(Role.STUDENT)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${!isProfessor ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
      >
        <UserCircle className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Student View</span>
      </button>

      <button 
        onClick={() => toggleRole(Role.PROFESSOR)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${isProfessor ? 'bg-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Professor View</span>
      </button>
    </div>
  );
}
