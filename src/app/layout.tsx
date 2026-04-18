// Build trigger: Vercel settings updated
import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AchievementProvider } from '@/components/AchievementContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SupabaseAuthProvider } from '@/components/SupabaseAuthContext';
import { VisitorTracker } from '@/components/VisitorTracker';
import { LanguageProvider } from '@/components/LanguageContext';

export const metadata: Metadata = {
  title: 'MedPulse AI | Clinical Intelligence Platform 2026',
  description: 'AI-powered Arabic/English bilingual medical education platform — USMLE prep, MDT debates, OSCE simulator, ECG analysis, drug interaction checker, clinical calculators, and AI professors. Powered by Gemini 2.0 Flash.',
  keywords: ['medical AI', 'clinical knowledge', 'USMLE', 'drug interactions', 'ECG', 'clinical calculators', 'healthcare', 'مستشفى', 'طب', 'ذكاء اصطناعي طبي', 'OSCE', 'MDT', 'Gemini'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MedPulse AI',
  },
  openGraph: {
    type: 'website',
    siteName: 'MedPulse AI',
    title: 'MedPulse AI | Clinical Intelligence Platform 2026',
    description: 'AI-powered bilingual medical education platform — USMLE, MDT debates, OSCE simulator, ECG analysis, drug checker, and more. Powered by Gemini 2.0 Flash.',
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MedPulse AI — Clinical Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedPulse AI | Clinical Intelligence Platform 2026',
    description: 'AI-powered bilingual medical education — USMLE, MDT, OSCE, ECG, Drug Checker. Powered by Gemini 2.0 Flash.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var stored = localStorage.getItem('theme');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var theme = stored === 'dark' || stored === 'light' ? stored : (prefersDark ? 'dark' : 'light');
              document.documentElement.classList.add('theme-init');
              if (theme === 'dark') document.documentElement.classList.add('dark');
              requestAnimationFrame(function() { document.documentElement.classList.remove('theme-init'); });
            } catch(e) {}
          })();
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        `}} />
      </head>
      <body
        suppressHydrationWarning
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}
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
                      className="flex-1 w-full"
                      style={{ minWidth: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                    >
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                    </main>
                  </div>
                </AchievementProvider>
              </ThemeProvider>
            </AuthProvider>
          </SupabaseAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
