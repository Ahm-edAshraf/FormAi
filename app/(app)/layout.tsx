import { auth } from "@clerk/nextjs/server";
import { Sparkles } from "lucide-react";
import Link from "next/link";

import { SessionSync } from "@/components/dashboard/session-sync";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { AppNavLinks } from "./app-nav-links";
import { MobileNav } from "./mobile-nav";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-slate-200 font-sans">
      <SessionSync />
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl relative">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 h-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="app-focus flex items-center gap-2 rounded-lg transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-500 to-blue-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-white hidden sm:inline-block">FormAI</span>
            </Link>

            <AppNavLinks />
          </div>

          <div className="flex items-center gap-4">
            <WorkspaceSwitcher />
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
