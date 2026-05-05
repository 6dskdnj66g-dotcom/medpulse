"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";

export default function NotificationToggle() {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-300 group-hover:text-white" />
        {/* Unread badge */}
        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse border border-slate-900" />
      </button>

      {/* Popover */}
      {open && (
        <div className={`absolute top-12 ${isAr ? "left-0" : "right-0"} w-80 bg-[#09090b] border border-white/[0.08] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200`} dir={isAr ? "rtl" : "ltr"}>
          <div className="p-4 border-b border-white/[0.05] bg-white/[0.02]">
            <h3 className="font-extrabold text-white text-sm">{isAr ? "الإشعارات" : "Notifications"}</h3>
          </div>
          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            {/* Notification Item 1 */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <span className="text-sm">🧠</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 mb-1">{isAr ? "تذكير للمذاكرة" : "Study Reminder"}</p>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  {isAr ? "كيف تسير دراستك؟ لديك بطاقات SRS ومحطات OSCE بانتظارك. حافظ على استمراريتك!" : "How are your studies going? You have SRS cards and OSCE stations waiting. Keep your streak!"}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block">{isAr ? "الآن" : "Just now"}</span>
              </div>
            </div>
            
            {/* Notification Item 2 */}
            <div className="flex gap-3 opacity-60">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <span className="text-sm">🌟</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 mb-1">{isAr ? "تحديث جديد" : "New Update"}</p>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  {isAr ? "تم إطلاق واجهة متطورة جديدة كلياً للمنصة." : "A completely new advanced interface has been launched."}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block">{isAr ? "قبل ساعتين" : "2 hours ago"}</span>
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-white/[0.05] bg-white/[0.01] text-center">
            <button className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300">
              {isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
