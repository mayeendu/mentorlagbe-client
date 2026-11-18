import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { SiteNavbar } from "@/components/site-navbar";
import { TuitionSkeleton } from "@/components/loading-skeletons";
import { TuitionCards } from "@/components/tuition-browser";
import { TuitionUnavailable } from "@/components/tuition-unavailable";
import { buttonVariants } from "@/components/ui/button";
import { getPublicTuitions, subjects } from "@/lib/public-tuitions";

export const metadata: Metadata = { title: "Find tuition" };
const field = "h-10 w-full rounded-lg border bg-background px-3 text-sm";

async function Results({ searchParams }: Pick<PageProps<"/tuitions">, "searchParams">) {
  const query = await searchParams;
  const text = (key: string, max: number) => typeof query[key] === "string" ? query[key].trim().slice(0, max) : "";
  const search = text("search", 100);
  const subject = text("subject", 80);
  const classLevel = text("classLevel", 80);
  const mode = query.mode === "home" || query.mode === "online" ? query.mode : "";
  const page = typeof query.page === "string" && /^[1-9]\d{0,6}$/.test(query.page)
    ? Math.min(Number(query.page), 1_000_000)
    : 1;
  const filters = new URLSearchParams();
  for (const [key, value] of Object.entries({ search, subject, classLevel, mode })) {
    if (value) filters.set(key, value);
  }

  function href(target: number) {
    const params = new URLSearchParams(filters);
    if (target > 1) params.set("page", String(target));
    return params.size ? "/tuitions?" + params : "/tuitions";
  }

  const apiQuery = new URLSearchParams(filters);
  apiQuery.set("page", String(page));
  const result = await getPublicTuitions(apiQuery).catch(() => null);
  const pageCount = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <div className="space-y-5">
      <Form key={filters.toString()} action="/tuitions" className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
          Search
          <input name="search" type="search" defaultValue={search} maxLength={100} placeholder="Title or subject" className={field} />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
          Subject
          <input name="subject" list="tuition-subjects" defaultValue={subject} maxLength={80} placeholder="All subjects" className={field} />
        </label>
        <datalist id="tuition-subjects">{subjects.map((item) => <option key={item} value={item} />)}</datalist>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
          Class level
          <input name="classLevel" defaultValue={classLevel} maxLength={80} placeholder="Any class level" className={field} />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
          Mode
          <select name="mode" defaultValue={mode} className={field}>
            <option value="">All modes</option>
            <option value="home">Home tuition</option>
            <option value="online">Online</option>
          </select>
        </label>
        <button type="submit" className={buttonVariants({ size: "lg" })}>Search tuitions</button>
      </Form>
      {filters.size > 0 && <Link href="/tuitions" className="inline-block text-sm font-semibold text-primary underline">Clear filters</Link>}
      {!result ? (
        <TuitionUnavailable message="Tuition listings are temporarily unavailable." />
      ) : result.items.length ? (
        <>
          <h2 className="sr-only">Tuition results</h2>
          <p role="status" className="text-sm text-muted-foreground">{result.total} {result.total === 1 ? "tuition" : "tuitions"} found</p>
          <TuitionCards listings={result.items} />
          {pageCount > 1 && (
            <nav aria-label="Tuition results pages" className="flex flex-wrap items-center justify-center gap-3">
              {page > 1 && <Link href={href(page - 1)} className={buttonVariants({ variant: "outline" })}>Previous</Link>}
              <span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span>
              {page < pageCount && page < 1_000_000 && <Link href={href(page + 1)} className={buttonVariants({ variant: "outline" })}>Next</Link>}
            </nav>
          )}
        </>
      ) : (
        <div className="space-y-2 rounded-2xl border bg-card p-8 text-center">
          <p role="status" className="font-semibold">{result.total ? "This page has no tuitions." : "No tuitions match your search."}</p>
          {result.total > 0 && <Link href={href(1)} className="text-sm font-semibold text-primary underline">Back to first page</Link>}
        </div>
      )}
    </div>
  );
}

export default function TuitionsPage({ searchParams }: PageProps<"/tuitions">) {
  return (
    <>
      <SiteNavbar />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-5 py-9 sm:px-8 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find tuition</h1>
        <Suspense fallback={<TuitionSkeleton />}><Results searchParams={searchParams} /></Suspense>
      </main>
    </>
  );
}
