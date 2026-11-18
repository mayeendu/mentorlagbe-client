"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";
import type { Payment, PaymentHistory } from "@/lib/payments";

const labels = { pending: "Pending", paid: "Succeeded", failed: "Failed", canceled: "Canceled" };
const amounts = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
type State = { payment: Payment } | { error: string } | null;

export function MockCheckout({ attempt, role }: { attempt: string; role: "student" | "tutor" }) {
  const [state, setState] = useState<State>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    authenticatedApiJson<PaymentHistory>("/api/payments/mine", { signal: controller.signal }).then(({ payments }) => {
      if (controller.signal.aborted) return;
      const payment = payments.find((item) => item._id === attempt && item.provider === "mock" && item.testMode);
      setState(payment ? { payment } : { error: "This mock checkout could not be found." });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ error: error instanceof Error ? error.message : "Could not load checkout." });
    });
    return () => controller.abort();
  }, [attempt]);

  async function simulate(outcome: "success" | "failure" | "cancel") {
    if (busy || !state || !("payment" in state)) return;
    const { payment } = state;
    setBusy(true);
    try {
      const result = await authenticatedApiJson<{ status: Payment["status"] }>("/api/payments/mock/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt, outcome }),
      });
      setState({ payment: { ...payment, status: result.status } });
      toast.success("Simulation recorded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete the simulation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-6">
      <p className="text-sm text-muted-foreground">This checkout is a simulation. No money is collected.</p>
      {!state && <p role="status">Loading checkout…</p>}
      {state && "error" in state && <p role="alert">{state.error}</p>}
      {state && "payment" in state && (
        <>
          <p className="text-lg font-semibold capitalize">{state.payment.role} Pro · {amounts.format(state.payment.amount / 100)} USD</p>
          <p role="status">Mock payment {labels[state.payment.status].toLowerCase()}.{state.payment.status === "paid" && " Pro is active for this test account."}</p>
          {state.payment.status === "pending" && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={busy} onClick={() => void simulate("success")}>Simulate success</Button>
              <Button type="button" variant="destructive" disabled={busy} onClick={() => void simulate("failure")}>Simulate failure</Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => void simulate("cancel")}>Cancel test payment</Button>
            </div>
          )}
        </>
      )}
      <Link href={"/dashboard/" + role + "/payments"} className="text-sm font-semibold text-primary underline">Payment history</Link>
    </section>
  );
}
