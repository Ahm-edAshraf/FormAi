"use client";

import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { LoaderCircle, ShieldAlert } from "lucide-react";

import { SessionSync } from "@/components/dashboard/session-sync";
import { api } from "@/convex/_generated/api";

export function ConvexAuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { isLoaded: isClerkLoaded, orgId } = useAuth();
  const currentUser = useQuery(api.users.getCurrent, isAuthenticated ? {} : "skip");
  const currentWorkspace = useQuery(
    api.workspaces.getCurrent,
    isAuthenticated && isClerkLoaded ? { clerkOrgId: orgId ?? null } : "skip",
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="surface-panel flex w-full max-w-md flex-col items-center gap-4 px-8 py-10 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
            <LoaderCircle className="h-7 w-7 animate-spin text-indigo-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Connecting your workspace</h2>
            <p className="text-sm leading-6 text-slate-400">
              Waiting for Clerk and Convex to finish their authenticated session handshake.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="surface-panel flex w-full max-w-2xl flex-col gap-5 px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
              <ShieldAlert className="h-7 w-7 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">We couldn&apos;t finish signing you in</h2>
              <p className="mt-1 text-sm text-slate-400">
                Your session was created, but the app backend is not ready to use it yet.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
            Please refresh the page or sign out and sign back in. If the problem continues, the app operator may need to finish the authentication integration.
          </div>
        </div>
      </div>
    );
  }

  const isSyncPending =
    !isClerkLoaded ||
    currentUser === undefined ||
    currentWorkspace === undefined ||
    currentUser === null ||
    currentWorkspace === null;

  if (isSyncPending) {
    return (
      <>
        <SessionSync />
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="surface-panel flex w-full max-w-md flex-col items-center gap-4 px-8 py-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
              <LoaderCircle className="h-7 w-7 animate-spin text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Preparing your workspace</h2>
              <p className="text-sm leading-6 text-slate-400">
                Finalizing your account, workspace, and dashboard access.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SessionSync />
      {children}
    </>
  );
}
