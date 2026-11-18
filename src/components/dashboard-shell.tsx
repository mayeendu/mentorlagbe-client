"use client";

import { ArrowUpRight, BookOpen, BriefcaseBusiness, House, LayoutDashboard, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AccountMenu } from "@/components/account-menu";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import type { AccountProfile } from "@/lib/dashboard-session";
import { cn } from "@/lib/utils";

const roleLinks = {
  student: { label: "Browse subjects", href: "/#subjects", icon: BookOpen },
  tutor: { label: "Browse tuition", href: "/tuitions", icon: BriefcaseBusiness },
  admin: { label: "Recent activity", href: "#activity", icon: ShieldCheck },
};

export function DashboardShell({ profile, children }: { profile: AccountProfile; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const overview = "/dashboard/" + profile.role;
  const links = [
    { label: "Overview", href: overview + "#overview", icon: LayoutDashboard },
    { label: "My profile", href: "/dashboard/profile", icon: UserRound },
    profile.role === "admin" ? { ...roleLinks.admin, href: overview + "#activity" } : roleLinks[profile.role],
    ...(profile.role === "tutor" ? [
      { label: "Post tuition", href: "/dashboard/tutor/post-tuition", icon: BriefcaseBusiness },
      { label: "My tuitions", href: "/dashboard/tutor/my-tuitions", icon: BookOpen },
      { label: "Applicants", href: "/dashboard/tutor/applicants", icon: UserRound },
    ] : []),
    ...(profile.role === "student" ? [{ label: "My applications", href: "/dashboard/student/my-applications", icon: BriefcaseBusiness }] : []),
    ...(profile.role === "admin" ? [
      { label: "Tuition approvals", href: "/dashboard/admin/tuitions", icon: BriefcaseBusiness },
      { label: "Users", href: "/dashboard/admin/users", icon: UserRound },
    ] : []),
    { label: profile.role === "admin" ? "Payments" : "Payment history", href: overview + "/payments", icon: BriefcaseBusiness },
    { label: "Public homepage", href: "/", icon: House },
  ];

  return (
    <div className="min-h-dvh flex-1 bg-muted">
      <header className="flex h-17 items-center justify-between gap-2 border-b bg-card px-3 sm:px-7">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button type="button" variant="outline" size="icon" className="md:hidden" aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"} aria-controls="dashboard-sidebar" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}><Menu aria-hidden="true" /></Button>
          <Button type="button" variant="outline" size="icon" className="max-md:hidden" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-controls="dashboard-sidebar" aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          </Button>
          <Brand />
        </div>
        <AccountMenu profile={profile} />
      </header>
      <div className="md:flex">
        <aside id="dashboard-sidebar" className={cn("border-b bg-card p-3 md:min-h-[calc(100dvh-4.25rem)] md:shrink-0 md:border-r md:border-b-0", mobileOpen ? "block" : "hidden md:block", collapsed ? "md:w-18" : "md:w-60")}>
          <nav aria-label={`${profile.role} dashboard navigation`} className="grid gap-1">
            <p className={cn("px-3 pt-3 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase", collapsed && "md:sr-only")}>{profile.role} workspace</p>
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={pathname === href || (pathname === overview && href === overview + "#overview") ? "page" : undefined} title={collapsed ? label : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground motion-safe:transition-colors hover:bg-muted hover:text-primary", (pathname === href || (pathname === overview && href === overview + "#overview")) && "bg-muted text-primary", collapsed && "md:justify-center md:px-0")}>
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className={collapsed ? "md:sr-only" : undefined}>{label}</span>
                {href.startsWith("/#") && <ArrowUpRight aria-hidden="true" className={cn("ml-auto size-3.5", collapsed && "md:hidden")} />}
              </Link>
            ))}
          </nav>
        </aside>
        <main id="main-content" tabIndex={-1} className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-8 sm:py-9">{children}</main>
      </div>
    </div>
  );
}
