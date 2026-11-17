import { Suspense, type ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardSkeleton } from "@/components/loading-skeletons";
import { requireDashboardProfile } from "@/lib/dashboard-session";

async function ProtectedDashboard({ children }: { children: ReactNode }) {
  const profile = await requireDashboardProfile();
  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ProtectedDashboard>{children}</ProtectedDashboard>
    </Suspense>
  );
}
