import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AchievementProvider } from '@/components/AchievementContext';
import { DevRoleToggle } from '@/components/DevRoleToggle';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CalculatorsWidget } from '@/components/CalculatorsWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MedPulse AI | HealthTech Platform',
  description: 'AI-powered medical platform designed for medical students and doctors. Zero-hallucination, RAG-powered clinical knowledge at your fingertips.',
  keywords: ['medical AI', 'clinical knowledge', 'RAG', 'healthcare', 'USMLE'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}
        style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AchievementProvider>
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
      </body>
    </html>
  );
}

