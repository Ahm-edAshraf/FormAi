"use client";

import { SignOutButton, useAuth, useOrganization, useUser, UserProfile } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Building2, ExternalLink, LogOut, User } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";

function getInitials(value: string | null | undefined): string {
  return (
    value
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "FA"
  );
}

function getProfileName(userName: string | null | undefined, fallbackEmail: string | null): string {
  return userName?.trim() || fallbackEmail || "FormAI user";
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const { isLoaded: isAuthLoaded, orgId } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { organization } = useOrganization();
  const currentUser = useQuery(api.users.getCurrent, isAuthLoaded ? {} : "skip");
  const workspace = useQuery(
    api.workspaces.getCurrent,
    isAuthLoaded ? { clerkOrgId: orgId ?? null } : "skip",
  );

  if (!isAuthLoaded || !isUserLoaded || currentUser === undefined || workspace === undefined) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-white/10 bg-[#050505] text-sm text-slate-400">
        Loading settings...
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? currentUser?.email ?? null;
  const fullName = getProfileName(user?.fullName ?? currentUser?.name, email);
  const [firstName = "", ...restName] = fullName.split(/\s+/).filter(Boolean);
  const lastName = restName.join(" ");
  const avatarUrl = user?.imageUrl ?? currentUser?.imageUrl ?? undefined;
  const workspaceName = organization?.name ?? workspace?.name ?? "Personal workspace";
  const workspaceKind = workspace?.kind === "organization" ? "Organization workspace" : "Personal workspace";
  const workspaceUpdatedAt = workspace?.updatedAt ?? null;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account and workspace preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {[
              { icon: User, label: "Profile" },
              { icon: Building2, label: "Workspace" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveTab(item.label)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  activeTab === item.label
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            ))}
            <div className="mt-4 border-t border-white/10 pt-4">
              <SignOutButton>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors whitespace-nowrap hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </SignOutButton>
            </div>
          </nav>
        </aside>

        <div className="flex-1 space-y-6">
          {activeTab === "Profile" && (
            <>
              <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                  <button 
                    onClick={() => setActiveTab("Account")}
                    className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-md px-2 py-1"
                  >
                    Manage Account <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border border-white/10 shadow-lg">
                      <AvatarImage src={avatarUrl} alt={fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-xl font-bold text-white">
                        {getInitials(fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white">{fullName}</p>
                      <p className="text-sm text-slate-400">{email ?? "No email available"}</p>
                      <p className="text-xs text-slate-500">
                        Profile details sync from Clerk and are read-only here.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        readOnly
                        className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        readOnly
                        className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={email ?? ""}
                      disabled
                      className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500">Your sign-in email is managed through your identity provider.</p>
                  </div>
                </div>
              </section>

              <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Account deletion is managed by your auth provider.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("Account")}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                >
                  Manage via Clerk
                </button>
              </section>
            </>
          )}

          {activeTab === "Workspace" && (
            <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Workspace</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    readOnly
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Workspace Slug</label>
                  <input
                    type="text"
                    value={workspace?.slug ?? ""}
                    readOnly
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Workspace Type</p>
                  <p className="mt-2 text-sm text-white">{workspaceKind}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Last Synced</p>
                  <p className="mt-2 text-sm text-white">
                    {workspaceUpdatedAt
                      ? formatDistanceToNow(workspaceUpdatedAt, { addSuffix: true })
                      : "Waiting for workspace sync"}
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTab === "Account" && (
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex justify-center bg-[#0A0A0A] p-6">
              <UserProfile 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none w-full",
                    navbar: "hidden",
                    headerTitle: "text-white",
                    headerSubtitle: "text-slate-400",
                    profileSectionTitleText: "text-white",
                    profileSectionPrimaryButton: "text-indigo-400 hover:bg-indigo-500/10",
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
