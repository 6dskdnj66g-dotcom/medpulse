"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Paths that should render without the app shell (no sidebar/navbar/footer)
const SHELL_EXCLUDED_PATHS = ["/", "/auth"];

function shouldShowShell(pathname: string): boolean {
  return !SHELL_EXCLUDED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showShell = shouldShowShell(pathname);

  if (!showShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div
        data-nav-instance="app-shell"
        style={{ display: "flex", flex: 1, minHeight: 0 }}
      >
        <Sidebar />
        <main className="flex-1 w-full flex flex-col" style={{ minWidth: 0 }}>
          <div
            className="flex-1"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </>
  );
}
