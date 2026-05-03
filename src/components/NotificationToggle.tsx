"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/core/push/pushClient";
import { useAuth } from "@/core/auth/useAuth";

type State = "default" | "granted" | "denied" | "loading" | "unsupported";

const buttonBase =
  "p-2 rounded-full transition-colors flex items-center justify-center";

const buttonIdle =
  "bg-[var(--bg-2)] hover:bg-[var(--bg-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)]";

const buttonGranted =
  "bg-[var(--bg-2)] hover:bg-[var(--bg-3)] border border-[var(--border-subtle)] text-emerald-600 dark:text-emerald-400";

const buttonDisabled =
  "bg-[var(--bg-2)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] cursor-not-allowed";

export default function NotificationToggle() {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!isPushSupported()) {
      setState("unsupported");
      return;
    }

    let cancelled = false;
    const perm = Notification.permission;

    if (perm === "granted") {
      navigator.serviceWorker
        .getRegistration("/")
        .then((reg) => reg?.pushManager.getSubscription())
        .then((sub) => {
          if (!cancelled) setState(sub ? "granted" : "default");
        })
        .catch(() => {
          if (!cancelled) setState("default");
        });
    } else {
      setState(perm);
    }

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
  return (
    <button
      onClick={enabled ? disable : enable}
      className={`${buttonBase} ${enabled ? buttonGranted : buttonIdle}`}
      title={enabled ? "Disable notifications" : "Enable notifications"}
      aria-label={enabled ? "Disable notifications" : "Enable notifications"}
    >
      {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
    </button>
  );
}
