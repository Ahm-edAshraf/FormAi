"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass = (active: boolean) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] ${
    active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

export function AppNavLinks() {
  const pathname = usePathname();
  const onDashboard = pathname === "/dashboard" || pathname?.startsWith("/forms");
  const onSettings = pathname === "/settings";

  return (
    <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
      <Link href="/dashboard" className={linkClass(onDashboard)}>
        Forms
      </Link>
      <Link href="/settings" className={linkClass(onSettings)}>
        Settings
      </Link>
    </nav>
  );
}
