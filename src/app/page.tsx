import { ArrowRight, BookOpen, Calculator, Check, FlaskConical, GraduationCap, Languages, MapPin, Monitor, Search, Sparkles, Users, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Brand } from "@/components/brand";
import { TuitionSkeleton } from "@/components/loading-skeletons";
import { SiteNavbar } from "@/components/site-navbar";
import { TuitionCards } from "@/components/tuition-browser";
import { TuitionUnavailable } from "@/components/tuition-unavailable";
import { buttonVariants } from "@/components/ui/button";
import { getPublicTuitions, subjects } from "@/lib/public-tuitions";

const categoryIcons = [Calculator, BookOpen, FlaskConical, Monitor, Languages, Wallet];
const steps = [
  { title: "Explore tuition", text: "Browse by subject, class level, or mode to find a tuition that fits.", icon: Search },
  { title: "Create your profile", text: "Join as a student or tutor and set up your MentorLagbe account.", icon: Users },
  { title: "Plan your next lesson", text: "Decide what to study, how often to meet, and which format works for you.", icon: GraduationCap },
];
const testimonials = [
  { quote: "I’d start with the subject filter and see which lessons fit around my school schedule.", name: "Student", initials: "S" },
  { quote: "Seeing the expected schedule and monthly rate upfront would make it easier to shortlist tuitions.", name: "Tutor", initials: "T" },
  { quote: "I’d compare online and home tuition before deciding what works for our family.", name: "Parent", initials: "P" },
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
      <main>
        <section className="overflow-hidden border-b bg-[#f8f5ff]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-11 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.92fr] lg:gap-14 lg:py-18">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#e5d9ff] bg-[#efe7ff] px-3 py-1.5 text-xs font-bold text-[#582db3]">
                <MapPin aria-hidden="true" className="size-3.5" /> Home and online tuition in Bangladesh
              </p>
              <h1 className="mt-5 text-[clamp(2.65rem,6.1vw,5.45rem)] leading-[0.99] font-bold tracking-[-0.075em] text-[#211631]">
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
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.8rem] bg-[#ded2ee]">
                <Image src="/tutoring-hero.webp" alt="A tutor and student working through a notebook together" fill preload sizes="(max-width: 639px) 92vw, (max-width: 1023px) 560px, 45vw" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section id="tuition" className="mx-auto max-w-7xl scroll-mt-6 px-5 py-14 sm:px-8 sm:py-19">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured tuitions</h2>
            <Link href="/tuitions" className={buttonVariants({ variant: "outline" })}>View all tuitions <ArrowRight aria-hidden="true" /></Link>
          </div>
          <Suspense fallback={<TuitionSkeleton showFilters={false} />}><FeaturedListings /></Suspense>
        </section>

        <section id="how-it-works" className="scroll-mt-6 border-y bg-[#f8f5ff]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
            <SectionHeading label="How it works" title="From search to study" />
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(({ title, text, icon: Icon }) => (
                <article key={title} className="rounded-2xl border bg-card p-6">
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {subjects.map((subject, index) => {
              const Icon = categoryIcons[index];
              return (
                <Link key={subject} href={`/tuitions?subject=${encodeURIComponent(subject)}`} className="group flex min-w-0 flex-col items-start gap-3 rounded-2xl border bg-card p-4 text-sm font-semibold transition-colors hover:border-primary/50 hover:bg-muted sm:p-5">
                  <Icon aria-hidden="true" className="size-5 text-primary" />{subject}
                </Link>
              );
            })}
          </div>
        </section>

        <section id="pricing" className="scroll-mt-6 border-y bg-[#f8f5ff]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
            <SectionHeading label="Pricing" title="Start with Free" description="Create an account for free. Pro is a preview of a future plan." />
            <div className="grid max-w-4xl gap-4 md:grid-cols-2">
              <article className="flex flex-col items-start rounded-3xl border bg-card p-6 sm:p-8">
                <h3 className="text-lg font-bold">Free</h3>
                <p className="mt-2 text-4xl font-bold tracking-tight">৳0</p>
                <ul className="mt-5 mb-7 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check aria-hidden="true" className="size-4 text-primary" /> Browse tuition</li>
                  <li className="flex items-center gap-2"><Check aria-hidden="true" className="size-4 text-primary" /> Student or Tutor account</li>
                  <li className="flex items-center gap-2"><Check aria-hidden="true" className="size-4 text-primary" /> Role-specific dashboard</li>
                </ul>
                <Link href="/sign-up" className={buttonVariants({ className: "mt-auto" })}>Create a free account <ArrowRight aria-hidden="true" /></Link>
              </article>
              <article className="rounded-3xl bg-[#2e194c] p-6 text-white sm:p-8">
                <h3 className="flex items-center gap-2 text-lg font-bold"><Sparkles aria-hidden="true" className="size-4 text-[#ffda8c]" /> Pro</h3>
                <p className="mt-2 text-3xl font-bold tracking-tight">Coming later</p>
                <p className="mt-5 text-sm leading-relaxed text-[#e5d8fa]">Planned for tutors who want more ways to stand out and manage opportunities. Pricing will be announced at launch.</p>
              </article>
            </div>
          </div>
        </section>

        <section aria-labelledby="testimonials-title" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
          <p className="mb-2 text-xs font-bold tracking-[0.15em] text-primary uppercase">Illustrative testimonials</p>
          <h2 id="testimonials-title" className="text-3xl font-bold tracking-[-0.05em] sm:text-[2.65rem]">Learning from every side</h2>
          <p className="mt-2 text-sm text-muted-foreground">Fictional examples of what students, tutors, and families might look for.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {testimonials.map(({ quote, name, initials }) => (
              <figure key={name} className="flex flex-col justify-between gap-6 rounded-2xl border bg-card p-6">
                <blockquote className="text-sm leading-relaxed text-muted-foreground">“{quote}”</blockquote>
                <figcaption className="flex items-center gap-2 text-sm font-semibold">
                  <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-muted text-primary">{initials}</span>{name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t bg-[#f8f5ff]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Brand />
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link href="/tuitions" className="hover:text-primary">Find tuition</Link>
            <Link href="#subjects" className="hover:text-primary">Subjects</Link>
            <Link href="#pricing" className="hover:text-primary">Pricing</Link>
          </nav>
          <p className="text-sm text-muted-foreground">© MentorLagbe</p>
        </div>
      </footer>
    </>
  );
}
