import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const authClient = createAuthClient({
  baseURL: apiBaseURL,
  plugins: [jwtClient()],
  fetchOptions: { credentials: "include" },
});
