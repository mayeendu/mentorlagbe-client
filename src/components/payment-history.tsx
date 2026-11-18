"use client";

import { useEffect, useState } from "react";
import { UpgradeButton } from "@/components/upgrade-button";
import { TableSkeleton } from "@/components/loading-skeletons";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";
import type { PaymentHistory as History } from "@/lib/payments";

type Role = "student" | "tutor";
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });

export function PaymentHistory({ role }: { role: Role }) {
  const [state, setState] = useState<History | { error: string } | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const request = authenticatedApiJson<History>("/api/payments/mine", { signal: controller.signal });
    request.then((data) => {
      if (!controller.signal.aborted) setState(data);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ error: error instanceof Error ? error.message : "Could not load payments." });
    });
    return () => controller.abort();
  }, [role, refresh]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Payment history</h1>
        <Button type="button" variant="outline" disabled={!state} onClick={() => { setState(null); setRefresh((value) => value + 1); }}>Refresh</Button>
      </div>
      {!state && <TableSkeleton label="Loading payments" />}
      {state && "error" in state && <p role="alert" className="rounded-xl border bg-card p-5">{state.error}</p>}
      {state && "payments" in state && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <p>Current plan <strong className="capitalize">{state.plan}</strong></p>
            {state.plan === "free" && <UpgradeButton role={role} />}
          </div>
          {state.payments.length ? (
            <div tabIndex={0} role="region" aria-label="Payment history" className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Payment transactions</caption>
                <thead className="border-b bg-muted"><tr>
                  {["Date", "Upgrade", "Amount", "Provider", "Status"].map((label) =>
                    <th key={label} scope="col" className="p-3 whitespace-nowrap">{label}</th>,
                  )}
                </tr></thead>
                <tbody>
                  {state.payments.map((row) => (
                    <tr key={row._id} className="border-b last:border-b-0">
                      <td className="p-3 whitespace-nowrap"><time dateTime={row.createdAt}>{date.format(new Date(row.createdAt))}</time></td>
                      <th scope="row" className="p-3 font-medium whitespace-nowrap capitalize">{row.role} Pro</th>
                      <td className="p-3 whitespace-nowrap">{money.format(row.amount / 100)}</td>
                      <td className="p-3 whitespace-nowrap">{row.provider === "mock" ? "Mock (test)" : row.testMode === false ? "Stripe" : "Stripe (test)"}</td>
                      <td className="p-3"><StatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="rounded-xl border bg-card p-5">No payment attempts yet.</p>}
        </>
      )}
    </section>
  );
}
