"use client";

import { BookOpen, CalendarDays, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { demoTuitions, subjects } from "@/lib/demo-tuitions";

function TuitionCard({ tuition }: { tuition: typeof demoTuitions[number] }) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border bg-card p-5 shadow-[0_4px_18px_#27174707] transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <span className={`grid size-11 place-items-center rounded-xl ${tuition.color}`}><BookOpen aria-hidden="true" className="size-5" /></span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{tuition.format}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight">{tuition.title}</h3>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{tuition.subject}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-4 shrink-0" />{tuition.location}</span>
        <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-4 shrink-0" />{tuition.days}</span>
      </div>
      <div className="mt-5 flex items-baseline gap-1.5 border-t pt-4">
        <span className="text-lg font-bold text-primary">{tuition.pay}</span>
        <span className="text-xs text-muted-foreground">/ month</span>
      </div>
    </article>
  );
}

export function TuitionBrowser({ initialSubject }: { initialSubject: string }) {
  const [subject, setSubject] = useState(initialSubject);
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const listings = demoTuitions.filter((item) => (
    (!subject || item.subject === subject) &&
    `${item.title} ${item.subject} ${item.location} ${item.format}`.toLowerCase().includes(query)
  ));

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="flex items-center gap-2 rounded-xl border bg-card px-3">
          <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">Search demo listings</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subject, class, or area" className="h-11 w-full min-w-0 rounded-md bg-transparent text-sm focus-visible:outline-2 focus-visible:outline-primary" />
        </label>
        <label>
          <span className="sr-only">Subject</span>
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="h-11 w-full rounded-xl border bg-card px-3 text-sm sm:w-48">
            <option value="">All subjects</option>
            {subjects.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <p className="sr-only" role="status">{listings.length} demo listings found</p>
      {listings.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((tuition) => <TuitionCard key={tuition.title} tuition={tuition} />)}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="font-semibold">No demo listings match your search.</p>
          <button type="button" className="mt-2 text-sm font-semibold text-primary underline" onClick={() => { setSearch(""); setSubject(""); }}>Clear filters</button>
        </div>
      )}
    </>
  );
}
