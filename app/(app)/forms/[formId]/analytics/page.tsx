"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowLeft, BarChart2, Clock, Download, MousePointerClick, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

function buildAnalyticsCsv(series: Array<{ date: string; views: number; starts: number; submissions: number }>) {
  return [
    ["Date", "Views", "Starts", "Submissions"].join(","),
    ...series.map((row) => [row.date, row.views, row.starts, row.submissions].join(",")),
  ].join("\n");
}

export default function AnalyticsPage() {
  const params = useParams<{ formId: string }>();
  const { isLoaded, orgId } = useAuth();
  const formId = params.formId as Id<"forms">;
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "all">("7d");
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const analytics = useQuery(
    api.analytics.getOverview,
    isLoaded ? { formId, clerkOrgId: orgId ?? null, range: dateRange } : "skip",
  );

  const chartData = useMemo(() => analytics?.series ?? [], [analytics?.series]);
  const maxValue = useMemo(() => {
    const peak = chartData.reduce((max, item) => Math.max(max, item.views, item.submissions), 0);
    return Math.max(peak, 1);
  }, [chartData]);

  const handleExport = () => {
    if (!analytics) {
      return;
    }

    const csv = buildAnalyticsCsv(analytics.series);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${analytics.form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "form"}-analytics.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    setExportMessage(`Downloaded ${analytics.series.length} analytics rows.`);
    window.setTimeout(() => setExportMessage(null), 4000);
  };

  if (analytics === undefined) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-white/10 bg-[#050505] text-sm text-slate-400">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="app-focus -ml-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
            <p className="mt-1 text-sm text-slate-400">{analytics.form.title}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0A0A0A] p-1 overflow-x-auto scrollbar-hide">
            {([
              ["7d", "7 Days"],
              ["30d", "30 Days"],
              ["all", "All Time"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDateRange(value)}
                className={`app-focus whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  dateRange === value ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="app-focus inline-flex h-9 min-h-9 min-w-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            title="Export analytics CSV"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {exportMessage ? <p className="msg-success text-sm">{exportMessage}</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Views",
            value: analytics.stats.views,
            icon: MousePointerClick,
            valueClassName: "text-white",
            iconClassName: "text-blue-400",
          },
          {
            label: "Submission Starts",
            value: analytics.stats.starts,
            icon: Users,
            valueClassName: "text-white",
            iconClassName: "text-indigo-400",
          },
          {
            label: "Completion Rate",
            value:
              analytics.stats.completionRate === null ? "--" : `${analytics.stats.completionRate}%`,
            icon: BarChart2,
            valueClassName: "text-emerald-400",
            iconClassName: "text-emerald-400",
          },
          {
            label: "Avg. Time to Complete",
            value: analytics.stats.avgTime ?? "--",
            icon: Clock,
            valueClassName: "text-white",
            iconClassName: "text-amber-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 group">
            <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <stat.icon className={`h-16 w-16 ${stat.iconClassName}`} />
            </div>
            <p className="relative z-10 text-sm font-medium text-slate-400">{stat.label}</p>
            <p className={`relative z-10 mt-2 text-4xl font-bold ${stat.valueClassName}`}>{stat.value}</p>
            <p className="relative z-10 mt-4 text-xs text-slate-500">Range: {dateRange === "all" ? "all time" : dateRange}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Conversion Funnel</h3>
            <p className="text-sm text-slate-400">Views and submissions over time</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-blue-500 bg-blue-500/20" />
              <span className="text-slate-400">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-indigo-500 bg-indigo-500/20" />
              <span className="text-slate-400">Submissions</span>
            </div>
          </div>
        </div>

        <div className="relative flex h-72 w-full items-end justify-between gap-2 pt-4">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-px w-full bg-white/5" />
            ))}
          </div>

          {chartData.length === 0 ? (
            <div className="relative z-10 flex h-full w-full items-center justify-center text-sm text-slate-500">
              No analytics events yet for this range.
            </div>
          ) : (
            chartData.map((point) => {
              const viewHeight = (point.views / maxValue) * 100;
              const submissionHeight = (point.submissions / maxValue) * 100;

              return (
                <div key={point.date} className="relative z-10 flex h-full flex-1 flex-col items-center justify-end gap-2 group">
                  <div className="pointer-events-none absolute -top-12 opacity-0 transition-opacity group-hover:opacity-100 bg-[#111] border border-white/10 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl z-20">
                    <p className="mb-1 font-medium text-white">{point.label}</p>
                    <p className="text-blue-400">{point.views} views</p>
                    <p className="text-indigo-400">{point.submissions} submissions</p>
                  </div>

                  <div className="flex h-full w-full max-w-[40px] items-end justify-center gap-1">
                    <div
                      className="w-full rounded-t-sm border-t-2 border-blue-500 bg-blue-500/20 transition-all duration-500 group-hover:bg-blue-500/30"
                      style={{ height: `${viewHeight}%` }}
                    />
                    <div
                      className="w-full rounded-t-sm border-t-2 border-indigo-400 bg-indigo-500/40 transition-all duration-500 group-hover:bg-indigo-500/60"
                      style={{ height: `${submissionHeight}%` }}
                    />
                  </div>
                  <span className="mt-2 text-xs text-slate-500">{point.label.split(" ")[1] ?? point.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
