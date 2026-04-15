import { ReactNode } from "react";
import Link from "next/link";
import { BookMarked, Brain, HeartPulse, Stethoscope, Microscope, Search } from "lucide-react";

export default function EncyclopediaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <BookMarked className="mr-3 h-6 w-6 text-sky-500" />
          Global Medical Encyclopedia
        </h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search conditions, pathways..." 
            className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all"
          />
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Specialties Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="px-4 py-6 space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Specialties</h3>
            
            <Link href="/encyclopedia/internal-medicine" className="flex items-center space-x-3 px-3 py-2 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-sky-600">
              <Stethoscope className="w-4 h-4" />
              <span className="font-medium text-sm">Internal Medicine</span>
            </Link>
            
            <Link href="/encyclopedia/cardiology" className="flex items-center space-x-3 px-3 py-2 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-rose-600">
              <HeartPulse className="w-4 h-4" />
              <span className="font-medium text-sm">Cardiology</span>
            </Link>
            
            <Link href="/encyclopedia/neurology" className="flex items-center space-x-3 px-3 py-2 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600">
              <Brain className="w-4 h-4" />
              <span className="font-medium text-sm">Neurology</span>
            </Link>

            <Link href="/encyclopedia/pathology" className="flex items-center space-x-3 px-3 py-2 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-teal-600">
              <Microscope className="w-4 h-4" />
              <span className="font-medium text-sm">Pathology</span>
            </Link>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </div>
      </div>
    </div>
  );
}
