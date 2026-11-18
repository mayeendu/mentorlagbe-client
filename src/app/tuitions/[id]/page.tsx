import type { Metadata } from "next";
import { ArrowLeft, BookOpen, CalendarDays, MapPin, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApplyTuition } from "@/components/apply-tuition";
import { SiteNavbar } from "@/components/site-navbar";
import { TuitionUnavailable } from "@/components/tuition-unavailable";
import { buttonVariants } from "@/components/ui/button";
import { getAccountProfile } from "@/lib/dashboard-session";
import { getPublicTuition, monthlyFee, weeklySchedule } from "@/lib/public-tuitions";

export const metadata: Metadata = { title: "Tuition details" };

async function ApplyAction({ id, title }: { id: string; title: string }) {
  const profile = await getAccountProfile().catch(() => undefined);
  if (profile === undefined) return <p className="text-sm text-muted-foreground">Application access is temporarily unavailable.</p>;
  if (!profile) return <Link href="/sign-in" className={buttonVariants()}>Sign in to apply</Link>;
  if (profile.role !== "student") return <p className="text-sm text-muted-foreground">Applications are available to student accounts.</p>;

  return <ApplyTuition tuitionId={id} title={title} />;
}

async function TuitionDetails({ params }: Pick<PageProps<"/tuitions/[id]">, "params">) {
  const { id } = await params;
  const post = await getPublicTuition(id).catch(() => undefined);
  if (post === undefined) return <TuitionUnavailable message="Tuition details are temporarily unavailable." />;
  if (!post) notFound();

  return (
    <article className="overflow-hidden rounded-3xl border bg-card">
      <div className="relative grid h-48 place-items-center bg-[#eee8ff] text-[#5d35b9] sm:h-72">
        {post.imageUrl ? (
          <Image unoptimized src={post.imageUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
        ) : <BookOpen aria-hidden="true" className="size-16" />}
      </div>
      <div className="space-y-6 p-5 sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">{post.format} · {post.subject}{post.classLevel && " · " + post.classLevel}</p>
          <h1 className="text-3xl font-bold tracking-tight wrap-anywhere sm:text-4xl">{post.title}</h1>
        </div>
        <dl className="grid gap-4 rounded-xl bg-muted p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="flex items-center gap-1.5 text-muted-foreground"><UserRound aria-hidden="true" className="size-4" />Tutor</dt><dd className="mt-1 font-semibold wrap-anywhere">{post.tutorName ?? "Tutor name unavailable"}</dd></div>
          <div><dt className="text-muted-foreground">Monthly fee</dt><dd className="mt-1 font-semibold">{monthlyFee(post.monthlyFee)}</dd></div>
          <div><dt className="flex items-center gap-1.5 text-muted-foreground"><CalendarDays aria-hidden="true" className="size-4" />Schedule</dt><dd className="mt-1 font-semibold">{weeklySchedule(post.daysPerWeek)}</dd></div>
          <div><dt className="flex items-center gap-1.5 text-muted-foreground"><MapPin aria-hidden="true" className="size-4" />Location</dt><dd className="mt-1 font-semibold wrap-anywhere">{post.location}</dd></div>
        </dl>
        <section className="space-y-2">
          <h2 className="text-lg font-bold">About this tuition</h2>
          <p className="leading-relaxed wrap-anywhere whitespace-pre-wrap text-muted-foreground">{post.description}</p>
        </section>
        <Suspense fallback={<p role="status" className="text-sm text-muted-foreground">Checking application access…</p>}>
          <ApplyAction id={post._id} title={post.title} />
        </Suspense>
      </div>
    </article>
  );
}

export default function TuitionDetailPage({ params }: PageProps<"/tuitions/[id]">) {
  return (
    <>
      <SiteNavbar />
      <main className="mx-auto w-full max-w-5xl space-y-5 px-5 py-8 sm:px-8">
        <Link href="/tuitions" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft aria-hidden="true" className="size-4" /> All tuitions</Link>
        <Suspense fallback={<div role="status" aria-label="Loading tuition details" className="h-72 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />}>
          <TuitionDetails params={params} />
        </Suspense>
      </main>
    </>
  );
}
