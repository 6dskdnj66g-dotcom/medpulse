"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;    // info | reminder | update | achievement
  icon: string;
  is_read: boolean;
  created_at: string;
}

// Default notifications for users without Supabase / logged-out
const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "welcome-1",
    title: "مرحباً في MedPulse AI",
    message: "منصتك السريرية الذكية جاهزة. استكشف الأدوات الطبية المتاحة!",
    type: "info",
    icon: "🩺",
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "tip-1",
    title: "نصيحة: جرّب محاكي OSCE",
    message: "تدرّب على المحطات السريرية مع ممتحن AI يقيّم أدائك فوراً.",
    type: "reminder",
    icon: "🧠",
    is_read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

function timeAgo(dateStr: string, isAr: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return isAr ? "الآن" : "Just now";
  if (mins < 60) return isAr ? `قبل ${mins} دقيقة` : `${mins}m ago`;
  if (hours < 24) return isAr ? `قبل ${hours} ساعة` : `${hours}h ago`;
  return isAr ? `قبل ${days} يوم` : `${days}d ago`;
}

export default function NotificationToggle() {
  const { user } = useSupabaseAuth();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch real notifications from Supabase when user is logged in
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
        // If no notifications in DB, keep default welcome ones
      }
    } catch {
      // Silently fail — keep defaults
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    if (user) {
      try {
        await fetch(`/api/notifications?user_id=${user.id}`, { method: "PATCH" });
      } catch {
        // Silently fail
      }
    }
  };

  const typeColors: Record<string, string> = {
    info: "bg-indigo-500/10 border-indigo-500/20",
    reminder: "bg-amber-500/10 border-amber-500/20",
    update: "bg-emerald-500/10 border-emerald-500/20",
    achievement: "bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-default)",
        }}
        aria-label="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" style={{ color: "var(--text-secondary)" }} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg shadow-rose-500/30 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div
          className={`absolute top-12 ${isAr ? "left-0" : "right-0"} w-80 sm:w-96 rounded-2xl overflow-hidden z-50`}
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 20px 60px -15px rgba(0,0,0,0.5)",
          }}
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h3 className="font-extrabold text-sm" style={{ color: "var(--text-primary)" }}>
              {isAr ? "الإشعارات" : "Notifications"}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  color: "var(--color-medical-indigo)",
                  background: "rgba(99,102,241,0.08)",
                }}
              >
                <Check className="w-3 h-3" />
                {isAr ? "قراءة الكل" : "Mark all read"}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-tertiary)" }} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--text-tertiary)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>
                  {isAr ? "لا توجد إشعارات" : "No notifications"}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-5 py-4 transition-colors ${
                    !n.is_read ? "bg-[var(--color-medical-indigo)]/[0.03]" : ""
                  }`}
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      typeColors[n.type] || typeColors.info
                    }`}
                  >
                    <span className="text-base">{n.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-[13px] leading-tight ${
                          !n.is_read ? "font-extrabold" : "font-bold"
                        }`}
                        style={{ color: "var(--text-primary)" }}
                      >
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5 animate-pulse" />
                      )}
                    </div>
                    <p
                      className="text-[12px] font-medium leading-relaxed mt-1"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {n.message}
                    </p>
                    <span
                      className="text-[10px] font-bold mt-1.5 block"
                      style={{ color: "var(--text-tertiary)", opacity: 0.6 }}
                    >
                      {timeAgo(n.created_at, isAr)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
