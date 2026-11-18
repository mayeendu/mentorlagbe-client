"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/loading-skeletons";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";
import type { Payment } from "@/lib/payments";

const roles = ["student", "tutor", "admin"] as const;
type Role = (typeof roles)[number];
type User = { _id: string; name: string; email: string; role: Role; plan?: string; disabled?: boolean; createdAt?: string };
type Row = User | (Payment & { mockSessionId?: string; stripePaymentIntentId?: string });
type Page = { items: Row[]; total: number; page: number; limit: number };
type Decision = { user: User; action: "role" | "access" };
type Query = { search: string; filter: string; secondary: string; page: number };
const statuses = ["pending", "paid", "failed", "canceled"];
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const field = "form-control";

export function AdminDirectory({ kind, ownId }: { kind: "users" | "payments"; ownId?: string }) {
  const users = kind === "users";
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState<Query>({ search: "", filter: "", secondary: "", page: 1 });
  const [state, setState] = useState<Page | { error: string } | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [role, setRole] = useState<Role>("student");
  const [saving, setSaving] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const endpoint = "/api/admin/" + kind;
  const title = users ? "Users" : "Payments";

  useEffect(() => {
    const request = new AbortController();
    const params = new URLSearchParams({ page: String(query.page) });
    if (query.search) params.set("search", query.search);
    if (query.filter) params.set(users ? "role" : "status", query.filter);
    if (query.secondary) params.set(users ? "access" : "provider", query.secondary);
    authenticatedApiJson<Page>(endpoint + "?" + params, { signal: request.signal }).then((page) => {
      if (request.signal.aborted) return;
      const last = Math.max(1, Math.ceil(page.total / page.limit));
      if (page.page > last) setQuery({ ...query, page: last });
      else setState(page);
    }).catch((error: unknown) => {
      if (!request.signal.aborted) setState({ error: error instanceof Error ? error.message : "Could not load records." });
    });
    return () => request.abort();
  }, [endpoint, query, users]);

  function load(next: Partial<Query> = {}) {
    setState(null);
    setQuery((current) => ({ ...current, ...next }));
  }

  async function confirm() {
    if (!decision || saving) return;
    setSaving(true);
    try {
      const patch = decision.action === "role" ? { role } : { disabled: !decision.user.disabled };
      await authenticatedApiJson(endpoint + "/" + decision.user._id, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
      });
      toast.success(decision.action === "role" ? "Role updated." : decision.user.disabled ? "Account enabled." : "Account disabled.");
      setDecision(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the account.");
    } finally {
      setSaving(false);
    }
  }

  function cells(row: Row): ReactNode[] {
    const when = row.createdAt ? <time dateTime={row.createdAt}>{date.format(new Date(row.createdAt))}</time> : "—";
    if ("email" in row) return [
      <Fragment key="account"><p className="font-semibold">{row.name}</p><p className="text-xs text-muted-foreground">{row.email}</p></Fragment>,
      <span key="role" className="capitalize">{row.role}</span>, <span key="plan" className="capitalize">{row.plan ?? "unknown"}</span>,
      <StatusBadge key="access" status={row.disabled ? "disabled" : "active"} />,
      when,
      row._id === ownId ? <span className="text-xs text-muted-foreground">Your account</span> : <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => { setRole(row.role); setDecision({ user: row, action: "role" }); }}>Change role</Button>
        <Button type="button" size="sm" variant={row.disabled ? "outline" : "destructive"} onClick={() => setDecision({ user: row, action: "access" })}>
          {row.disabled ? "Enable" : "Disable"}
        </Button>
      </div>,
    ];
    const reference = row.stripePaymentIntentId ?? row.stripeSessionId ?? row.mockSessionId ?? row._id;
    return [
      <Fragment key="payment"><p className="font-semibold capitalize">{row.role} Pro</p><p className="max-w-64 font-mono text-xs wrap-anywhere text-muted-foreground">{reference}</p></Fragment>,
      <span key="userId" className="font-mono text-xs">{row.userId ?? "—"}</span>,
      money.format(row.amount / 100),
      row.provider === "mock" ? "Mock" : row.testMode === false ? "Live Stripe" : "Stripe test",
      <StatusBadge key="status" status={row.status} />,
      when,
    ];
  }

  const headings = users ? ["Account", "Role", "Plan", "Access", "Joined", "Actions"] :
    ["Payment", "User ID", "Amount", "Provider", "Status", "Created"];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4" onSubmit={(event) => {
        event.preventDefault();
        load({ page: 1, search: draft.trim() });
      }}>
        <label className="grid min-w-40 flex-1 gap-1.5 text-sm font-medium">
          Search
          <input ref={searchInput} type="search" maxLength={100} value={draft} placeholder={users ? "Name, email, or user ID" : "Transaction ID, user ID, or role"} className={field}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setDraft(value);
              if (!value && query.search) load({ page: 1, search: "" });
            }} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {users ? "Role" : "Status"}
          <select value={query.filter} onChange={(event) => load({ page: 1, filter: event.currentTarget.value })} className={field + " capitalize"}>
            <option value="">All</option>
            {(users ? roles : statuses).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {users ? "Access" : "Provider"}
          <select value={query.secondary} onChange={(event) => load({ page: 1, secondary: event.currentTarget.value })} className={field}>
            <option value="">All</option>
            {users ? <><option value="active">Active</option><option value="disabled">Disabled</option></> :
              <><option value="stripe-live">Live Stripe</option><option value="stripe-test">Stripe test</option><option value="mock">Mock</option></>}
          </select>
        </label>
        <Button type="submit">Search</Button>
      </form>

      {!state && <TableSkeleton label={"Loading " + kind} />}
      {state && "error" in state && <div role="alert" className="space-y-2 rounded-xl border bg-card p-5">
        <p>{state.error}</p>
        <Button type="button" variant="outline" onClick={() => load()}>Retry</Button>
      </div>}
      {state && "items" in state && (state.items.length ? (
        <>
          <div tabIndex={0} role="region" aria-label={title} className="hidden overflow-x-auto rounded-2xl border bg-card lg:block">
            <table className="w-full min-w-172 text-left text-sm">
              <caption className="sr-only">{title}</caption>
              <thead className="border-b bg-muted"><tr>
                {headings.map((heading) => <th key={heading} scope="col" className="px-3 py-3 whitespace-nowrap">{heading}</th>)}
              </tr></thead>
              <tbody>{state.items.map((item) => (
                <tr key={item._id} className="border-b last:border-b-0">
                  {cells(item).map((cell, index) => index === 0
                    ? <th key={headings[index]} scope="row" className="p-3 font-normal wrap-anywhere">{cell}</th>
                    : <td key={headings[index]} className="p-3">{cell}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {state.items.map((item) => {
              const [label, ...details] = cells(item);
              return (
                <li key={item._id} className="min-w-0 space-y-3 rounded-2xl border bg-card p-4 text-sm wrap-anywhere">
                  <div>{label}</div>
                  <dl className="grid grid-cols-2 gap-3 border-t pt-3">
                    {details.map((cell, index) => (
                      <div key={headings[index + 1]} className={headings[index + 1] === "Actions" ? "col-span-2" : undefined}>
                        <dt className="text-xs text-muted-foreground">{headings[index + 1]}</dt>
                        <dd className="mt-1">{cell}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>
          <nav aria-label={title + " pages"} className="flex flex-wrap items-center justify-between gap-2">
            <p role="status" className="text-sm text-muted-foreground">
              {(state.page - 1) * state.limit + 1}–{(state.page - 1) * state.limit + state.items.length} of {state.total}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={state.page === 1} onClick={() => load({ page: state.page - 1 })}>Previous</Button>
              <Button type="button" variant="outline" disabled={state.page * state.limit >= state.total} onClick={() => load({ page: state.page + 1 })}>Next</Button>
            </div>
          </nav>
        </>
      ) : <p role="status" className="rounded-xl border bg-card p-5">No {kind} match your filters.</p>)}

      <AlertDialog.Root open={decision !== null} onOpenChange={(open) => { if (!open && !saving) setDecision(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-black/50" />
          <AlertDialog.Popup initialFocus={cancelButton} finalFocus={searchInput} className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md max-h-[85dvh] -translate-1/2 space-y-4 overflow-y-auto rounded-2xl border bg-card p-5 shadow-xl">
            {decision && <>
              <AlertDialog.Title className="text-lg font-bold">
                {decision.action === "role" ? "Change account role?" : decision.user.disabled ? "Enable account?" : "Disable account?"}
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm wrap-anywhere text-muted-foreground">{decision.user.name} · {decision.user.email}</AlertDialog.Description>
              {decision.action === "role" && (
                <label className="grid gap-1.5 text-sm font-medium">
                  New role
                  <select value={role} disabled={saving} onChange={(event) => setRole(event.currentTarget.value as Role)} className={field + " capitalize"}>
                    {roles.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
              )}
              <div className="flex justify-end gap-2">
                <Button ref={cancelButton} type="button" variant="outline" disabled={saving} onClick={() => setDecision(null)}>Cancel</Button>
                <Button type="button" disabled={saving || (decision.action === "role" && role === decision.user.role)}
                  variant={decision.action === "access" && !decision.user.disabled ? "destructive" : "default"} onClick={() => void confirm()}>
                  {saving ? "Saving…" : "Confirm"}
                </Button>
              </div>
            </>}
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
