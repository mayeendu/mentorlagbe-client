import "client-only";
import { apiBaseURL, authClient } from "./auth-client";

export async function authenticatedApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = new URL(apiBaseURL);
  const url = new URL(path, base);
  if (url.origin !== base.origin || !url.pathname.startsWith("/api/")) {
    throw new Error("Expected a URL on the MentorLagbe API.");
  }

  const { data, error } = await authClient.token({ fetchOptions: { cache: "no-store" } });
  if (error || !data?.token) throw new Error("Could not obtain an API token.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${data.token}`);
  return fetch(url, { ...init, headers, credentials: "omit", redirect: "error", cache: "no-store" });
}
