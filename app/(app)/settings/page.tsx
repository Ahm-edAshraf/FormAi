"use client";

import { User, Building2, CreditCard, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account and workspace preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {[
              { icon: User, label: "Profile", active: true },
              { icon: Building2, label: "Workspace", active: false },
              { icon: CreditCard, label: "Billing", active: false },
              { icon: Bell, label: "Notifications", active: false },
              { icon: Shield, label: "Security", active: false },
              { icon: Key, label: "API Keys", active: false },
            ].map((item, i) => (
              <button
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active 
                    ? "bg-white/10 text-white" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Section */}
          <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  JD
                </div>
                <div className="space-x-3">
                  <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                    Upload new
                  </button>
                  <button className="px-4 py-2 rounded-lg text-slate-400 text-sm font-medium hover:text-white transition-colors">
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">First Name</label>
                  <input 
                    type="text" 
                    defaultValue="John"
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Last Name</label>
                  <input 
                    type="text" 
                    defaultValue="Doe"
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="john@example.com"
                  disabled
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">Your email address is managed through your identity provider.</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button className="px-6 py-2 rounded-lg bg-white text-black text-sm font-medium hover:scale-105 transition-transform">
                Save Changes
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-slate-400 mb-6">Permanently delete your account and all associated data.</p>
            <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-colors">
              Delete Account
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
