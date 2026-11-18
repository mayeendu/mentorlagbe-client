import Link from "next/link";
import { RouteMessage } from "@/components/route-message";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteNavbar />
      <main id="main-content" tabIndex={-1} className="grid flex-1 place-items-center bg-muted px-4 py-12">
        <RouteMessage title="Page not found" detail="This page may have moved or the address may be incorrect.">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>Homepage</Link>
          <Link href="/tuitions" className={buttonVariants()}>Find tuition</Link>
        </RouteMessage>
      </main>
      <SiteFooter />
    </>
  );
}
