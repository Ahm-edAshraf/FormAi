"use client";

import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useMemo, useRef } from "react";

import { api } from "@/convex/_generated/api";

function getDisplayName(value: string | null | undefined): string {
  return value?.trim() || "Personal workspace";
}

export function SessionSync() {
  const { isLoaded: isAuthLoaded, orgId, userId } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { organization } = useOrganization();
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const syncActiveWorkspace = useMutation(api.workspaces.syncActiveWorkspace);
  const lastSynced = useRef<string | null>(null);

  const payload = useMemo(() => {
    if (!user) {
      return null;
    }

    const email = user.primaryEmailAddress?.emailAddress ?? null;
    const name = user.fullName ?? user.username ?? null;
    const imageUrl = user.imageUrl ?? null;

    if (orgId && organization) {
      return {
        user: {
          email,
          name,
          imageUrl,
          clerkOrgId: orgId,
        },
        workspace: {
          clerkOrgId: orgId,
          name: getDisplayName(organization.name),
          slug: organization.slug ?? null,
          imageUrl: organization.imageUrl ?? null,
          email,
        },
      };
    }

    return {
      user: {
        email,
        name,
        imageUrl,
        clerkOrgId: null,
      },
      workspace: {
        clerkOrgId: null,
        name: getDisplayName(name ?? email),
        slug: user.username ?? user.id,
        imageUrl,
        email,
      },
    };
  }, [orgId, organization, user]);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded || !userId || !payload) {
      return;
    }

    const syncKey = JSON.stringify({ userId, payload });

    if (lastSynced.current === syncKey) {
      return;
    }

    lastSynced.current = syncKey;

    void (async () => {
      try {
        await syncCurrentUser(payload.user);
        await syncActiveWorkspace(payload.workspace);
      } catch (error) {
        console.error("Failed to sync Clerk session", error);
        lastSynced.current = null;
      }
    })();
  }, [isAuthLoaded, isUserLoaded, payload, syncActiveWorkspace, syncCurrentUser, userId]);

  return null;
}
