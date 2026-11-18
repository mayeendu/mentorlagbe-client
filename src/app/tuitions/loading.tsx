import { TuitionSkeleton } from "@/components/loading-skeletons";
import { SiteNavbar } from "@/components/site-navbar";

export default function LoadingTuitions() {
  return (
    <>
      <SiteNavbar />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl min-h-[calc(100svh-4.5rem)] flex-1 space-y-6 px-4 py-8 sm:px-8 sm:py-12">
        <div aria-hidden="true" className="h-9 w-40 rounded-lg bg-muted" />
        <TuitionSkeleton sidebar />
      </main>
    </>
  );
}
