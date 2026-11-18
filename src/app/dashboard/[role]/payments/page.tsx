import { redirect } from "next/navigation";
import { PaymentHistory } from "@/components/payment-history";
import { requireDashboardProfile } from "@/lib/dashboard-session";

export default async function PaymentsPage({ params }: PageProps<"/dashboard/[role]/payments">) {
  const [profile, { role }] = await Promise.all([requireDashboardProfile(), params]);
  if (profile.role === "admin") redirect("/dashboard/admin/payments");
  if (profile.role !== role) redirect("/dashboard");
  return <PaymentHistory role={profile.role} />;
}
