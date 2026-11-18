import assert from "node:assert/strict";
import { test } from "node:test";
import { runDeploymentSmoke } from "../scripts/deployment-smoke.mjs";

const client = "https://app.example.test";
const api = "https://api.example.test";
const listingId = "0123456789abcdef01234567";

function fixture(url, init) {
  assert.equal(init.redirect, "manual");
  if (url.origin === api && url.pathname === "/api/health") return Response.json({ status: "ok" });
  if (url.origin === api && init.method === "OPTIONS") {
    return init.headers.Origin === client
      ? new Response(null, { status: 204, headers: { "access-control-allow-origin": client, "access-control-allow-headers": "Authorization" } })
      : new Response(null, { status: 403 });
  }
  if (url.origin === api) {
    if (url.pathname === "/api/tuitions") return Response.json({ items: [{ _id: listingId }], total: 1 });
    if (url.pathname === "/api/tuitions/" + listingId) return Response.json({ _id: listingId, tutorName: "Demo tutor" });
    return new Response(null, { status: 401 });
  }
  assert.equal(url.origin, client);
  if (url.pathname === "/api/auth/get-session") return Response.json(null, { headers: { "cache-control": "no-store" } });
  if (url.pathname === "/api/checkout_sessions") return new Response(null, { status: 401 });
  if (url.pathname === "/dashboard") return new Response(null, { status: 307, headers: { location: "/sign-in" } });
  return new Response('<meta http-equiv="refresh" content="1;url=/sign-in"/>');
}

test("checks the frontend rewrite, exact Render origin and protected routes", async () => {
  await runDeploymentSmoke(client, api, fixture);
});

test("fails if a protected dashboard does not redirect guests", async () => {
  await assert.rejects(runDeploymentSmoke(client, api, (url, init) =>
    url.pathname === "/dashboard/admin" ? new Response("Admin dashboard") : fixture(url, init),
  ), /\/dashboard\/admin/);
});
