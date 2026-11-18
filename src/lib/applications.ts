import { authenticatedApiJson } from "./api-client";

export type ApplicationRole = "student" | "tutor";
export type Application = {
  _id: string;
  tuitionId: string;
  studentName: string | null;
  tutorName: string | null;
  tuition: { title: string; subject: string; monthlyFee: number; format: string };
  phone: string;
  preferredSchedule: string;
  studentNote: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

export const applicationEndpoints = {
  student: "/api/student/my-applications",
  tutor: "/api/tutor/applicants",
};

export function getApplications(role: ApplicationRole, signal?: AbortSignal) {
  return authenticatedApiJson<Application[]>(applicationEndpoints[role], { signal });
}
