// Build trigger: Vercel settings updated
import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AchievementProvider } from '@/components/AchievementContext';
import { DevRoleToggle } from '@/components/DevRoleToggle';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CalculatorsWidget } from '@/components/CalculatorsWidget';
import { SupabaseAuthProvider } from '@/components/SupabaseAuthContext';
import { VisitorTracker } from '@/components/VisitorTracker';
import { LanguageProvider } from '@/components/LanguageContext';

export const metadata: Metadata = {
  title: 'MedPulse AI | Clinical Intelligence Platform 2026',
  description: 'AI-powered medical education platform with zero-hallucination clinical knowledge, USMLE prep, drug interactions, ECG interpretation, and clinical calculators.',
  keywords: ['medical AI', 'clinical knowledge', 'USMLE', 'drug interactions', 'ECG', 'clinical calculators', 'healthcare'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MedPulse AI',
  },
};

export const viewport = {
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        `}} />
      </head>
      <body
        suppressHydrationWarning
        className="bg-slate-50 text-slate-900 antialiased"
        style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}
      >
        <LanguageProvider>
          <SupabaseAuthProvider>
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <AchievementProvider>
                  <VisitorTracker />
                  {/* Mobile top nav */}
                  <Navbar />
                  {/* Desktop: sidebar + content */}
                  <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                    <Sidebar />
                    <main
                      className="flex-1 overflow-y-auto"
                      style={{ minWidth: 0 }}
                    >
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                    </main>
                  </div>
                  <DevRoleToggle />
                  <CalculatorsWidget />
                </AchievementProvider>
              </ThemeProvider>
            </AuthProvider>
          </SupabaseAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
