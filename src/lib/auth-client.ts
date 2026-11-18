import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;

export const authClient = createAuthClient({
  basePath: "/api/auth",
  baseURL: typeof window === "undefined" ? undefined : window.location.origin,
  plugins: [jwtClient()],
  fetchOptions: { credentials: "same-origin", redirect: "error", cache: "no-store" },
});
