"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useDisclosure } from "@/components/use-disclosure";

export function MobileNavigation({ links }: { links: ReadonlyArray<readonly [string, string]> }) {
  const { disclosure, close } = useDisclosure();
  return (
    <details {...disclosure} className="relative lg:hidden">
      <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full border [&::-webkit-details-marker]:hidden">
        <Menu aria-hidden="true" className="size-5" /><span className="sr-only">Navigation</span>
      </summary>
      <nav aria-label="Mobile navigation" className="absolute top-full right-0 mt-2 grid w-48 rounded-2xl border bg-card p-2 shadow-lg">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="flex min-h-11 items-center rounded-lg px-3 text-sm hover:bg-muted" onClick={close}>{label}</Link>
        ))}
      </nav>
    </details>
  );
}
