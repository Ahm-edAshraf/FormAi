"use client";

import { useAuth, useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { ChevronsUpDown, LoaderCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WorkspaceOption = {
  value: string;
  name: string;
  imageUrl: string | null;
  meta: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "WS";
}

export function WorkspaceSwitcher() {
  const { orgId } = useAuth();
  const { organization } = useOrganization();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: true,
  });

  if (!isUserLoaded || !user || !isLoaded) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading workspace
      </div>
    );
  }

  const personalOption: WorkspaceOption = {
    value: "personal",
    name: user.fullName ?? user.username ?? "Personal workspace",
    imageUrl: user.imageUrl ?? null,
    meta: "Personal",
  };

  const organizationOptions: WorkspaceOption[] =
    userMemberships.data?.map((membership) => ({
      value: membership.organization.id,
      name: membership.organization.name,
      imageUrl: membership.organization.imageUrl ?? null,
      meta: membership.role.replace("org:", ""),
    })) ?? [];

  const selectedValue = orgId ?? "personal";
  const selectedOption =
    (selectedValue === "personal"
      ? personalOption
      : organizationOptions.find((option) => option.value === selectedValue)) ??
    (organization
      ? {
          value: organization.id,
          name: organization.name,
          imageUrl: organization.imageUrl ?? null,
          meta: "Organization",
        }
      : personalOption);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Workspace
      </span>
      <Select
        value={selectedValue}
        onValueChange={(nextValue) => {
          void setActive?.({ organization: nextValue === "personal" ? null : nextValue });
        }}
      >
        <SelectTrigger className="h-auto min-w-[16rem] justify-between gap-3 rounded-xl border-border/70 bg-background px-3 py-2.5">
          <SelectValue>
            <span className="flex min-w-0 items-center gap-3">
              <Avatar size="sm">
                <AvatarImage src={selectedOption.imageUrl ?? undefined} alt={selectedOption.name} />
                <AvatarFallback>{getInitials(selectedOption.name)}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col items-start text-left">
                <span className="truncate text-sm font-medium text-foreground">
                  {selectedOption.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {selectedOption.meta}
                </span>
              </span>
            </span>
          </SelectValue>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </SelectTrigger>
        <SelectContent align="start" className="min-w-[16rem]">
          <SelectItem value={personalOption.value}>{personalOption.name}</SelectItem>
          {organizationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
