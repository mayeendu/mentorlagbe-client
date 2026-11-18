import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { MockCheckout } from "@/components/mock-checkout";
import { PaymentReturn } from "@/components/payment-return";
import { SiteNavbar } from "@/components/site-navbar";
import { requireDashboardProfile } from "@/lib/dashboard-session";

async function ResultDetails({ params, searchParams }: PageProps<"/payments/[result]">) {
  const [{ result }, query] = await Promise.all([params, searchParams]);
  if (result !== "success" && result !== "cancel" && result !== "mock") notFound();
  const profile = await requireDashboardProfile();
  if (profile.role === "admin") redirect("/dashboard/admin/payments");
  if (result === "mock") {
    const attempt = query.attempt_id;
    if (typeof attempt !== "string" || !/^[a-f0-9]{24}$/i.test(attempt)) notFound();
    return <><h1 className="text-3xl font-bold">Mock checkout</h1><MockCheckout attempt={attempt.toLowerCase()} role={profile.role} /></>;
  }
  const reference = result === "success" ? query.session_id : query.attempt_id;
  const valid = typeof reference === "string" && (result === "success"
    ? /^cs_(?:test|live)_[a-zA-Z0-9_-]{1,200}$/.test(reference)
    : /^[a-f0-9]{24}$/i.test(reference));
  return (
    <>
      <h1 className="text-3xl font-bold">{result === "success" ? "Payment status" : "Checkout canceled"}</h1>
      {valid ? <PaymentReturn mode={result} reference={reference} role={profile.role} /> :
        <p role="alert" className="rounded-xl border bg-card p-4">The checkout reference is missing or invalid.</p>}
    </>
  );
}

export default function PaymentResultPage(props: PageProps<"/payments/[result]">) {
  return (
    <>
      <SiteNavbar />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl space-y-5 px-5 py-10 sm:px-8">
        <Suspense fallback={<p role="status">Checking payment status…</p>}><ResultDetails {...props} /></Suspense>
      </main>
    </>
  );
}
