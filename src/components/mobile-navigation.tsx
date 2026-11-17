"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export function MobileNavigation({ links }: { links: ReadonlyArray<readonly [string, string]> }) {
  const menu = useRef<HTMLDetailsElement>(null);
  return (
    <details ref={menu} className="relative lg:hidden">
      <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-full border [&::-webkit-details-marker]:hidden">
        <Menu aria-hidden="true" className="size-5" /><span className="sr-only">Navigation</span>
      </summary>
      <nav aria-label="Mobile navigation" className="absolute top-full right-0 mt-2 grid w-48 rounded-2xl border bg-card p-2 shadow-lg">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => { if (menu.current) menu.current.open = false; }}>{label}</Link>
        ))}
      </nav>
    </details>
  );
}
