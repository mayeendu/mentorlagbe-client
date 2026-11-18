import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;

export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [jwtClient()],
  fetchOptions: { credentials: "include" },
});
