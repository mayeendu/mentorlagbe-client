import { redirect } from "next/navigation";
import { ApplicationTable } from "@/components/application-table";
import { requireDashboardRole } from "@/lib/dashboard-session";

export default async function MyApplicationsPage() {
  if (await requireDashboardRole() !== "student") redirect("/dashboard");
  return <ApplicationTable role="student" />;
}
