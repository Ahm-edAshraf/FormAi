import { auth } from "@clerk/nextjs/server";
import { Sparkles } from "lucide-react";
import Link from "next/link";

import { SessionSync } from "@/components/dashboard/session-sync";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";

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
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 h-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-500 to-blue-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-white hidden sm:inline-block">FormAI</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-md bg-white/10 text-white">Forms</Link>
              <Link href="/settings" className="px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Settings</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <WorkspaceSwitcher />
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
