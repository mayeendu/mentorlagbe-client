import { z } from "zod";
import { authenticatedApiJson } from "./api-client";

export const tuitionFields = z.object({
  title: z.string().trim().min(3).max(100),
  subject: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  classLevel: z.string().trim().min(1).max(80).nullable().optional(),
  format: z.enum(["Home tuition", "Online"]),
  daysPerWeek: z.number().int().min(1).max(7),
  monthlyFee: z.number().int().min(1).max(1_000_000),
  description: z.string().trim().min(10).max(2000),
});
export type Tuition = z.infer<typeof tuitionFields> & {
  _id: string;
  imageUrl: string | null;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
};

export async function tuitionRequest<T>(suffix = "", init?: RequestInit): Promise<T> {
  return authenticatedApiJson<T>("/api/tutor/tuitions" + suffix, init);
}

export function tuitionJson(method: "POST" | "PATCH", body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
