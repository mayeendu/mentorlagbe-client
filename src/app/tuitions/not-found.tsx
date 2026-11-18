import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function TuitionNotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-5 py-10 sm:px-8">
      <h1 className="text-2xl font-bold">Tuition unavailable</h1>
      <Link href="/tuitions" className={buttonVariants()}>Browse tuition</Link>
    </div>
  );
}
