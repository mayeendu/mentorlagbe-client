import { ChevronDown, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import type { AccountProfile } from "@/lib/dashboard-session";

export function AccountAvatar({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase();
  return (
    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eee6ff] text-xs font-bold text-[#5629b7]">
      {initials}
    </span>
  );
}

export function AccountMenu({ profile }: { profile: AccountProfile }) {
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border bg-card p-1 pr-2 [&::-webkit-details-marker]:hidden">
        <AccountAvatar name={profile.name} />
        <span className="sr-only">Account menu for {profile.name}</span>
        <span aria-hidden="true" className="hidden max-w-28 truncate text-sm font-semibold sm:inline">{profile.name}</span>
        <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
      </summary>
      <div className="absolute top-full right-0 z-30 mt-2 w-56 rounded-2xl border bg-card p-2 shadow-lg">
        <div className="border-b px-3 py-2">
          <p className="truncate text-sm font-semibold">{profile.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
        </div>
        <Link className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" href={`/dashboard/${profile.role}`}>
          <LayoutDashboard aria-hidden="true" className="size-4" /> Dashboard
        </Link>
        <SignOutButton />
      </div>
    </details>
  );
}
