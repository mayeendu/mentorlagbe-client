# MentorLagbe web client

Use Node.js 24. Copy `.env.example` to an ignored `.env.local`, install dependencies with `npm ci`, and run `npm run dev`. Start the Express API separately.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Required browser-facing Express origin. Use an HTTPS origin in production. |
| `API_URL` | Optional HTTPS upstream override for Next.js server requests and the Better Auth rewrite. Defaults to `NEXT_PUBLIC_API_URL`. |

Use origins without a path or trailing query string. Set `NEXT_PUBLIC_API_URL` before building because Next.js embeds it in the browser bundle. Browser authentication uses same-origin `/api/auth/*` requests, which Next.js rewrites to Express. The browser sends authenticated data and upload requests directly to the configured API with a Bearer token. The frontend deployment does not need MongoDB, Better Auth, ImgBB, or Stripe credentials.

## Vercel preparation

| Vercel setting | Value |
| --- | --- |
| Repository | Standalone client repository |
| Root Directory | Leave blank for the standalone repository, or use `client` in a combined checkout |
| Framework Preset | Next.js |
| Node.js Version | 24.x |
| Install Command | `npm ci --include=dev` |
| Build Command | `npm run build` |
| Output Directory | Framework default |
| Git-triggered deployments | Disabled by `vercel.json` |

Set `NEXT_PUBLIC_API_URL` in Vercel's Production environment to the deployed Render HTTPS origin. Leave `API_URL` unset unless the server-side rewrite needs a different trusted upstream. Never prefix backend secrets with `NEXT_PUBLIC_`. A different preview hostname requires corresponding backend configuration. The production service only permits its exact configured client origin.

On Render, set `CLIENT_URL` to the exact Vercel production HTTPS origin (or its canonical custom domain). This is the frontend origin used for both CORS and Better Auth trusted origins. Keep `BETTER_AUTH_URL` set to the canonical Render HTTPS origin so JWT issuer and audience match Express. Keep `NODE_ENV=production` and `PAYMENT_MODE=disabled` unless live Stripe is configured.

The browser calls Better Auth on the frontend origin. The rewrite preserves host-only, HttpOnly, Secure cookies with SameSite=Lax. The dashboard validates the session server-side. Requests to the Render data API carry a short-lived Bearer JWT and omit cookies. Keep the auth rewrite and the production origins consistent when changing either domain.

### Hosted smoke checks

After a separately authorized deployment, set `SMOKE_CLIENT_URL` and `SMOKE_API_URL` to the production frontend and backend HTTPS origins and run `npm run test:smoke`. It checks backend readiness, allowed and rejected CORS preflights, the anonymous session through Vercel, and guest redirects for protected routes. It creates no users, sessions, or payments.

Complete a signed-in smoke check with a designated test account. Verify sign-in, sign-out, dashboard refresh, a role-restricted page, and an authenticated read. Verify uploads separately if enabled.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before release. The production build requires an HTTPS API origin. Use a reserved fixture origin when building without a live API. The local start command is `npm start`.

Next.js currently emits inline hydration and streaming scripts. Its production CSP allows those inline scripts and styles and limits remote connections to the configured API. Scripts cannot use `eval` in production.
