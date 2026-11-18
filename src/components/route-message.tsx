import { CircleAlert, Search } from "lucide-react";
import type { ReactNode } from "react";

export function RouteMessage({ title, detail, children, error = false }: {
  title: string; detail: string; children: ReactNode; error?: boolean;
}) {
  const Icon = error ? CircleAlert : Search;
  return (
    <section className="mx-auto w-full max-w-lg space-y-4 rounded-3xl border bg-card p-6 text-center shadow-sm sm:p-9">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-primary"><Icon aria-hidden="true" className="size-6" /></span>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">{children}</div>
    </section>
  );
}
