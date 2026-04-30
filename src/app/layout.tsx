import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/core/providers/AppProviders';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'MedPulse AI — Clinical Intelligence Platform',
    template: '%s | MedPulse AI',
  },
  description: 'Free Arabic-first medical education platform. USMLE prep, OSCE simulator, ECG analysis, clinical calculators, drug checker, AI professors. Built by Hasanain Salah.',
  keywords: ['medical AI', 'clinical knowledge', 'USMLE', 'drug interactions', 'ECG', 'clinical calculators', 'healthcare', 'مستشفى', 'طب', 'ذكاء اصطناعي طبي', 'OSCE', 'MDT'],
  authors: [{ name: 'Hasanain Salah' }],
  creator: 'Hasanain Salah',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MedPulse AI',
  },
  openGraph: {
    type: 'website',
    siteName: 'MedPulse AI',
    title: 'MedPulse AI — Clinical Intelligence Platform',
    description: 'Free Arabic-first medical education platform. USMLE, MDT debates, OSCE simulator, ECG analysis, drug checker, and more.',
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
    title: 'MedPulse AI — Clinical Intelligence Platform',
    description: 'Free Arabic medical education — USMLE, MDT, OSCE, ECG, Drug Checker. Built by Hasanain Salah.',
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
        {/* Prevent flash of wrong theme */}
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
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
