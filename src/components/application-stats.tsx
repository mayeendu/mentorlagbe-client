"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApplications, type ApplicationRole } from "@/lib/applications";

export function ApplicationStats({ role }: { role: ApplicationRole }) {
  const [state, setState] = useState<number[] | "error" | null>(null);
  const student = role === "student";
  const title = student ? "My applications" : "Applicants";

  useEffect(() => {
    const controller = new AbortController();
    getApplications(role, controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      const totals = { pending: 0, accepted: 0, rejected: 0 };
      for (const item of items) totals[item.status] += 1;
      setState([items.length, totals.pending, totals.accepted, totals.rejected]);
    }).catch(() => {
      if (!controller.signal.aborted) setState("error");
    });
    return () => controller.abort();
  }, [role]);

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <Link className="text-sm font-semibold text-primary underline" href={student ? "/dashboard/student/my-applications" : "/dashboard/tutor/applicants"}>
          {student ? "View applications" : "View applicants"}
        </Link>
      </div>
      {state === "error" ? <p className="text-sm text-muted-foreground">Application totals are temporarily unavailable.</p> :
        state === null ? <p role="status" className="text-sm text-muted-foreground">Loading application totals…</p> : (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Total", "Pending", "Accepted", "Rejected"].map((label, index) => (
              <div key={label} className="rounded-xl bg-muted p-3">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-2xl font-bold">{state[index]}</dd>
              </div>
            ))}
          </dl>
        )}
    </section>
  );
}
