import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";

const groups = [
  {
    label: "Explore",
    links: [
      { href: "/#tuition", label: "Featured tuitions" },
      { href: "/#subjects", label: "Subject categories" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#pricing", label: "Plans and pricing" },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Create an account" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/profile", label: "My profile" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#573781] bg-linear-to-br from-[#25123e] via-[#342054] to-[#483069] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-8 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12 md:py-14">
          <div className="space-y-4">
            <Brand inverse />
            <p className="max-w-xs text-sm leading-relaxed text-[#eadcf7]">
              Find home and online tuition in Bangladesh.
            </p>
            <Link href="/tuitions" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold motion-safe:transition-colors hover:bg-white/12 focus-visible:outline-white">
              Browse tuitions <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-5 sm:gap-8">
            {groups.map(({ label, links }) => (
              <div key={label} className="min-w-0">
                <p className="border-b border-white/20 pb-3 text-sm font-semibold">{label}</p>
                <ul className="mt-2 space-y-1">
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="inline-flex min-h-10 items-center rounded-md text-sm leading-snug text-[#eadcf7] underline-offset-4 motion-safe:transition-colors hover:text-white hover:underline focus-visible:outline-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/20 py-5 text-xs text-[#eadcf7]">© MentorLagbe</div>
      </div>
    </footer>
  );
}
