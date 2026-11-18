import { redirect } from "next/navigation";
import { AdminOverview } from "@/components/admin-overview";
import { requireDashboardRole } from "@/lib/dashboard-session";

export default async function AdminDashboardPage() {
  if (await requireDashboardRole() !== "admin") redirect("/dashboard");
  return <AdminOverview />;
}
