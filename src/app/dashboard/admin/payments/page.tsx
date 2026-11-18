import { redirect } from "next/navigation";
import { AdminDirectory } from "@/components/admin-directory";
import { requireDashboardRole } from "@/lib/dashboard-session";

export default async function AdminPaymentsPage() {
  if (await requireDashboardRole() !== "admin") redirect("/dashboard");
  return <AdminDirectory kind="payments" />;
}
