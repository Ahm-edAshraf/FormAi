"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Download, Filter, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  buildResponsesCsv,
  getResponsesCsvFilename,
} from "@/lib/forms/responses-export";

export default function ResponsesPage() {
  const params = useParams<{ formId: string }>();
  const { isLoaded, orgId } = useAuth();
  const formId = params.formId as Id<"forms">;
  const [searchQuery, setSearchQuery] = useState("");
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const responseData = useQuery(
    api.submissions.listForOwner,
    isLoaded ? { formId, clerkOrgId: orgId ?? null } : "skip",
  );

  const submissions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const rows = responseData?.submissions ?? [];

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((submission) =>
      submission.preview.some(
        (cell) =>
          cell.label.toLowerCase().includes(normalizedQuery) ||
          cell.value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [responseData?.submissions, searchQuery]);

  if (responseData === undefined) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-white/10 bg-[#050505] text-sm text-slate-400">
        Loading responses...
      </div>
    );
  }

  const resolvedResponseData = responseData;

  function handleExportCsv() {
    if (!resolvedResponseData.snapshot) {
      setExportError("Publish this form before exporting responses.");
      setExportMessage(null);
      return;
    }

    const csv = buildResponsesCsv({
      fields: resolvedResponseData.snapshot.fields,
      submissions: resolvedResponseData.submissions,
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = getResponsesCsvFilename(resolvedResponseData.form.title);
    link.click();
    window.URL.revokeObjectURL(objectUrl);
    setExportError(null);
    setExportMessage(
      resolvedResponseData.submissions.length > 0
        ? `Downloaded ${resolvedResponseData.submissions.length} responses as CSV.`
        : "Downloaded an empty CSV with the current form fields.",
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Responses</h1>
            <p className="text-sm text-slate-400 mt-1">{responseData.form.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-black transition-transform hover:scale-105"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {exportMessage || exportError ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            exportError
              ? "border-red-500/20 bg-red-500/5 text-red-300"
              : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
          }`}
        >
          {exportError ?? exportMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <p className="text-sm text-slate-400">Total Responses</p>
          <p className="text-3xl font-semibold text-white mt-2">{responseData.stats.totalResponses}</p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <p className="text-sm text-slate-400">Conversion Rate</p>
          <p className="text-3xl font-semibold text-emerald-400 mt-2">
            {responseData.stats.conversionRate === null
              ? "--"
              : `${responseData.stats.conversionRate}%`}
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <p className="text-sm text-slate-400">Published Snapshot</p>
          <p className="text-3xl font-semibold text-indigo-400 mt-2">
            {responseData.snapshot ? `v${responseData.snapshot.version}` : "--"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search responses..." 
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-9 w-64 rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/[0.02] text-xs uppercase text-slate-500 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                {(responseData.snapshot?.fields ?? []).slice(0, 3).map((field) => (
                  <th key={field.fieldKey} className="px-6 py-4 font-medium">
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {submissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}
                  </td>
                  {submission.preview.map((cell) => (
                    <td key={cell.fieldKey} className="px-6 py-4 max-w-xs truncate">
                      {cell.type === "rating" ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-emerald-400">{cell.value}</span>
                        </div>
                      ) : (
                        cell.value
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={(responseData.snapshot?.fields ?? []).slice(0, 3).length + 2}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    {responseData.snapshot
                      ? "No real responses yet for this form."
                      : "Publish the form to start collecting responses."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing {submissions.length} of {responseData.stats.totalResponses} responses
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-md hover:bg-white/5 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded-md hover:bg-white/5 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
