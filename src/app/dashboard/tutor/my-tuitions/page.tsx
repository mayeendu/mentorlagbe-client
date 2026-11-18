import { redirect } from "next/navigation";
import { MyTuitions } from "@/components/my-tuitions";
import { requireDashboardRole } from "@/lib/dashboard-session";

export default async function MyTuitionsPage() {
  if (await requireDashboardRole() !== "tutor") redirect("/dashboard");
  return <MyTuitions />;
}
