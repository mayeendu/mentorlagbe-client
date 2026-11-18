import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/account-menu";
import { Brand } from "@/components/brand";
import { MobileNavigation } from "@/components/mobile-navigation";
import { buttonVariants } from "@/components/ui/button";
import { getAccountProfile } from "@/lib/dashboard-session";

const links = [
  ["Find Tuition", "/tuitions"],
  ["How It Works", "/#how-it-works"],
  ["Subjects", "/#subjects"],
  ["Pricing", "/#pricing"],
] as const;

async function AccountActions() {
  const profile = await getAccountProfile().catch(() => null);
  if (profile) return <AccountMenu profile={profile} />;
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>Sign in</Link>
      <span className="hidden sm:inline-flex"><Link href="/sign-up" className={buttonVariants()}>Get started</Link></span>
    </div>
  );
}

export function SiteNavbar() {
  return (
    <header className="relative z-20 border-b bg-card">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-1.5 px-3 sm:gap-3 sm:px-8">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex xl:gap-8">
          {links.map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-md text-sm font-medium text-muted-foreground hover:text-primary">{label}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="flex min-w-18 justify-end sm:min-w-44">
            <Suspense fallback={<div role="status" aria-label="Loading account" className="h-9 w-14 rounded-full bg-muted motion-safe:animate-pulse sm:w-44" />}>
              <AccountActions />
            </Suspense>
          </div>
          <MobileNavigation links={links} />
        </div>
      </div>
    </header>
  );
}
