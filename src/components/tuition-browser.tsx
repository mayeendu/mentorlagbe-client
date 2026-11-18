import { ArrowRight, BookOpen, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { monthlyFee, weeklySchedule, type PublicTuition } from "@/lib/public-tuitions";

export function TuitionCards({ listings }: { listings: PublicTuition[] }) {
  return (
    <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((tuition) => (
        <li key={tuition._id} className="min-w-0">
          <Link href={"/tuitions/" + tuition._id} prefetch={false}
            className="group flex h-full min-w-0 flex-col rounded-2xl border bg-card p-5 shadow-[0_4px_18px_#27174707] transition-shadow hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <span className="grid size-11 place-items-center rounded-xl bg-[#eee8ff] text-[#5d35b9]"><BookOpen aria-hidden="true" className="size-5" /></span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{tuition.format}</span>
            </div>
            <h3 className="mt-4 text-lg font-bold tracking-tight wrap-anywhere group-hover:text-primary">{tuition.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground wrap-anywhere">{tuition.subject}{tuition.classLevel && " · " + tuition.classLevel}</p>
            <div className="mt-4 mb-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex min-w-0 items-center gap-1.5 wrap-anywhere"><MapPin aria-hidden="true" className="size-4 shrink-0" />{tuition.location}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-4 shrink-0" />{weeklySchedule(tuition.daysPerWeek)}</span>
            </div>
            <div className="mt-auto flex items-center gap-1.5 border-t pt-4">
              <span className="text-lg font-bold text-primary">{monthlyFee(tuition.monthlyFee)}</span>
              <span className="text-xs text-muted-foreground">/ month</span>
              <ArrowRight className="ml-auto size-4 text-primary" aria-hidden="true" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
