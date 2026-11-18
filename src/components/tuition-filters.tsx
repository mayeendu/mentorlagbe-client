"use client";

import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Filters = { search?: string; subject?: string; classLevel?: string; mode?: "" | "home" | "online" };
const modes = [
  { value: "home", label: "Home tuition" },
  { value: "online", label: "Online" },
];
const field = "form-control";

export function TuitionFilters({
  filters = {}, subjects, classLevels, defaultOpen = false, children,
}: { filters?: Filters; subjects: readonly string[]; classLevels: string[] | null; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState<boolean | null>(null);
  const router = useRouter();
  const panelId = useId();
  const subjectList = useId();
  const selectedClass = classLevels?.find((level) => level.toLowerCase() === filters.classLevel?.toLowerCase()) ?? filters.classLevel ?? "";
  const count = Object.values(filters).filter(Boolean).length;

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = new URLSearchParams();
    for (const key of ["search", "subject", "classLevel"]) {
      const value = form.get(key);
      if (typeof value === "string" && value.trim()) query.set(key, value.trim());
    }
    const selectedModes = form.getAll("mode");
    if (selectedModes.length === 1) query.set("mode", String(selectedModes[0]));
    router.push(query.size ? "/tuitions?" + query : "/tuitions");
  }

  function toggle(expanded: boolean) {
    return (
      <Button type="button" variant="outline" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(!expanded)}>
        <SlidersHorizontal aria-hidden="true" /> Filters
        {count > 0 && <span className="rounded-full bg-primary/10 px-2 text-xs text-primary">{count}</span>}
        <ChevronDown aria-hidden="true" className={expanded ? "rotate-180" : undefined} />
      </Button>
    );
  }

  const panelVisibility = open === null ? (defaultOpen ? "hidden md:block" : "hidden") : open ? "" : "hidden";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="md:hidden">{toggle(open ?? false)}</div>
        <div className="hidden md:block">{toggle(open ?? defaultOpen)}</div>
        {count > 0 && <Link href="/tuitions" className="text-sm font-semibold text-primary underline">Clear filters</Link>}
      </div>
      <div className="flex flex-col items-start gap-5 md:flex-row">
        <aside id={panelId} aria-label="Tuition filters" className={"w-full shrink-0 rounded-2xl border bg-card p-4 md:w-60 " + panelVisibility}>
          <form key={JSON.stringify(filters)} onSubmit={apply} className="space-y-4">
            <label className="grid gap-2 text-sm font-semibold">
              Search by keyword
              <span className="relative block">
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input name="search" type="search" defaultValue={filters.search} maxLength={100} placeholder="Title or subject" className={field + " pl-9"} />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Subject
              <input name="subject" list={subjectList} defaultValue={filters.subject} maxLength={80} placeholder="All subjects" className={field} />
            </label>
            <datalist id={subjectList}>{subjects.map((subject) => <option key={subject} value={subject} />)}</datalist>
            <label className="grid gap-2 text-sm font-semibold">
              Class level
              <select name="classLevel" defaultValue={selectedClass} className={field}>
                <option value="">All class levels</option>
                {selectedClass && !classLevels?.includes(selectedClass) && <option value={selectedClass}>{selectedClass}</option>}
                {classLevels?.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
              {classLevels === null && <span className="text-xs font-normal text-muted-foreground">Class levels are temporarily unavailable.</span>}
            </label>
            <fieldset className="space-y-1 border-t pt-3">
              <legend className="pr-2 text-sm font-semibold">Tuition mode</legend>
              {modes.map(({ value, label }) => (
                <label key={value} className="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-muted has-checked:bg-primary/5 has-checked:text-primary">
                  <input type="checkbox" name="mode" value={value} defaultChecked={filters.mode === value} className="size-4 accent-primary" />
                  {label}
                </label>
              ))}
            </fieldset>
            <Button type="submit" size="lg" className="w-full rounded-xl">Apply filters</Button>
          </form>
        </aside>
        <div className="w-full min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
