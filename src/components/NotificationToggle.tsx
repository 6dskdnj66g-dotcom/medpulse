"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/core/push/pushClient";
import { useAuth } from "@/core/auth/useAuth";

type State = "default" | "granted" | "denied" | "loading" | "unsupported";

const buttonBase =
  "relative p-2 rounded-full flex items-center justify-center backdrop-blur-md transition-colors";

const buttonIdle =
  "bg-[var(--glass-bg)] hover:bg-[var(--bg-3)] border border-[var(--glass-border)] text-[var(--text-secondary)]";

const buttonGranted =
  "bg-[var(--glass-bg)] hover:bg-[var(--bg-3)] border border-[var(--glass-border)] text-emerald-600 dark:text-emerald-400";

const buttonDisabled =
  "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-tertiary)] cursor-not-allowed";

export default function NotificationToggle() {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const initState = async () => {
      if (!isPushSupported()) {
        if (!cancelled) setState("unsupported");
        return;
      }

      const perm = Notification.permission;

      if (perm === "granted") {
        try {
          const reg = await navigator.serviceWorker.getRegistration("/");
          const sub = await reg?.pushManager.getSubscription();
          if (!cancelled) setState(sub ? "granted" : "default");
        } catch {
          if (!cancelled) setState("default");
        }
      } else {
        if (!cancelled) setState(perm as State);
      }
    };

    initState();

    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  if (authLoading) return null;
  if (!user) return null;
  if (state === "unsupported") return null;

  const enable = async () => {
    setState("loading");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm);
        return;
      }
      await subscribeToPush();
      setState("granted");
    } catch (err) {
      console.error("Push subscribe failed:", err);
      setState("default");
    }
  };

  const disable = async () => {
    setState("loading");
    try {
      await unsubscribeFromPush();
      setState("default");
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
      setState("granted");
    }
  };

  if (state === "loading") {
    return (
      <button
        disabled
        className={`${buttonBase} ${buttonDisabled}`}
        aria-busy="true"
        aria-label="Loading notifications status"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  if (state === "denied") {
    return (
      <button
        disabled
        className={`${buttonBase} ${buttonDisabled}`}
        title="Notifications blocked in browser settings"
        aria-label="Notifications blocked"
      >
        <BellOff className="w-5 h-5" />
      </button>
    );
  }

  const enabled = state === "granted";
  // "default" = supported, permission not yet requested -> nudge with pulsing dot.
  const showPulse = !enabled;

  return (
    <motion.button
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={enabled ? disable : enable}
      className={`${buttonBase} ${enabled ? buttonGranted : buttonIdle}`}
      title={enabled ? "Disable notifications" : "Enable notifications"}
      aria-label={enabled ? "Disable notifications" : "Enable notifications"}
    >
      {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}

      <AnimatePresence>
        {showPulse && (
          <motion.span
            key="pulse"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-hidden
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5"
          >
            <span className="absolute inset-0 rounded-full bg-rose-500/70 animate-ping" />
            <span className="absolute inset-0.5 rounded-full bg-rose-500" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
