import Link from "next/link";
import { RouteMessage } from "@/components/route-message";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { buttonVariants } from "@/components/ui/button";

export default function TuitionNotFound() {
  return (
    <>
      <SiteNavbar />
      <main id="main-content" tabIndex={-1} className="grid flex-1 place-items-center bg-muted px-4 py-12">
        <RouteMessage title="Tuition unavailable" detail="This tuition listing is no longer available.">
          <Link href="/tuitions" className={buttonVariants()}>Browse tuition</Link>
        </RouteMessage>
      </main>
      <SiteFooter />
    </>
  );
}
