import { redirect } from "next/navigation";
import { AdminTuitions } from "@/components/admin-tuitions";
import { requireDashboardRole } from "@/lib/dashboard-session";

export default async function AdminTuitionsPage() {
  if (await requireDashboardRole() !== "admin") redirect("/dashboard");
  return <AdminTuitions />;
}
