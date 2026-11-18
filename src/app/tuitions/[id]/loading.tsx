import { TuitionDetailSkeleton } from "@/components/loading-skeletons";
import { SiteNavbar } from "@/components/site-navbar";

export default function LoadingTuitionDetails() {
  return (
    <>
      <SiteNavbar />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8">
        <TuitionDetailSkeleton />
      </main>
    </>
  );
}
