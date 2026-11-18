"use client";

import Link from "next/link";
import { RouteMessage } from "@/components/route-message";
import { Button, buttonVariants } from "@/components/ui/button";

export default function DashboardError({ retry }: { retry: () => void }) {
  return (
    <RouteMessage error title="This dashboard page couldn’t load" detail="Try loading it again, or return to your dashboard.">
      <Button type="button" onClick={retry}>Try again</Button>
      <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>Dashboard</Link>
    </RouteMessage>
  );
}
