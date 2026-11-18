"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/loading-skeletons";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";
import { tuitionJson, type Tuition } from "@/lib/tuitions";

type Status = Tuition["approvalStatus"];
type ReviewPost = Pick<Tuition, "_id" | "title" | "subject" | "monthlyFee" | "approvalStatus" | "description" | "isActive"> & {
  tutorName: string | null;
  createdAt: string;
  updatedAt: string;
};
type Query = { search: string; status: Status | ""; page: number };
type Results = { items: ReviewPost[]; total: number; page: number; limit: number };
type Decision = { post: ReviewPost; action: "approve" | "reject" };

const endpoint = "/api/admin/tuitions";
const fee = new Intl.NumberFormat("en-BD");
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });

export function AdminTuitions() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState<Query>({ search: "", status: "pending", page: 1 });
  const [state, setState] = useState<Results | { error: string } | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [saving, setSaving] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(query.page) });
    if (query.status) params.set("status", query.status);
    if (query.search) params.set("search", query.search);
    authenticatedApiJson<Results>(endpoint + "?" + params, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        const lastPage = Math.max(1, Math.ceil(result.total / result.limit));
        if (result.page > lastPage) {
          setQuery({ ...query, page: lastPage });
          return;
        }
        setState(result);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Could not load tuition posts.";
        setState({ error: message });
        toast.error(message);
      });
    return () => controller.abort();
  }, [query]);

  function load(next: Partial<Query> = {}) {
    setState(null);
    setQuery((current) => ({ ...current, ...next }));
  }

  async function confirmDecision() {
    if (!decision || saving) return;
    setSaving(true);
    try {
      await authenticatedApiJson(
        endpoint + "/" + decision.post._id + "/" + decision.action,
        tuitionJson("PATCH", { expectedUpdatedAt: decision.post.updatedAt }),
      );
      toast.success(decision.action === "approve" ? "Tuition approved." : "Tuition rejected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the decision.");
    } finally {
      setSaving(false);
      setDecision(null);
      load();
    }
  }

  function reviewActions(post: ReviewPost) {
    if (post.approvalStatus !== "pending") return null;
    return (
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" aria-label={"Approve " + post.title} onClick={() => setDecision({ post, action: "approve" })}>Approve</Button>
        <Button type="button" size="sm" variant="destructive" aria-label={"Reject " + post.title} onClick={() => setDecision({ post, action: "reject" })}>Reject</Button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Tuition approvals</h1>
      <form className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4" onSubmit={(event) => {
        event.preventDefault();
        load({ page: 1, search: search.trim() });
      }}>
        <label className="grid min-w-0 flex-1 gap-1.5 text-sm font-medium">
          Search
          <input ref={searchInput} type="search" value={search} maxLength={100} placeholder="Title, tutor, or subject"
            onChange={(event) => {
              const value = event.currentTarget.value;
              setSearch(value);
              if (!value && query.search) load({ page: 1, search: "" });
            }}
            className="form-control" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Status
          <select value={query.status} className="form-control"
            onChange={(event) => load({ page: 1, status: event.currentTarget.value as Status | "" })}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <Button type="submit">Search</Button>
      </form>

      {!state && <TableSkeleton label="Loading tuition posts" />}
      {state && "error" in state && (
        <div role="alert" className="space-y-2 rounded-xl border bg-card p-5">
          <p>{state.error}</p>
          <Button type="button" variant="outline" onClick={() => load()}>Retry</Button>
        </div>
      )}
      {state && "items" in state && (state.items.length ? (
        <>
          <div tabIndex={0} role="region" aria-label="Tuition review results" className="hidden overflow-x-auto rounded-xl border bg-card lg:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Tuition posts for review</caption>
              <thead className="border-b bg-muted">
                <tr>{["Title", "Tutor", "Subject", "Monthly fee", "Posted", "Status", "Actions"].map((heading) => (
                  <th key={heading} scope="col" className="px-3 py-3 whitespace-nowrap">{heading}</th>
                ))}</tr>
              </thead>
              <tbody>
                {state.items.map((post) => (
                  <tr key={post._id} className="border-b last:border-b-0">
                    <th scope="row" className="min-w-32 px-3 py-3 wrap-anywhere">{post.title}</th>
                    <td className="min-w-28 px-3 py-3 wrap-anywhere">{post.tutorName ?? "Unknown tutor"}</td>
                    <td className="px-3 py-3 wrap-anywhere">{post.subject}</td>
                    <td className="px-3 py-3 whitespace-nowrap">৳{fee.format(post.monthlyFee)}</td>
                    <td className="px-3 py-3 whitespace-nowrap"><time dateTime={post.createdAt}>{date.format(new Date(post.createdAt))}</time></td>
                    <td className="px-3 py-3">
                      <StatusBadge status={post.approvalStatus} />
                    </td>
                    <td className="px-3 py-3">
                      {reviewActions(post) ?? <span aria-label="No review actions">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {state.items.map((post) => (
              <li key={post._id} className="min-w-0 space-y-3 rounded-2xl border bg-card p-4 text-sm wrap-anywhere">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold">{post.title}</h2>
                  <StatusBadge status={post.approvalStatus} />
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  <div><dt className="text-xs text-muted-foreground">Tutor</dt><dd>{post.tutorName ?? "Unknown tutor"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Subject</dt><dd>{post.subject}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Monthly fee</dt><dd>৳{fee.format(post.monthlyFee)}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Posted</dt><dd><time dateTime={post.createdAt}>{date.format(new Date(post.createdAt))}</time></dd></div>
                </dl>
                {reviewActions(post)}
              </li>
            ))}
          </ul>
          <nav aria-label="Tuition results pages" className="flex flex-wrap items-center justify-between gap-2">
            <p role="status" className="text-sm text-muted-foreground">
              {(state.page - 1) * state.limit + 1}–{(state.page - 1) * state.limit + state.items.length} of {state.total} posts
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={state.page === 1} onClick={() => load({ page: state.page - 1 })}>Previous</Button>
              <Button type="button" variant="outline" disabled={state.page * state.limit >= state.total} onClick={() => load({ page: state.page + 1 })}>Next</Button>
            </div>
          </nav>
        </>
      ) : <p role="status" className="rounded-xl border bg-card p-5">No tuition posts match your filters.</p>)}

      <AlertDialog.Root open={decision !== null} onOpenChange={(open) => { if (!open && !saving) setDecision(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-black/50" />
          <AlertDialog.Popup initialFocus={cancelButton} finalFocus={searchInput}
            className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg -translate-1/2 space-y-4 overflow-y-auto rounded-xl border bg-card p-5 text-card-foreground shadow-lg">
            {decision && (
              <>
                <AlertDialog.Title className="text-lg font-bold">{decision.action === "approve" ? "Approve tuition?" : "Reject tuition?"}</AlertDialog.Title>
                <AlertDialog.Description className="wrap-anywhere text-sm">
                  {decision.post.title} · {decision.post.tutorName ?? "Unknown tutor"}
                </AlertDialog.Description>
                <p className="wrap-anywhere whitespace-pre-wrap text-sm text-muted-foreground">{decision.post.description}</p>
                <div className="flex justify-end gap-2">
                  <Button ref={cancelButton} type="button" variant="outline" disabled={saving} onClick={() => setDecision(null)}>Cancel</Button>
                  <Button type="button" variant={decision.action === "reject" ? "destructive" : "default"} disabled={saving} onClick={() => void confirmDecision()} className="capitalize">
                    {saving ? "Saving…" : decision.action}
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
