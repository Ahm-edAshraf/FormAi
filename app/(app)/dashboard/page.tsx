"use client";

import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart2,
  Clock,
  FileText,
  MoreVertical,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  const { isLoaded, orgId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const dashboardData = useQuery(
    api.forms.getDashboardData,
    isLoaded ? { clerkOrgId: orgId ?? null } : "skip",
  );

  const forms = useMemo(() => {
    const allForms = dashboardData?.forms ?? [];
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return allForms;
    }

    return allForms.filter((form) =>
      form.title.toLowerCase().includes(normalizedQuery),
    );
  }, [dashboardData?.forms, searchQuery]);

  const stats = dashboardData?.stats ?? {
    totalForms: 0,
    totalSubmissions: 0,
    totalViews: 0,
    publishedForms: 0,
    draftForms: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Your Forms</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage and analyze your form collection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 sm:w-64"
            />
          </div>
          <Link
            href="/forms/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>New Form</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Forms",
            value: stats.totalForms,
            icon: FileText,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            label: "Total Submissions",
            value: stats.totalSubmissions,
            icon: Users,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
          },
          {
            label: "Total Views",
            value: stats.totalViews,
            icon: BarChart2,
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
          },
          {
            label: "Published Forms",
            value: stats.publishedForms,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-0.5 text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/forms/new"
          className="group flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/20 bg-white/[0.01] p-8 text-center transition-all hover:border-indigo-500/50 hover:bg-white/[0.03]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-indigo-500/20 group-hover:text-indigo-400">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-medium text-white">Create new form</h3>
            <p className="mt-1 text-sm text-slate-400">Start from scratch or use AI</p>
          </div>
        </Link>

        {forms.map((form) => (
          <div
            key={form._id}
            className="group relative flex min-h-[240px] flex-col justify-between rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 transition-all hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute right-6 top-6">
              <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div>
              <div className="mb-4">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
                    form.status === "published"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {form.status === "published" ? "Live" : "Draft"}
                </span>
              </div>
              <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-white">{form.title}</h3>
              <p className="flex items-center gap-1 text-sm text-slate-500">
                <Clock className="h-3 w-3" />
                Updated {formatDistanceToNow(form.updatedAt, { addSuffix: true })}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Submissions</span>
                  <span className="text-sm font-medium text-white">{form.submissionCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Views</span>
                  <span className="text-sm font-medium text-white">{form.viewCount}</span>
                </div>
              </div>
              <Link
                href={`/forms/${form._id}/edit`}
                className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Edit &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {dashboardData && forms.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-slate-400">
          {searchQuery.trim()
            ? "No forms match your search yet."
            : "No forms in this workspace yet. Start from scratch to create the first draft."}
        </div>
      ) : null}

      {dashboardData?.hasMore ? (
        <p className="text-xs text-slate-500">
          Showing the 50 most recently updated forms for this workspace.
        </p>
      ) : null}
    </div>
  );
}
