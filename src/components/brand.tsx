import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={"inline-flex w-fit shrink-0 items-center gap-2 text-lg font-bold tracking-[-0.05em] sm:text-xl " + (inverse ? "text-white focus-visible:outline-white" : "")}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-white">
        <GraduationCap aria-hidden="true" className="size-5" />
      </span>
      Mentor<span className={"-ml-2 " + (inverse ? "text-[#dfccff]" : "text-primary")}>Lagbe</span>
    </Link>
  );
}
