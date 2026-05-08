"use client";

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, BellOff, BellRing, Check, Loader2, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string; // info | reminder | update | achievement
  icon: string;
  is_read: boolean;
  created_at: string;
}

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

// ── base64 → ArrayBuffer (VAPID key conversion for PushManager.subscribe) ─
function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = typeof window !== "undefined" ? window.atob(base64) : "";
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

type PushState = "idle" | "unsupported" | "denied" | "subscribing" | "subscribed";

export default function NotificationToggle() {
  const { user } = useSupabaseAuth();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [pushState, setPushState] = useState<PushState>("idle");
  const [pos, setPos] = useState<{ top: number; left: number; width: number; placement: "below" | "side" }>({
    top: 0,
    left: 0,
    width: 400,
    placement: "below",
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // ── mount flag for portal ────────────────────────────────────────────────
  useEffect(() => setMounted(true), []);

  // ── detect existing push subscription on mount ───────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setPushState("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushState(sub ? "subscribed" : "idle"))
      .catch(() => setPushState("idle"));
  }, []);

  // ── fetch from supabase when user logged in ──────────────────────────────
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
      }
    } catch {
      /* keep defaults silently */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── compute popover position relative to trigger button ──────────────────
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isDesktop = vw >= 768;
    const popWidth = isDesktop ? 400 : Math.min(360, vw - 24);
    const margin = 12;

    let top: number;
    let left: number;
    let placement: "below" | "side" = "below";

    if (isDesktop) {
      // Desktop: open to the side of the trigger (right of button if LTR, left if RTL),
      // anchored to the button's vertical centre, kept within viewport.
      placement = "side";
      const wantSide = isAr ? "left" : "right";
      if (wantSide === "right") {
        left = r.right + margin;
        if (left + popWidth + margin > vw) {
          // Not enough space on the right → fall back to the left of the button
          left = Math.max(margin, r.left - popWidth - margin);
        }
      } else {
        left = r.left - popWidth - margin;
        if (left < margin) {
          left = Math.min(vw - popWidth - margin, r.right + margin);
        }
      }
      // Anchor the popover so the trigger sits roughly aligned with its top.
      // Cap so it never goes off-screen vertically.
      const desiredTop = r.top - 8;
      const maxHeightEstimate = Math.min(vh * 0.8, 560);
      top = Math.max(margin, Math.min(desiredTop, vh - maxHeightEstimate - margin));
    } else {
      // Mobile: classic dropdown below the trigger
      top = r.bottom + 8;
      left = isAr ? r.left : r.right - popWidth;
      // Clamp inside viewport
      if (left + popWidth > vw - margin) left = vw - popWidth - margin;
      if (left < margin) left = margin;
    }

    setPos({ top, left, width: popWidth, placement });
  }, [isAr]);

  useLayoutEffect(() => {
    if (open) computePosition();
  }, [open, computePosition]);

  // ── recompute on resize / scroll while open ──────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = () => computePosition();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [open, computePosition]);

  // ── click outside / Escape key to close ──────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ── derived ──────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (user) {
      try {
        await fetch(`/api/notifications?user_id=${user.id}`, { method: "PATCH" });
      } catch {
        /* silent */
      }
    }
  };

  // ── push subscribe / unsubscribe ─────────────────────────────────────────
  const enablePush = async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushState("unsupported");
      return;
    }
    setPushState("subscribing");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushState(permission === "denied" ? "denied" : "idle");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("[notifications] NEXT_PUBLIC_VAPID_PUBLIC_KEY missing");
        setPushState("idle");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(vapidKey),
      });
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (res.ok) {
        setPushState("subscribed");
      } else {
        await sub.unsubscribe().catch(() => undefined);
        setPushState("idle");
      }
    } catch (err) {
      console.error("[notifications] subscribe error:", err);
      setPushState("idle");
    }
  };

  const disablePush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        }).catch(() => undefined);
      }
      setPushState("idle");
    } catch (err) {
      console.error("[notifications] unsubscribe error:", err);
    }
  };

  const typeColors: Record<string, string> = {
    info: "bg-indigo-500/10 border-indigo-500/20",
    reminder: "bg-amber-500/10 border-amber-500/20",
    update: "bg-emerald-500/10 border-emerald-500/20",
    achievement: "bg-rose-500/10 border-rose-500/20",
  };

  const popover = open && mounted ? createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={isAr ? "الإشعارات" : "Notifications"}
      className="rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: pos.width,
        maxHeight: "min(80vh, 560px)",
        background: "var(--bg-1)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 24px 60px -12px rgba(15, 23, 42, 0.45), 0 8px 16px -8px rgba(15, 23, 42, 0.25)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <div
        className="px-5 py-4 flex items-center justify-between gap-3 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 50%, rgba(20,184,166,0.04) 100%)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
            <BellRing className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
              {isAr ? "الإشعارات" : "Notifications"}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {unreadCount > 0
                ? isAr
                  ? `${unreadCount} غير مقروء`
                  : `${unreadCount} unread`
                : isAr
                ? "كل شيء مُقرأ"
                : "All caught up"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{
                color: "var(--color-medical-indigo)",
                background: "rgba(99,102,241,0.10)",
              }}
              title={isAr ? "قراءة الكل" : "Mark all read"}
            >
              <Check className="w-3 h-3" />
              <span className="hidden sm:inline">{isAr ? "قراءة الكل" : "Mark all"}</span>
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-3)]"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <X className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
      </div>

      {/* ── Push subscription bar ────────────────────────── */}
      {pushState !== "subscribed" && pushState !== "unsupported" && (
        <div
          className="px-5 py-3 flex items-center gap-3 shrink-0"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(99,102,241,0.04)",
          }}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-medical-indigo)" }} />
          <p className="text-[11px] font-semibold flex-1 leading-snug" style={{ color: "var(--text-secondary)" }}>
            {pushState === "denied"
              ? isAr
                ? "تم رفض الإذن. فعّل الإشعارات من إعدادات المتصفح."
                : "Permission denied. Enable notifications in browser settings."
              : isAr
              ? "فعّل التنبيهات لاستلام تذكيرات الدراسة"
              : "Enable push to get study reminders"}
          </p>
          {pushState !== "denied" && (
            <button
              onClick={enablePush}
              disabled={pushState === "subscribing"}
              className="text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all hover:scale-[1.03] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                boxShadow: "0 4px 12px rgba(99,102,241,0.30)",
              }}
            >
              {pushState === "subscribing" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isAr ? (
                "تفعيل"
              ) : (
                "Enable"
              )}
            </button>
          )}
        </div>
      )}
      {pushState === "subscribed" && (
        <div
          className="px-5 py-2.5 flex items-center justify-between gap-3 shrink-0"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(16,185,129,0.05)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <p className="text-[11px] font-bold" style={{ color: "var(--text-secondary)" }}>
              {isAr ? "التنبيهات مُفعّلة" : "Push notifications active"}
            </p>
          </div>
          <button
            onClick={disablePush}
            className="text-[10px] font-bold px-2 py-1 rounded-md transition-colors hover:bg-[var(--bg-3)]"
            style={{ color: "var(--text-tertiary)" }}
            title={isAr ? "إلغاء التفعيل" : "Disable"}
          >
            <BellOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── List ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ borderColor: "var(--border-subtle)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-tertiary)" }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-14 text-center px-6">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border-subtle)" }}
            >
              <Bell className="w-6 h-6 opacity-30" style={{ color: "var(--text-tertiary)" }} />
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
              {isAr ? "لا توجد إشعارات بعد" : "No notifications yet"}
            </p>
            <p className="text-[11px] font-medium mt-1" style={{ color: "var(--text-tertiary)" }}>
              {isAr ? "ستظهر التذكيرات والإشعارات هنا" : "Reminders and updates will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--bg-2)]/50"
                style={{
                  background: !n.is_read ? "rgba(99,102,241,0.04)" : undefined,
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    typeColors[n.type] || typeColors.info
                  }`}
                >
                  <span className="text-base leading-none">{n.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-[13px] leading-snug ${!n.is_read ? "font-extrabold" : "font-bold"}`}
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
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 hover:scale-105"
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border-default)",
        }}
        aria-label={isAr ? "الإشعارات" : "Notifications"}
        aria-expanded={open}
      >
        <Bell className="w-[18px] h-[18px]" style={{ color: "var(--text-secondary)" }} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg shadow-rose-500/30 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {popover}
    </>
  );
}
