"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function TuitionBanner({ image }: { image?: string | null }) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <div className="relative grid h-48 place-items-center overflow-hidden bg-linear-to-br from-[#eee6ff] to-[#f8f5ff] text-primary sm:h-72">
      <span className="grid size-20 place-items-center rounded-3xl border border-primary/15 bg-card/70">
        <BookOpen aria-hidden="true" className="size-10" />
      </span>
      {image && failed !== image && (
        <Image unoptimized src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" onError={() => setFailed(image)} />
      )}
    </div>
  );
}
