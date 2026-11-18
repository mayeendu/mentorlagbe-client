"use client";

import Image from "next/image";
import { ChevronDown, LayoutDashboard, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDisclosure } from "@/components/use-disclosure";
import { useProfileIdentity } from "@/components/profile-identity";
import { SignOutButton } from "@/components/sign-out-button";
import type { AccountProfile } from "@/lib/dashboard-session";

export function AccountAvatar({ name, image, large = false }: { name: string; image?: string | null; large?: boolean }) {
  const size = large ? 64 : 36;
  const [failed, setFailed] = useState<string | null>(null);
  if (image?.startsWith("https://i.ibb.co/") && image !== failed) {
    return <Image unoptimized src={image} alt="" width={size} height={size} onError={() => setFailed(image)} className={"shrink-0 rounded-full object-cover " + (large ? "size-16" : "size-9")} />;
  }
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase();
  return (
    <span aria-hidden="true" className={"grid shrink-0 place-items-center rounded-full bg-[#eee6ff] text-xs font-bold text-[#5629b7] " + (large ? "size-16" : "size-9")}>
      {initials || <UserRound aria-hidden="true" className="size-4" />}
    </span>
  );
}

export function AccountMenu({ profile }: { profile: AccountProfile }) {
  const { disclosure, close } = useDisclosure();
  const { updated } = useProfileIdentity();
  const identity = updated && updated.id === profile.id ? updated : profile;
  return (
    <details {...disclosure} className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border bg-card p-1 pr-2 [&::-webkit-details-marker]:hidden">
        <AccountAvatar name={identity.name} image={identity.image} />
        <span className="sr-only">Account menu for {identity.name}</span>
        <span aria-hidden="true" className="hidden max-w-28 truncate text-sm font-semibold sm:inline">{identity.name}</span>
        <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
      </summary>
      <div className="absolute top-full right-0 z-30 mt-2 w-56 rounded-2xl border bg-card p-2 shadow-lg">
        <div className="border-b px-3 py-2">
          <p className="truncate text-sm font-semibold">{identity.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
        </div>
        <Link onClick={close} className="mt-1 flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted" href={`/dashboard/${profile.role}`}>
          <LayoutDashboard aria-hidden="true" className="size-4" /> Dashboard
        </Link>
        <Link onClick={close} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted" href="/dashboard/profile">
          <UserRound aria-hidden="true" className="size-4" /> My profile
        </Link>
        <SignOutButton />
      </div>
    </details>
  );
}
