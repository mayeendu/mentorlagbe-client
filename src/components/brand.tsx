import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="inline-flex w-fit items-center gap-2.5 text-xl font-bold tracking-[-0.05em]">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-white">
        <GraduationCap aria-hidden="true" className="size-5" />
      </span>
      Mentor<span className="-ml-2.5 text-primary">Lagbe</span>
    </Link>
  );
}
