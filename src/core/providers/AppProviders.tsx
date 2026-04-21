"use client";

import React from "react";
import { ThemeProvider } from "@/core/ui/ThemeProvider";
import { LanguageProvider } from "@/core/i18n/LanguageContext";
import { SupabaseAuthProvider } from "@/core/auth/SupabaseAuthContext";
// Notice: We are intentionally skipping AuthProvider from@/core/auth/AuthContext 
// to enforce a single source of truth for authentication via Supabase.
import { AchievementProvider } from "@/components/AchievementContext";
import { ErrorBoundary } from "@/core/ui/ErrorBoundary";
import { VisitorTracker } from "@/components/VisitorTracker";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SupabaseAuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AchievementProvider>
            <VisitorTracker />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </AchievementProvider>
        </ThemeProvider>
      </SupabaseAuthProvider>
    </LanguageProvider>
  );
}

