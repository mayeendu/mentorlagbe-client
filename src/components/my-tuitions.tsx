"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TuitionForm } from "@/components/tuition-form";
import { TableSkeleton } from "@/components/loading-skeletons";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { tuitionJson, tuitionRequest, type Tuition } from "@/lib/tuitions";

const fee = new Intl.NumberFormat("en-BD");
type LoadState = { items: Tuition[] } | { error: string } | null;

export function MyTuitions() {
  const [state, setState] = useState<LoadState>(null);
  const [reload, setReload] = useState(0);
  const [editing, setEditing] = useState<Tuition | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    tuitionRequest<Tuition[]>("", { signal: controller.signal })
      .then((items) => setState({ items }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Could not load tuitions.";
        setState({ error: message });
        toast.error(message);
      });
    return () => controller.abort();
  }, [reload]);

  function updateItems(update: (items: Tuition[]) => Tuition[]) {
    setState((current) => current && "items" in current ? { items: update(current.items) } : current);
  }

  function replace(updated: Tuition) {
    updateItems((items) => items.map((item) => item._id === updated._id ? updated : item));
  }

  async function mutate(item: Tuition, remove: boolean) {
    setBusy(item._id);
    try {
      if (remove) {
        await tuitionRequest("/" + item._id, { method: "DELETE" });
        updateItems((items) => items.filter(({ _id }) => _id !== item._id));
        setDeleting(null);
        toast.success("Tuition deleted.");
      } else {
        const updated = await tuitionRequest<Tuition>("/" + item._id + "/active", tuitionJson("PATCH", { isActive: !item.isActive }));
        replace(updated);
        toast.success(updated.isActive ? "Tuition activated." : "Tuition deactivated.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the tuition.");
    } finally {
      setBusy(null);
    }
  }

  if (editing) return <TuitionForm key={editing._id} tuition={editing} onCancel={() => setEditing(null)} onSave={(updated) => {
    replace(updated);
    setEditing(null);
  }} />;

  function actions(item: Tuition) {
    const disabled = busy !== null;
    if (deleting === item._id) return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-full text-sm">Delete this post?</span>
        <Button type="button" size="sm" variant="destructive" disabled={disabled} onClick={() => void mutate(item, true)}>
          {busy === item._id ? "Deleting…" : "Confirm delete"}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => setDeleting(null)}>Cancel</Button>
      </div>
    );

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => setEditing(item)}>Edit</Button>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => void mutate(item, false)}>
          {busy === item._id ? "Saving…" : item.isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => setDeleting(item._id)}>Delete</Button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">My tuitions</h1>
        <Link href="/dashboard/tutor/post-tuition" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Post tuition</Link>
      </div>
      {!state && <TableSkeleton label="Loading tuitions" />}
      {state && "error" in state && (
        <div role="alert" className="space-y-2 rounded-xl border bg-card p-5">
          <p>{state.error}</p>
          <Button type="button" variant="outline" onClick={() => { setState(null); setReload(reload + 1); }}>Retry</Button>
        </div>
      )}
      {state && "items" in state && (state.items.length ? (
        <>
          <div className="hidden overflow-x-auto rounded-xl border bg-card lg:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Your tuition posts</caption>
              <thead className="border-b bg-muted">
                <tr>{["Tuition", "Monthly fee", "Approval", "Activity", "Actions"].map((heading) => <th key={heading} scope="col" className="p-3">{heading}</th>)}</tr>
              </thead>
              <tbody>
                {state.items.map((item) => (
                  <tr key={item._id} className="border-b last:border-b-0">
                    <th scope="row" className="p-3 break-words">
                      {item.title}
                      <span className="block font-normal text-muted-foreground">{item.subject} · {item.location}</span>
                    </th>
                    <td className="p-3 whitespace-nowrap">৳{fee.format(item.monthlyFee)}</td>
                    <td className="p-3"><StatusBadge status={item.approvalStatus} /></td>
                    <td className="p-3"><StatusBadge status={item.isActive ? "active" : "inactive"} /></td>
                    <td className="p-3">{actions(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-3 lg:hidden">
            {state.items.map((item) => (
              <li key={item._id} className="space-y-2 rounded-xl border bg-card p-4 break-words">
                <h2 className="font-bold">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.subject} · {item.location}</p>
                <p className="text-sm">৳{fee.format(item.monthlyFee)} per month</p>
                <div className="flex flex-wrap gap-2"><StatusBadge status={item.approvalStatus} /><StatusBadge status={item.isActive ? "active" : "inactive"} /></div>
                {actions(item)}
              </li>
            ))}
          </ul>
        </>
      ) : <p className="rounded-xl border bg-card p-5">You haven&apos;t posted a tuition yet.</p>)}
    </section>
  );
}
