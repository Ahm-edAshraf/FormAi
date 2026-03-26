import Link from "next/link";

import { MarketingHeader } from "./marketing-header";

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-slate-200 selection:bg-indigo-500/30 font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <MarketingHeader />

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-24 sm:pt-28 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <p className="text-sm font-mono uppercase tracking-[0.25em] text-indigo-300">Legal</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-4 text-sm text-slate-400">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8 rounded-3xl border border-white/10 bg-[#0A0A0A]/90 p-8 leading-8 text-slate-300 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
          {children}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-slate-400 animate-in fade-in duration-1000">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          <Link href="/data" className="hover:text-white transition-colors">Data</Link>
        </div>
      </section>
    </main>
  );
}
