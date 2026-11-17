import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountAvatar } from "@/components/account-menu";
import { DashboardSkeleton } from "@/components/loading-skeletons";
import { buttonVariants } from "@/components/ui/button";
import { dashboardTitles, requireDashboardProfile } from "@/lib/dashboard-session";

const overview = {
  student: { description: "Explore subjects and compare home and online tuition options.", label: "Browse subjects", href: "/#subjects" },
  tutor: { description: "Explore the tuition preview and see how subjects, schedules, and rates are displayed.", label: "Browse tuition", href: "/#tuition" },
  admin: { description: "Review the access level attached to your account.", label: "View access summary", href: "#access" },
};

async function Dashboard({ params }: PageProps<"/dashboard/[role]">) {
  const [requested, profile] = await Promise.all([params, requireDashboardProfile()]);
  const { role, name, email, plan } = profile;
  if (requested.role !== role) redirect(`/dashboard/${role}`);
  const nextStep = overview[role];

  return (
    <div className="grid gap-5">
      <section id="overview" className="rounded-3xl bg-[#2e194c] p-6 text-white sm:p-9">
        <h1 className="text-3xl font-bold tracking-[-0.05em] sm:text-4xl">{dashboardTitles[role]}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#e5d8fa] sm:text-base">{nextStep.description}</p>
        <Link href={nextStep.href} className={buttonVariants({ variant: "outline", className: "mt-5 border-none bg-white text-[#2e194c]" })}>
          {nextStep.label}<ArrowRight aria-hidden="true" />
        </Link>
      </section>
      <section id="profile" className="min-w-0 rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="mb-5 text-xl font-bold tracking-tight">Profile summary</h2>
        <div className="flex min-w-0 items-center gap-3">
          <AccountAvatar name={name} />
          <div className="min-w-0">
            <p className="break-words font-semibold">{name}</p>
            {email && <p className="break-all text-sm text-muted-foreground">{email}</p>}
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t pt-5 text-sm">
          <div><dt className="text-muted-foreground">Role</dt><dd className="mt-1 font-semibold capitalize">{role}</dd></div>
          <div><dt className="text-muted-foreground">Plan</dt><dd className="mt-1 font-semibold capitalize">{plan}</dd></div>
        </dl>
      </section>
      {role === "admin" && (
        <section id="access" className="rounded-3xl border bg-card p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight"><ShieldCheck aria-hidden="true" className="size-5 text-primary" /> Access summary</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your current account has Admin access.</p>
        </section>
      )}
    </div>
  );
}

export default function RoleDashboardPage(props: PageProps<"/dashboard/[role]">) {
  return <Suspense fallback={<DashboardSkeleton />}><Dashboard {...props} /></Suspense>;
}
