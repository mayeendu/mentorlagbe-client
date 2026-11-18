import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { serverApiUrl } from "./server-api";

export const dashboardTitles = {
  student: "Student dashboard",
  tutor: "Tutor dashboard",
  admin: "Admin dashboard",
};

export type Role = keyof typeof dashboardTitles;
export type AccountProfile = { id: string; name: string; image: string | null; email: string; role: Role; plan: string };

function isRole(value: unknown): value is Role {
  return typeof value === "string" && Object.hasOwn(dashboardTitles, value);
}

export const getAccountProfile = cache(async (): Promise<AccountProfile | null> => {
  const cookie = (await cookies()).toString();
  if (!cookie) return null;

  const response = await fetch(serverApiUrl("/api/auth/get-session?disableRefresh=true"), {
    headers: { cookie },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8_000),
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Could not verify the session.");

  const session: { user?: { id?: unknown; image?: unknown; role?: unknown; name?: unknown; email?: unknown; plan?: unknown } } | null = await response.json();
  const user = session?.user;
  if (!user || typeof user.id !== "string" || !user.id || !isRole(user.role)) return null;
  return {
    id: user.id,
    image: typeof user.image === "string" ? user.image : null,
    role: user.role,
    name: typeof user.name === "string" && user.name.trim() ? user.name : "MentorLagbe member",
    email: typeof user.email === "string" ? user.email : "",
    plan: typeof user.plan === "string" ? user.plan : "free",
  };
});

export async function requireDashboardProfile(): Promise<AccountProfile> {
  const profile = await getAccountProfile();
  if (!profile) redirect("/sign-in");
  return profile;
}

export async function requireDashboardRole(): Promise<Role> {
  return (await requireDashboardProfile()).role;
}
