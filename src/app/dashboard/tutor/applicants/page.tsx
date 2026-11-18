import { redirect } from "next/navigation";
import { ApplicationTable } from "@/components/application-table";
import { requireDashboardRole } from "@/lib/dashboard-session";

export default async function ApplicantsPage() {
  if (await requireDashboardRole() !== "tutor") redirect("/dashboard");
  return <ApplicationTable role="tutor" />;
}
