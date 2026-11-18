import { redirect } from "next/navigation";
import { TuitionForm } from "@/components/tuition-form";
import { requireDashboardRole } from "@/lib/dashboard-session";

export default async function PostTuitionPage() {
  if (await requireDashboardRole() !== "tutor") redirect("/dashboard");
  return <TuitionForm />;
}
