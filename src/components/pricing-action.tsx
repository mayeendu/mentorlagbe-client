import Link from "next/link";
import { UpgradeButton } from "@/components/upgrade-button";
import { buttonVariants } from "@/components/ui/button";
import { getAccountProfile } from "@/lib/dashboard-session";

export async function PricingAction() {
  const profile = await getAccountProfile().catch(() => null);
  if (!profile) return <Link href="/sign-in" className={buttonVariants({ variant: "outline" })}>Sign in to upgrade</Link>;
  if (profile.role === "admin") return null;
  if (profile.plan === "pro") return <Link href={"/dashboard/" + profile.role + "/payments"} className={buttonVariants({ variant: "outline" })}>View payment history</Link>;
  return <UpgradeButton role={profile.role} />;
}
