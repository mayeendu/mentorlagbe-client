"use client";

import Link from "next/link";
import { RouteMessage } from "@/components/route-message";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AppError({ retry }: { retry: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="grid flex-1 place-items-center bg-muted px-4 py-12">
      <RouteMessage error title="This page couldn’t load" detail="Try again, or return to the homepage.">
        <Button type="button" onClick={retry}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>Homepage</Link>
      </RouteMessage>
    </main>
  );
}
