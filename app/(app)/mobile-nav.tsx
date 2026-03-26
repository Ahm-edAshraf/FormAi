"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="app-focus -mr-2 min-h-11 min-w-11 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0A0A0A] border-b border-white/10 p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            <Link 
              href="/dashboard" 
              onClick={() => setIsOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors app-focus ${pathname === "/dashboard" || pathname?.startsWith("/forms") ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              Forms
            </Link>
            <Link 
              href="/settings" 
              onClick={() => setIsOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors app-focus ${pathname === "/settings" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
            >
              Settings
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
