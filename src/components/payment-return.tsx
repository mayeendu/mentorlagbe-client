"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";
import type { Payment, PaymentHistory } from "@/lib/payments";

type Mode = "success" | "cancel";
type State = { payment?: Payment; error?: string } | null;

export function PaymentReturn({ mode, reference, role }: { mode: Mode; reference: string; role: "student" | "tutor" }) {
  const [state, setState] = useState<State>(null);
  const [refresh, setRefresh] = useState(0);
  const [canceling, setCanceling] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    async function check() {
      try {
        const history = await authenticatedApiJson<PaymentHistory>("/api/payments/mine", { signal: controller.signal });
        if (controller.signal.aborted) return;
        const payment = history.payments.find((row) => (mode === "success" ? row.stripeSessionId : row._id) === reference);
        setState({ payment });
        if (payment?.status === "paid") router.refresh();
        if ((mode === "success" || cancelRequested) && (!payment || payment.status === "pending") && ++attempts < 15) {
          timer = setTimeout(check, 2000);
        }
      } catch (error) {
        if (!controller.signal.aborted) setState({ error: error instanceof Error ? error.message : "Could not check the payment." });
      }
    }
    void check();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [mode, reference, refresh, cancelRequested, router]);

  async function cancel() {
    setCanceling(true);
    try {
      await authenticatedApiJson("/api/payments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: reference }),
      });
      setCancelRequested(true);
      toast.success("Stripe Checkout closed. Checking its final status.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not close Stripe Checkout.");
      setRefresh((value) => value + 1);
    } finally {
      setCanceling(false);
    }
  }

  const status = state?.payment?.status;
  let message = "Checking payment status…";
  if (state?.error) message = state.error;
  else if (status === "paid") message = "Payment confirmed. Your Pro upgrade is active.";
  else if (status === "failed") message = "Stripe reported that the payment failed.";
  else if (status === "canceled") message = "Stripe closed this checkout.";
  else if (state && mode === "cancel" && !cancelRequested) message = state.payment
    ? "You left Stripe Checkout. You can close this checkout or return to it from payment history."
    : "This checkout attempt could not be found.";
  else if (state) message = "Waiting for Stripe to confirm the payment status.";

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-6">
      <p role={state?.error ? "alert" : "status"}>{message}</p>
      <div className="flex flex-wrap gap-3">
        {mode === "cancel" && status === "pending" && !cancelRequested && (
          <Button type="button" variant="destructive" disabled={canceling} onClick={() => void cancel()}>{canceling ? "Closing…" : "Close checkout"}</Button>
        )}
        <Button type="button" variant="outline" onClick={() => { setState(null); setRefresh((value) => value + 1); }}>Check status</Button>
        <Link href={"/dashboard/" + role + "/payments"} className="self-center text-sm font-semibold text-primary underline">Payment history</Link>
      </div>
    </div>
  );
}
