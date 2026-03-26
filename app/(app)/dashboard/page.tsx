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
  Archive,
  Trash2,
  ExternalLink,
  Edit2
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { getSafeActionMessage } from "@/lib/client-errors";

export default function DashboardPage() {
  const { isLoaded, orgId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const archiveForm = useMutation(api.forms.archive);
  const deleteForm = useMutation(api.forms.deleteForm);

  const dashboardData = useQuery(
    api.forms.getDashboardData,
    isLoaded ? { clerkOrgId: orgId ?? null } : "skip",
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
  const hasAnyForms = (dashboardData?.forms.length ?? 0) > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Your Forms</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage and analyze your form collection.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 transition-all focus:border-indigo-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 sm:w-64"
            />
          </div>
          {hasAnyForms ? (
            <Link
              href="/forms/new"
              className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
            >
              <Plus className="h-4 w-4" />
              <span>New Form</span>
            </Link>
          ) : null}
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
        {forms.map((form) => (
          <div
            key={form._id}
            className="group relative flex min-h-[240px] flex-col justify-between rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 transition-all hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] focus-within:ring-2 focus-within:ring-indigo-500"
          >
            <div className="absolute right-6 top-6" ref={openMenuId === form._id ? menuRef : null}>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setOpenMenuId(openMenuId === form._id ? null : form._id);
                }}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {openMenuId === form._id && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#111] p-1 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-100">
                  <Link href={`/forms/${form._id}/edit`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <Edit2 className="h-4 w-4" /> Edit Form
                  </Link>
                  <Link href={`/forms/${form._id}/responses`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <Users className="h-4 w-4" /> View Responses
                  </Link>
                  <Link href={`/forms/${form._id}/analytics`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <BarChart2 className="h-4 w-4" /> View Analytics
                  </Link>
                  {form.status === "published" && (
                    <a href={`/f/${form.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                      <ExternalLink className="h-4 w-4" /> Open Public Link
                    </a>
                  )}
                  <div className="my-1 h-px bg-white/10" />
                    <button
                      type="button"
                      onClick={async () => {
                        setOpenMenuId(null);
                        try {
                          await archiveForm({ formId: form._id, clerkOrgId: orgId ?? null });
                          toast.success(`Archived “${form.title}”.`);
                        } catch (error) {
                          toast.error(getSafeActionMessage(error, "We couldn’t archive this form."));
                        }
                      }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <Archive className="h-4 w-4" /> Archive
                  </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setOpenMenuId(null);
                        try {
                          await deleteForm({ formId: form._id, clerkOrgId: orgId ?? null });
                          toast.success(`Deleted “${form.title}”.`);
                        } catch (error) {
                          toast.error(getSafeActionMessage(error, "We couldn’t delete this form."));
                        }
                      }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              )}
            </div>

            <Link href={`/forms/${form._id}/edit`} className="block focus-visible:outline-none">
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
            </Link>

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
                href={`/forms/${form._id}/responses`}
                className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300 focus-visible:outline-none focus-visible:underline"
              >
                Responses &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {dashboardData && forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] py-20 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
            {searchQuery.trim() ? (
              <Search className="h-8 w-8 text-slate-400" />
            ) : (
              <FileText className="h-8 w-8 text-slate-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
             {searchQuery.trim() ? "No forms found" : "No forms yet"}
           </h3>
           <p className="text-sm text-slate-400 max-w-sm mb-6">
             {searchQuery.trim()
               ? `We couldn't find any forms matching "${searchQuery}". Try a different search term.`
               : "You haven't created any forms in this workspace yet. Create your first form to start collecting responses."}
            </p>
          {!searchQuery.trim() && (
            <Link
              href="/forms/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
            >
              <Plus className="h-4 w-4" />
              <span>Create your first form</span>
            </Link>
          )}
        </div>
      ) : null}

      {dashboardData?.hasMore ? (
        <p className="text-xs text-slate-500 text-center pt-4">
          Showing the 50 most recently updated forms for this workspace.
        </p>
      ) : null}
    </div>
  );
}
