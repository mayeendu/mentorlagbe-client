import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { TuitionSkeleton } from "@/components/loading-skeletons";
import { TuitionCards } from "@/components/tuition-browser";
import { TuitionFilters } from "@/components/tuition-filters";
import { TuitionUnavailable } from "@/components/tuition-unavailable";
import { buttonVariants } from "@/components/ui/button";
import { getPublicClassLevels, getPublicTuitions, subjects } from "@/lib/public-tuitions";

export const metadata: Metadata = { title: "Find tuition" };

async function Results({ searchParams }: Pick<PageProps<"/tuitions">, "searchParams">) {
  const query = await searchParams;
  const text = (key: string, max: number) => typeof query[key] === "string" ? query[key].trim().slice(0, max) : "";
  const search = text("search", 100);
  const subject = text("subject", 100);
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
  const [result, classLevels] = await Promise.all([
    getPublicTuitions(apiQuery).catch(() => null),
    getPublicClassLevels().catch(() => null),
  ]);
  const pageCount = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <TuitionFilters filters={{ search, subject, classLevel, mode }} subjects={subjects} classLevels={classLevels} defaultOpen>
      <div className="space-y-5">
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
    </TuitionFilters>
  );
}

export default function TuitionsPage({ searchParams }: PageProps<"/tuitions">) {
  return (
    <>
      <SiteNavbar />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl min-h-[calc(100svh-4.5rem)] flex-1 space-y-6 px-4 py-8 sm:px-8 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find tuition</h1>
        <Suspense fallback={<TuitionSkeleton sidebar />}><Results searchParams={searchParams} /></Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
