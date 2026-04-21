"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";

// Generates or retrieves a persistent session ID for the visitor
function getSessionId(): string {
  const key = "medpulse_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function VisitorTracker() {
  const pathname = usePathname();
  const { user } = useSupabaseAuth();
  const lastPage = useRef<string>("");

  useEffect(() => {
    if (pathname === lastPage.current) return;
    lastPage.current = pathname;

    // Avoid tracking auth pages
    if (pathname.startsWith("/auth")) return;

    const sessionId = getSessionId();

    fetch("/api/visitors/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        page: pathname,
        referrer: document.referrer || null,
        user_id: user?.id || null,
      }),
    }).catch(() => {}); // Fail silently
  }, [pathname, user]);

  return null; // This component renders nothing
}
