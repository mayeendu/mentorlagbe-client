import "server-only";
import { connection } from "next/server";
import { serverApiUrl } from "./server-api";

export const subjects = ["Mathematics", "English", "Science", "ICT", "Bangla", "Business Studies"] as const;
export type PublicTuition = {
  _id: string;
  title: string;
  subject: string;
  classLevel?: string | null;
  format: "Home tuition" | "Online";
  daysPerWeek: number;
  monthlyFee: number;
  location: string;
  createdAt: string;
};
export type PublicTuitionDetails = PublicTuition & {
  tutorName: string | null;
  description: string;
  imageUrl: string | null;
};

type Listings = { items: PublicTuition[]; total: number; page: number; limit: number };

async function fetchPublicTuitions(suffix: string) {
  await connection();
  return fetch(serverApiUrl("/api/tuitions" + suffix), {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

export async function getPublicTuitions(filters: URLSearchParams): Promise<Listings> {
  const result = await fetchPublicTuitions("?" + filters);
  if (!result.ok) throw new Error("Tuition listings are unavailable.");
  return result.json();
}

export async function getPublicClassLevels(): Promise<string[]> {
  const result = await fetchPublicTuitions("/class-levels");
  if (!result.ok) throw new Error("Class levels are unavailable.");
  const data: { classLevels: string[] } = await result.json();
  return data.classLevels;
}

export async function getPublicTuition(id: string): Promise<PublicTuitionDetails | null> {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const result = await fetchPublicTuitions("/" + id);
  if (result.status === 404) return null;
  if (!result.ok) throw new Error("Tuition details are unavailable.");
  return result.json();
}

const fee = new Intl.NumberFormat("en-BD");
export function monthlyFee(amount: number) {
  return "৳" + fee.format(amount);
}
export function weeklySchedule(days: number) {
  return days + (days === 1 ? " day per week" : " days per week");
}
