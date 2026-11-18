import { ArrowRight, BookOpen, BookOpenText, Calculator, Check, FlaskConical, GraduationCap, Languages, MapPin, Monitor, Quote, Search, Sparkles, Users, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { TuitionSkeleton } from "@/components/loading-skeletons";
import { PricingAction } from "@/components/pricing-action";
import { upgradePrices } from "@/lib/payments";
import { SiteNavbar } from "@/components/site-navbar";
import { TuitionCards } from "@/components/tuition-browser";
import { TuitionUnavailable } from "@/components/tuition-unavailable";
import { buttonVariants } from "@/components/ui/button";
import { getPublicTuitions, subjects } from "@/lib/public-tuitions";

const subjectCards = {
  Mathematics: { icon: Calculator, color: "bg-[#eee6ff] text-[#6036b6]", surface: "from-[#f9f5ff] hover:border-[#c5adee]" },
  English: { icon: BookOpenText, color: "bg-[#e3edff] text-[#315aa9]", surface: "from-[#f4f8ff] hover:border-[#afc6ee]" },
  Science: { icon: FlaskConical, color: "bg-[#dff3e8] text-[#216946]", surface: "from-[#f3fbf6] hover:border-[#afd8bf]" },
  ICT: { icon: Monitor, color: "bg-[#dff2f6] text-[#206778]", surface: "from-[#f2fafb] hover:border-[#abd5dd]" },
  Bangla: { icon: Languages, color: "bg-[#fae6ee] text-[#963e64]", surface: "from-[#fff6fa] hover:border-[#eab8ca]" },
  "Business Studies": { icon: Wallet, color: "bg-[#fcebcf] text-[#865918]", surface: "from-[#fff9ef] hover:border-[#e8c993]" },
} satisfies Record<(typeof subjects)[number], { icon: typeof Calculator; color: string; surface: string }>;
const steps = [
  { title: "Explore tuition", text: "Browse by subject, class level, or mode to find a tuition that fits.", icon: Search },
  { title: "Create your profile", text: "Join as a student or tutor and set up your MentorLagbe account.", icon: Users },
  { title: "Plan your next lesson", text: "Decide what to study, how often to meet, and which format works for you.", icon: GraduationCap },
];
const testimonials = [
  { quote: "I’d start with the subject filter and see which lessons fit around my school schedule.", name: "Student", portrait: "/testimonials/student.webp", accent: "bg-[#eee7ff] text-[#5a32a8]" },
  { quote: "Seeing the expected schedule and monthly rate upfront would make it easier to shortlist tuitions.", name: "Tutor", portrait: "/testimonials/tutor.webp", accent: "bg-[#e2f2e9] text-[#256247]" },
  { quote: "I’d compare online and home tuition before deciding what works for our family.", name: "Parent", portrait: "/testimonials/parent.webp", accent: "bg-[#f9e7ef] text-[#93395e]" },
];

function SectionHeading({ label, title, description }: { label: string; title: string; description?: string }) {
  return (
    <div className="mb-7 max-w-2xl sm:mb-9">
      <p className="mb-2 text-xs font-bold tracking-[0.15em] text-primary uppercase">{label}</p>
      <h2 className="text-3xl leading-tight font-bold tracking-[-0.05em] sm:text-[2.65rem]">{title}</h2>
      {description && <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>}
    </div>
  );
}

async function FeaturedListings() {
  const result = await getPublicTuitions(new URLSearchParams({ limit: "6" })).catch(() => null);
  if (!result) return <TuitionUnavailable message="Featured tuitions are temporarily unavailable." />;
  return result.items.length ? <TuitionCards listings={result.items} /> : (
    <p className="rounded-2xl border bg-card p-6 text-muted-foreground">No tuition posts are available yet.</p>
  );
}

export default function Home() {
  return (
    <>
      <SiteNavbar />
      <main id="main-content" tabIndex={-1}>
        <section className="overflow-hidden border-b bg-linear-to-br from-[#f8f5ff] via-[#f8f5ff] to-[#efe7ff]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-11 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.92fr] lg:gap-14 lg:py-18">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#e5d9ff] bg-[#efe7ff] px-3 py-1.5 text-xs font-bold text-[#582db3]">
                <MapPin aria-hidden="true" className="size-3.5" /> Home and online tuition in Bangladesh
              </p>
              <h1 className="mt-5 text-balance text-[clamp(2.5rem,6.1vw,5.45rem)] leading-[0.99] font-bold tracking-[-0.075em] text-[#211631]">
                Find your kind<br className="hidden sm:block" /> of <span className="text-[#6539cf]">learning.</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-[#62596e] sm:text-lg">
                Explore tuition by subject, schedule, and location. Find a fit for how you learn or what you teach.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/tuitions" className={buttonVariants({ size: "lg", className: "h-12 gap-2 px-5" })}>
                  <Search aria-hidden="true" /> Search tuition <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 px-5" })}>How it works</Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[1.8rem] bg-[#e7dbff] sm:translate-x-3 sm:translate-y-3" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.8rem] bg-[#ded2ee] shadow-[0_18px_45px_#2e194c20]">
                <Image src="/tutoring-hero.webp" alt="A tutor and student working through a notebook together" fill preload sizes="(max-width: 639px) 92vw, (max-width: 1023px) 560px, 45vw" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section id="tuition" className="mx-auto max-w-7xl scroll-mt-6 px-5 py-14 sm:px-8 sm:py-19">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl">Featured tuitions</h2>
            <Link href="/tuitions" className={buttonVariants({ variant: "outline" })}>View all tuitions <ArrowRight aria-hidden="true" /></Link>
          </div>
          <Suspense fallback={<TuitionSkeleton />}><FeaturedListings /></Suspense>
        </section>

        <section id="how-it-works" className="scroll-mt-6 border-y bg-[#f8f5ff]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
            <SectionHeading label="How it works" title="From search to study" />
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(({ title, text, icon: Icon }) => (
                <article key={title} className="rounded-3xl border bg-card p-6 shadow-sm motion-safe:transition-shadow hover:shadow-md sm:p-7">
                  <div className="mb-4 grid size-11 place-items-center rounded-xl bg-[#eee6ff] text-[#5629b7]"><Icon aria-hidden="true" className="size-5" /></div>
                  <h3 className="text-lg font-bold tracking-tight">{title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="subjects" className="mx-auto max-w-7xl scroll-mt-6 px-5 py-14 sm:px-8 sm:py-18">
          <SectionHeading label="Subject categories" title="What do you want to learn?" />
          <ul className="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
            {subjects.map((subject) => {
              const { icon: Icon, color, surface } = subjectCards[subject];
              return (
                <li key={subject} className="min-w-0">
                  <Link
                    href={`/tuitions?subject=${encodeURIComponent(subject)}`}
                    className={`group flex h-full min-w-0 flex-col gap-5 rounded-[1.4rem] border bg-card bg-linear-to-br to-card p-4 shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:hover:-translate-y-1 sm:p-5 ${surface}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`grid size-11 shrink-0 place-items-center rounded-xl sm:size-12 ${color}`}>
                        <Icon aria-hidden="true" className="size-5 sm:size-6" />
                      </span>
                      <ArrowRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <span className="mt-auto font-semibold leading-snug tracking-tight wrap-anywhere">{subject}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-6 border-y bg-[#f8f5ff]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto mb-9 max-w-xl text-center sm:mb-12">
              <h2 id="pricing-title" className="text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Plans and pricing</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Start free and upgrade to Pro any time with a one-time payment.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2 sm:gap-6">
              <article className="flex flex-col rounded-[1.75rem] border border-[#e8dff4] bg-card p-6 shadow-[0_12px_32px_#2e194c0a] sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eee6ff] text-[#5629b7]">
                    <BookOpen aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="text-xl font-bold tracking-tight">Free</h3>
                </div>
                <p className="mt-6 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">৳0</p>
                <ul className="my-6 space-y-3 border-t pt-5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2.5"><Check aria-hidden="true" className="size-4 shrink-0 text-primary" /> Browse tuition</li>
                  <li className="flex items-center gap-2.5"><Check aria-hidden="true" className="size-4 shrink-0 text-primary" /> Student or tutor account</li>
                  <li className="flex items-center gap-2.5"><Check aria-hidden="true" className="size-4 shrink-0 text-primary" /> Role-specific dashboard</li>
                </ul>
                <Link href="/sign-up" className={buttonVariants({ variant: "outline", size: "lg", className: "mt-auto w-full sm:w-fit" })}>
                  Create a free account <ArrowRight aria-hidden="true" />
                </Link>
              </article>

              <article className="flex flex-col rounded-[1.75rem] border border-[#573781] bg-linear-to-br from-[#25123e] via-[#342054] to-[#483069] p-6 text-white shadow-[0_18px_40px_#2e194c30] sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12 text-[#ffda8c]">
                    <Sparkles aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="text-xl font-bold tracking-tight">Pro</h3>
                </div>
                <dl className="mt-6 grid grid-cols-2 divide-x divide-white/15 rounded-2xl border border-white/15 bg-white/8 text-sm">
                  {(["student", "tutor"] as const).map((role) => (
                    <div key={role} className="min-w-0 p-3.5 sm:p-4">
                      <dt className="font-medium capitalize text-[#eadcf7]">{role} Pro</dt>
                      <dd className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
                        <span className="text-3xl font-bold tracking-tight sm:text-4xl">${upgradePrices[role]}</span>
                        <span className="text-xs font-medium text-[#eadcf7]">USD</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 mb-6 flex items-center gap-2.5 text-sm text-[#eadcf7]"><Check aria-hidden="true" className="size-4 shrink-0 text-[#ffda8c]" /> Unlimited tuition posts for Pro tutors</p>
                <div className="mt-auto min-h-10 text-foreground [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
                  <Suspense fallback={<p role="status" className="text-sm text-[#eadcf7]">Checking upgrade access…</p>}><PricingAction /></Suspense>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section aria-labelledby="testimonials-title" className="bg-linear-to-b from-background to-[#f8f5ff]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-xl text-center">
              <p className="mb-3 text-xs font-bold tracking-[0.15em] text-primary uppercase">Illustrative testimonials</p>
              <h2 id="testimonials-title" className="text-3xl font-bold tracking-[-0.05em] sm:text-5xl">Learning from every side</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">Fictional examples of what students, tutors, and families might look for.</p>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {testimonials.map(({ quote, name, portrait, accent }) => (
                <figure key={name} className="flex flex-col rounded-[1.75rem] border bg-card p-6 shadow-[0_12px_32px_#2e194c0a] sm:p-8">
                  <span className={`mb-5 grid size-10 place-items-center rounded-xl ${accent}`}>
                    <Quote aria-hidden="true" className="size-5" />
                  </span>
                  <blockquote className="mb-6 flex-1 text-base leading-relaxed text-foreground sm:text-lg">“{quote}”</blockquote>
                  <figcaption className="flex items-center gap-3 border-t pt-5">
                    <Image src={portrait} alt="" width={48} height={48} className="size-12 shrink-0 rounded-full object-cover ring-2 ring-primary/10" />
                    <span className="text-sm font-semibold">{name}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
