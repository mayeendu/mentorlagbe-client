import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardSkeleton } from "@/components/loading-skeletons";
import { requireDashboardRole } from "@/lib/dashboard-session";

async function DashboardRedirect(): Promise<never> {
  redirect(`/dashboard/${await requireDashboardRole()}`);
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardRedirect />
    </Suspense>
  );
}
