"use client";

import { BookOpen, CircleDollarSign, ClipboardList, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";

type Count = { label: string; count: number };
type Bucket = "live" | "mock" | "stripeTest";
type Stats = {
  roles: Count[]; plans: Count[]; tuition: Count[]; application: Count[];
  payments: { bucket: Bucket; amount: number; count: number }[];
  monthly: ({ month: string } & Record<Bucket, number>)[];
  activity: { _id: string; kind: string; label?: string; status?: string; createdAt: string }[];
};
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const month = new Intl.DateTimeFormat("en", { month: "short", year: "2-digit", timeZone: "UTC" });
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });
const buckets = [
  { key: "live", label: "Live Stripe", color: "#6036b6" },
  { key: "mock", label: "Mock", color: "#31866b" },
  { key: "stripeTest", label: "Stripe test", color: "#a05c17" },
] as const;
const total = (rows: Count[]) => rows.reduce((sum, row) => sum + row.count, 0);

export function AdminOverview() {
  const [state, setState] = useState<Stats | { error: string } | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const request = new AbortController();
    authenticatedApiJson<Stats>("/api/admin/stats", { signal: request.signal }).then((data) => {
      if (!request.signal.aborted) setState(data);
    }).catch((error: unknown) => {
      if (!request.signal.aborted) setState({ error: error instanceof Error ? error.message : "Could not load dashboard metrics." });
    });
    return () => request.abort();
  }, [reload]);

  const refresh = () => { setState(null); setReload((value) => value + 1); };

  return (
    <div className="space-y-5" id="overview">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
        <Button type="button" variant="outline" disabled={!state} onClick={refresh}>Refresh</Button>
      </header>
      {!state && (
        <div role="status" aria-label="Loading dashboard metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl border bg-card motion-reduce:animate-none" />)}
        </div>
      )}
      {state && ("error" in state ? <p role="alert" className="rounded-2xl border bg-card p-5">{state.error}</p> : <OverviewMetrics stats={state} />)}
    </div>
  );
}

function OverviewMetrics({ stats }: { stats: Stats }) {
  const live = stats.payments.find(({ bucket }) => bucket === "live");
  const cards = [
    { label: "Users", value: total(stats.roles), icon: Users },
    { label: "Tuitions", value: total(stats.tuition), icon: BookOpen },
    { label: "Applications", value: total(stats.application), icon: ClipboardList },
    { label: "Live revenue", value: money.format((live?.amount ?? 0) / 100), icon: CircleDollarSign },
  ];
  const segments = [
    { title: "Users by role", rows: stats.roles },
    { title: "Users by plan", rows: stats.plans },
    { title: "Tuition approvals", rows: stats.tuition },
    { title: "Applications by status", rows: stats.application },
  ];
  const revenue = stats.monthly.map(({ month: period, live, mock, stripeTest }) => ({
    month: month.format(new Date(period + "-01T00:00:00Z")), live: live / 100, mock: mock / 100, stripeTest: stripeTest / 100,
  }));

  return (
    <>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border bg-card p-4">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="size-4 text-primary" aria-hidden="true" />{label}</dt>
            <dd className="mt-3 text-2xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <section aria-labelledby="revenue-title" className="min-w-0 space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
        <div>
          <h2 id="revenue-title" className="text-lg font-bold">Monthly revenue</h2>
          <p className="text-sm text-muted-foreground">Successful payments over the last six months · USD</p>
        </div>
        <dl className="grid gap-2 sm:grid-cols-3">
          {buckets.map(({ key, label }) => {
            const record = stats.payments.find(({ bucket }) => bucket === key);
            return <div key={key} className="rounded-xl bg-muted p-3">
              <dt className="text-sm">{label}</dt>
              <dd className="mt-1 font-semibold">{money.format((record?.amount ?? 0) / 100)}</dd>
              <dd className="text-xs text-muted-foreground">{record?.count ?? 0} successful payments</dd>
            </div>;
          })}
        </dl>
        {revenue.some((row) => row.live || row.mock || row.stripeTest) ? (
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={revenue} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis width={40} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => money.format(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {buckets.map(({ key, color, label }) => <Bar key={key} isAnimationActive={false} dataKey={key} name={label} fill={color} radius={[4, 4, 0, 0]} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="rounded-xl border p-4 text-sm text-muted-foreground">No successful payments in this period.</p>}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {segments.map(({ title, rows }) => (
          <section key={title} className="min-w-0 space-y-3 rounded-2xl border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-bold">{title}</h2>
            {rows.length ? (
              <div className="h-40 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={rows} accessibilityLayer>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} width={32} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar isAnimationActive={false} dataKey="count" name="Total" fill="#7753bf" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-muted-foreground">No records yet.</p>}
          </section>
        ))}
      </div>
      <section id="activity" className="scroll-mt-4 rounded-2xl border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-bold">Recent activity</h2>
        {stats.activity.length ? <ul className="mt-3 divide-y">
          {stats.activity.map((item) => (
            <li key={item.kind + item._id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 text-sm">
              <div className="min-w-0"><p className="font-medium wrap-anywhere">{item.label === "stripeTest" ? "Stripe test" : item.label || item.kind}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.kind}{item.status && " · " + item.status}</p></div>
              <time dateTime={item.createdAt} className="text-xs text-muted-foreground">{date.format(new Date(item.createdAt))}</time>
            </li>
          ))}
        </ul> : <p className="mt-2 text-sm text-muted-foreground">No activity yet.</p>}
      </section>
    </>
  );
}
