"use client";

import { ArrowLeft, Download, Filter, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";

const mockResponses = [
  { id: "1", role: "Software Engineer", liked: "The AI generation is incredibly fast.", rating: 9, date: "10 mins ago" },
  { id: "2", role: "Product Manager", liked: "Clean UI and immutable snapshots.", rating: 10, date: "2 hours ago" },
  { id: "3", role: "Designer", liked: "The dark mode aesthetic is stunning.", rating: 8, date: "5 hours ago" },
  { id: "4", role: "Founder / Executive", liked: "Saves my team hours of work.", rating: 10, date: "1 day ago" },
];

export default function ResponsesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Responses</h1>
            <p className="text-sm text-slate-400 mt-1">Customer Research Intake</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-black transition-transform hover:scale-105">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <p className="text-sm text-slate-400">Total Responses</p>
          <p className="text-3xl font-semibold text-white mt-2">142</p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <p className="text-sm text-slate-400">Completion Rate</p>
          <p className="text-3xl font-semibold text-emerald-400 mt-2">68%</p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0A0A0A]">
          <p className="text-sm text-slate-400">Avg. Rating</p>
          <p className="text-3xl font-semibold text-indigo-400 mt-2">9.2</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search responses..." 
              className="h-9 w-64 rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/[0.02] text-xs uppercase text-slate-500 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Feedback</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockResponses.map((res) => (
                <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">{res.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {res.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">{res.liked}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-emerald-400">{res.rating}</span>
                      <span className="text-slate-600">/ 10</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-500">
          <span>Showing 1 to 4 of 142 entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-md hover:bg-white/5 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded-md hover:bg-white/5">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
