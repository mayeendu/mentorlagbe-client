"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function TuitionUnavailable({ message }: { message: string }) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  return (
    <div role="alert" className="space-y-3 rounded-2xl border bg-card p-6">
      <p>{message}</p>
      <Button type="button" variant="outline" disabled={refreshing} onClick={() => startTransition(() => router.refresh())}>
        {refreshing ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}
