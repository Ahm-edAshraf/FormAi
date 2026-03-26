"use client";

import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-10 flex items-center justify-between px-4 py-5 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-500 to-blue-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          <div className="absolute inset-[1px] rounded-[11px] bg-[#050505] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
        </div>
        <span className="font-bold text-xl tracking-tight text-white">FormAI</span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <Link href="#features" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-1">
          Features
        </Link>
        <Link href="#how-it-works" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-1">
          How it works
        </Link>
        <Link href="#pricing" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-1">
          Pricing
        </Link>
      </nav>

      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-2 py-1"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-white px-6 font-medium text-black transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-slate-300 hover:text-white px-2 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Sign in
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-11 min-w-11 inline-flex items-center justify-center"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1 p-4 max-w-7xl mx-auto">
            {[
              ["#features", "Features"],
              ["#how-it-works", "How it works"],
              ["#pricing", "Pricing"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
