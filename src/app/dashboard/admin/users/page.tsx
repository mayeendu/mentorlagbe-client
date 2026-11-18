import { redirect } from "next/navigation";
import { AdminDirectory } from "@/components/admin-directory";
import { requireDashboardProfile } from "@/lib/dashboard-session";

export default async function AdminUsersPage() {
  const profile = await requireDashboardProfile();
  if (profile.role !== "admin") redirect("/dashboard");
  return <AdminDirectory kind="users" ownId={profile.id} />;
}
