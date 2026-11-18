# MentorLagbe web client

Use Node.js 24. Copy `.env.example` to an ignored `.env.local`, install dependencies with `npm ci`, and run `npm run dev`. Start the Express API separately.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Required browser-facing Express origin. Use an HTTPS origin in production. |
| `API_URL` | Optional HTTPS upstream override for Next.js server requests and the Better Auth rewrite. Defaults to `NEXT_PUBLIC_API_URL`. |

Use origins without a path or trailing query string. Set `NEXT_PUBLIC_API_URL` before building because Next.js embeds it in the browser bundle. Browser authentication uses same-origin `/api/auth/*` requests, which Next.js rewrites to Express. The browser sends authenticated data and upload requests directly to the configured API with a Bearer token. The frontend deployment does not need MongoDB, Better Auth, ImgBB, or Stripe credentials.

## Vercel preparation

Use the client repository as the Vercel project root. Set the frontend variables for the intended production origin, and set that frontend origin as `CLIENT_URL` on Express. The checked-in Vercel config disables deployments triggered by Git. Leave it disabled until deployment is authorized. Test sign-in, sign-out, dashboard refresh, and an image upload on the hosted origins before announcing availability.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before release. The production build requires an HTTPS API origin. Use a reserved fixture origin when building without a live API. The local start command is `npm start`.

Next.js currently emits inline hydration and streaming scripts. Its production CSP allows those inline scripts and styles and limits remote connections to the configured API. Scripts cannot use `eval` in production.
