"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Download, Filter, MoreHorizontal, Search, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getSafeActionMessage } from "@/lib/client-errors";
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
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  /** UI-only; real date filtering needs backend query support */
  const [filterPreset, setFilterPreset] = useState<"all" | "7d" | "30d">("all");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const deleteSubmission = useMutation(api.submissions.deleteForOwner);
  
  const responseData = useQuery(
    api.submissions.listForOwner,
    isLoaded ? { formId, clerkOrgId: orgId ?? null, dateRange: filterPreset } : "skip",
  );
  const analytics = useQuery(
    api.analytics.getOverview,
    isLoaded ? { formId, clerkOrgId: orgId ?? null, range: filterPreset } : "skip",
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSubmissions = useMemo(() => {
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

  // Pagination logic
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const resolvedCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const paginatedSubmissions = useMemo(() => {
    const start = (resolvedCurrentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(start, start + itemsPerPage);
  }, [filteredSubmissions, resolvedCurrentPage]);

  const selectedSubmission = useMemo(() => {
    if (!selectedSubmissionId) return null;
    return responseData?.submissions.find(s => s._id === selectedSubmissionId) || null;
  }, [selectedSubmissionId, responseData?.submissions]);

  const selectedSubmissionIndex = useMemo(() => {
    if (!selectedSubmissionId) return -1;
    return filteredSubmissions.findIndex(s => s._id === selectedSubmissionId);
  }, [selectedSubmissionId, filteredSubmissions]);

  const handleNextSubmission = () => {
    if (selectedSubmissionIndex < filteredSubmissions.length - 1) {
      setSelectedSubmissionId(filteredSubmissions[selectedSubmissionIndex + 1]._id);
    }
  };

  const handlePrevSubmission = () => {
    if (selectedSubmissionIndex > 0) {
      setSelectedSubmissionId(filteredSubmissions[selectedSubmissionIndex - 1]._id);
    }
  };

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
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Submission Detail Drawer Overlay */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-0 sm:p-2"
          role="presentation"
          onClick={() => setSelectedSubmissionId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="response-drawer-title"
            className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0A0A0A] shadow-2xl animate-in slide-in-from-right duration-300 sm:rounded-l-2xl sm:border"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-6">
              <div>
                <h3 id="response-drawer-title" className="text-lg font-semibold text-white">
                  Response details
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Submitted {formatDistanceToNow(selectedSubmission.submittedAt, { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-1 mr-2">
                  <button
                    type="button"
                    onClick={handlePrevSubmission}
                    disabled={selectedSubmissionIndex <= 0}
                    className="app-focus min-h-9 min-w-9 rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-mono px-2 text-slate-500">
                    {selectedSubmissionIndex + 1} / {filteredSubmissions.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextSubmission}
                    disabled={selectedSubmissionIndex >= filteredSubmissions.length - 1}
                    className="app-focus min-h-9 min-w-9 rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionId(null)}
                  className="app-focus rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
              {responseData.snapshot?.fields.map((field) => {
                const answer = selectedSubmission.answers[field.fieldKey];
                return (
                  <div key={field.fieldKey} className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-white">
                      {answer !== undefined && answer !== null && answer !== "" ? (
                        field.type === "rating" ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-400 text-lg">{answer}</span>
                            <span className="text-slate-500">/ 10</span>
                          </div>
                        ) : (
                          String(answer)
                        )
                      ) : (
                        <span className="text-slate-600 italic">No answer provided</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Responses</h1>
            <p className="text-sm text-slate-400 mt-1">{responseData.form.title}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${showFilter ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-full sm:w-64 rounded-xl border border-white/10 bg-[#111] p-4 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-100">
                <h4 className="text-sm font-medium text-white mb-3">Filter Responses</h4>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Date Range</label>
                    <select
                      value={filterPreset}
                      onChange={(event) =>
                        setFilterPreset(event.target.value as "all" | "7d" | "30d")
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <option value="all">All time</option>
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                    </select>
                  </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFilter(false);
                        setActionMessage(
                          `Showing ${
                            filterPreset === "all"
                              ? "all time"
                              : filterPreset === "7d"
                                ? "the last 7 days"
                                : "the last 30 days"
                          } of responses.`,
                        );
                        setTimeout(() => setActionMessage(null), 5000);
                      }}
                    className="app-focus mt-2 h-9 w-full rounded-lg bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-400"
                  >
                    Apply filters
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-black transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {exportMessage || exportError ? (
        <div
          className={
            exportError ? "msg-error text-sm" : "msg-success text-sm"
          }
        >
          {exportError ?? exportMessage}
        </div>
      ) : null}

      {actionMessage ? (
        <p className="msg-warning text-sm" role="status">
          {actionMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <p className="text-sm text-slate-400">Total Responses</p>
          <p className="text-3xl font-semibold text-white mt-2">{analytics?.stats.submissions ?? responseData.stats.totalResponses}</p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <p className="text-sm text-slate-400">Conversion Rate</p>
          <p className="text-3xl font-semibold text-emerald-400 mt-2">
            {(analytics?.stats.completionRate ?? responseData.stats.conversionRate) === null
              ? "--"
              : `${analytics?.stats.completionRate ?? responseData.stats.conversionRate}%`}
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
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-full min-w-0 max-w-md rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
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
              {paginatedSubmissions.map((submission) => (
                <tr 
                  key={submission._id} 
                  onClick={() => setSelectedSubmissionId(submission._id)}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
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
                  <td className="relative px-6 py-4 text-right">
                    <div ref={openMenuId === submission._id ? menuRef : undefined} className="relative inline-block text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === submission._id ? null : submission._id);
                      }}
                      className="app-focus rounded-md p-1.5 text-slate-400 hover:bg-white/10"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenuId === submission._id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl border border-white/10 bg-[#111] p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmissionId(submission._id);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          View Details
                        </button>
                        <div className="my-1 h-px bg-white/10" />
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            try {
                              await deleteSubmission({
                                submissionId: submission._id as Id<"submissions">,
                                clerkOrgId: orgId ?? null,
                              });
                              if (selectedSubmissionId === submission._id) {
                                setSelectedSubmissionId(null);
                              }
                              toast.success("Response deleted.");
                            } catch (error) {
                              toast.error(getSafeActionMessage(error, "We couldn’t delete this response."));
                            }
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={(responseData.snapshot?.fields ?? []).slice(0, 3).length + 2}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    {responseData.snapshot
                      ? searchQuery.trim() ? "No responses match your search." : "No real responses yet for this form."
                      : "Publish the form to start collecting responses."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing {paginatedSubmissions.length > 0 ? (resolvedCurrentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(resolvedCurrentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} responses
            {searchQuery.trim() && ` (filtered from ${responseData.stats.totalResponses})`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={resolvedCurrentPage === 1}
              className="app-focus min-h-9 rounded-md px-3 py-1.5 hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={resolvedCurrentPage === totalPages || totalPages === 0}
              className="app-focus min-h-9 rounded-md px-3 py-1.5 hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
