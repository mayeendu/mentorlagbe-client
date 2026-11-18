"use client";

import Link from "next/link";
import { RouteMessage } from "@/components/route-message";
import { SiteFooter } from "@/components/site-footer";
import { Button, buttonVariants } from "@/components/ui/button";

export default function TuitionError({ retry }: { retry: () => void }) {
  return (
    <>
      <main id="main-content" tabIndex={-1} className="grid flex-1 place-items-center bg-muted px-4 py-12">
        <RouteMessage error title="Tuition couldn’t load" detail="Try loading this page again, or return to the tuition listings.">
          <Button type="button" onClick={retry}>Try again</Button>
          <Link href="/tuitions" className={buttonVariants({ variant: "outline" })}>Find tuition</Link>
        </RouteMessage>
      </main>
      <SiteFooter />
    </>
  );
}
