import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/account-menu";
import { Brand } from "@/components/brand";
import { MobileNavigation } from "@/components/mobile-navigation";
import { buttonVariants } from "@/components/ui/button";
import { getAccountProfile } from "@/lib/dashboard-session";

const links = [
  ["Find Tuition", "/#tuition"],
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
      <Link href="/sign-up" className={buttonVariants({ className: "hidden sm:inline-flex" })}>Get started</Link>
    </div>
  );
}

export function SiteNavbar() {
  return (
    <header className="relative z-20 border-b bg-background">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex xl:gap-8">
          {links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-medium text-muted-foreground hover:text-primary">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Suspense fallback={<div aria-label="Loading account" className="h-9 w-20 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />}>
            <AccountActions />
          </Suspense>
          <MobileNavigation links={links} />
        </div>
      </div>
    </header>
  );
}
