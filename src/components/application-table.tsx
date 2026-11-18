"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";
import { applicationEndpoints, getApplications, type Application, type ApplicationRole } from "@/lib/applications";

const badge: Record<Application["status"], string> = {
  pending: "bg-amber-100 text-amber-950",
  accepted: "bg-emerald-100 text-emerald-950",
  rejected: "bg-red-100 text-red-950",
};
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });

type Action = "cancel" | "accept" | "reject";
type Decision = { action: Action; application: Application };
type LoadState = { items: Application[] } | { error: string } | null;

export function ApplicationTable({ role }: { role: ApplicationRole }) {
  const [state, setState] = useState<LoadState>(null);
  const [reload, setReload] = useState(0);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [saving, setSaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const student = role === "student";
  const title = student ? "My applications" : "Applicants";

  useEffect(() => {
    const controller = new AbortController();
    getApplications(role, controller.signal).then((items) => {
      if (!controller.signal.aborted) setState({ items });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : "Could not load applications.";
      setState({ error: message });
      toast.error(message);
    });
    return () => controller.abort();
  }, [reload, role]);

  function refresh() {
    setState(null);
    setReload((value) => value + 1);
  }

  async function confirm() {
    if (!decision || saving) return;
    const { action, application } = decision;
    const path = applicationEndpoints[role] + "/" + application._id;
    setSaving(true);
    try {
      if (action === "cancel") await authenticatedApiJson(path, { method: "DELETE" });
      else await authenticatedApiJson(path + "/" + action, { method: "PATCH" });
      toast.success({ cancel: "Application cancelled.", accept: "Application accepted.", reject: "Application rejected." }[action]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the application.");
    } finally {
      setDecision(null);
      setSaving(false);
      refresh();
    }
  }

  const columns: { label: string; cell: (item: Application) => ReactNode }[] = [
    { label: "Tuition", cell: (item) => <><p className="font-semibold">{item.tuition.title}</p><p className="text-xs text-muted-foreground">{item.tuition.subject} · {item.tuition.format}</p></> },
    { label: student ? "Tutor" : "Student", cell: (item) => student ? item.tutorName ?? "Unknown tutor" : item.studentName ?? "Unknown student" },
    { label: "Contact and schedule", cell: (item) => (
      <div className="space-y-1">
        <p>{item.phone}</p>
        <p className="whitespace-pre-wrap">{item.preferredSchedule}</p>
        {item.studentNote && <details className="text-muted-foreground"><summary className="cursor-pointer">Student note</summary><p className="mt-1 whitespace-pre-wrap">{item.studentNote}</p></details>}
      </div>
    ) },
    { label: "Applied", cell: (item) => <time dateTime={item.createdAt}>{date.format(new Date(item.createdAt))}</time> },
    { label: "Status", cell: (item) => <span className={"rounded-full px-2 py-1 text-xs font-semibold capitalize " + badge[item.status]}>{item.status}</span> },
    { label: "Actions", cell: (item) => {
      if (item.status !== "pending") return <span aria-label="No actions">—</span>;
      const button = (action: Action, label: string) => (
        <Button type="button" size="sm" variant={action === "accept" ? "outline" : "destructive"} onClick={() => setDecision({ action, application: item })}>
          {label}
        </Button>
      );
      return <div className="flex flex-wrap gap-2">{student ? button("cancel", "Cancel application") : <>{button("accept", "Accept")}{button("reject", "Reject")}</>}</div>;
    } },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold">{title}</h1>
        {student && <Link className="text-sm font-semibold text-primary underline" href="/tuitions">Browse tuition</Link>}
      </div>
      {!state && <p role="status" className="rounded-xl border bg-card p-5">Loading applications…</p>}
      {state && "error" in state && (
        <div role="alert" className="space-y-2 rounded-xl border bg-card p-5">
          <p>{state.error}</p>
          <Button type="button" variant="outline" onClick={refresh}>Retry</Button>
        </div>
      )}
      {state && "items" in state && (state.items.length ? (
        <>
          <div className="hidden overflow-x-auto rounded-xl border bg-card lg:block">
            <table className="w-full table-fixed text-left text-sm">
              <caption className="sr-only">{title}</caption>
              <thead className="border-b bg-muted">
                <tr>{columns.map(({ label }) => <th key={label} scope="col" className="p-3">{label}</th>)}</tr>
              </thead>
              <tbody>
                {state.items.map((item) => (
                  <tr key={item._id} className="border-b align-top last:border-b-0">
                    <th scope="row" className="p-3 font-normal wrap-anywhere">{columns[0].cell(item)}</th>
                    {columns.slice(1).map(({ label, cell }) => <td key={label} className="p-3 wrap-anywhere">{cell(item)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-3 lg:hidden">
            {state.items.map((item) => (
              <li key={item._id} className="space-y-3 rounded-xl border bg-card p-4 text-sm wrap-anywhere">
                <div>{columns[0].cell(item)}</div>
                <dl className="grid grid-cols-2 gap-3">
                  {columns.slice(1, -1).map(({ label, cell }) => (
                    <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1">{cell(item)}</dd></div>
                  ))}
                </dl>
                {item.status === "pending" && columns.at(-1)?.cell(item)}
              </li>
            ))}
          </ul>
        </>
      ) : <p className="rounded-xl border bg-card p-5">{student ? "You haven’t applied for a tuition yet." : "You haven’t received any applications yet."}</p>)}
      <AlertDialog.Root open={decision !== null} onOpenChange={(open) => { if (!open && !saving) setDecision(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-black/50" />
          <AlertDialog.Popup initialFocus={backButton} finalFocus={heading} className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-1/2 space-y-4 rounded-xl border bg-card p-5 shadow-lg">
            {decision && (
              <>
                <AlertDialog.Title className="text-lg font-bold capitalize">{decision.action} application?</AlertDialog.Title>
                <AlertDialog.Description className="text-sm wrap-anywhere text-muted-foreground">{decision.application.tuition.title}</AlertDialog.Description>
                <div className="flex justify-end gap-2">
                  <Button ref={backButton} type="button" variant="outline" disabled={saving} onClick={() => setDecision(null)}>Go back</Button>
                  <Button type="button" variant={decision.action === "accept" ? "default" : "destructive"} disabled={saving} onClick={() => void confirm()}>
                    {saving ? "Saving…" : "Confirm"}
                  </Button>
                </div>
              </>
            )}
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
