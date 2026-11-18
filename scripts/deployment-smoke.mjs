import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

function httpsOrigin(value, name) {
  const url = URL.parse(value ?? "");
  assert.ok(url && url.protocol === "https:" && !url.username && !url.password &&
    url.pathname === "/" && !url.search && !url.hash, name + " must be an HTTPS origin");
  return url.origin;
}

export async function runDeploymentSmoke(clientOrigin, apiOrigin, request = fetch) {
  const get = (origin, path, init = {}) => request(new URL(path, origin), {
    redirect: "manual", signal: AbortSignal.timeout(15_000), ...init,
  });
  const health = await get(apiOrigin, "/api/health");
  assert.equal(health.status, 200, "Render health check");
  assert.equal((await health.json()).status, "ok");

  const catalog = await get(apiOrigin, "/api/tuitions?limit=1");
  assert.equal(catalog.status, 200, "Public tuition catalogue");
  const listings = await catalog.json();
  assert.ok(Array.isArray(listings.items) && listings.items.length <= 1);
  assert.ok(Number.isInteger(listings.total) && listings.total >= listings.items.length);
  if (listings.items[0]) {
    const id = listings.items[0]._id;
    assert.match(id, /^[a-f0-9]{24}$/i);
    const detail = await get(apiOrigin, "/api/tuitions/" + id);
    assert.equal(detail.status, 200, "Public tuition detail");
    const post = await detail.json();
    assert.equal(post._id, id);
    assert.equal(Object.hasOwn(post, "tutorId"), false);
  }

  const protectedPaths = [
    "/api/users/me", "/api/tutor/tuitions", "/api/tutor/applicants",
    "/api/student/my-applications", "/api/admin/tuitions", "/api/admin/stats", "/api/admin/users", "/api/admin/payments",
  ];
  for (const path of protectedPaths) assert.equal((await get(apiOrigin, path)).status, 401, path);

  const preflight = (origin) => get(apiOrigin, "/api/tuitions", {
    method: "OPTIONS",
    headers: { Origin: origin, "Access-Control-Request-Method": "GET", "Access-Control-Request-Headers": "authorization" },
  });
  const trusted = await preflight(clientOrigin);
  assert.equal(trusted.status, 204, "Render preflight");
  assert.equal(trusted.headers.get("access-control-allow-origin"), clientOrigin);
  assert.match(trusted.headers.get("access-control-allow-headers") ?? "", /authorization/i);
  const untrustedOrigin = clientOrigin === "https://untrusted.example.test"
    ? "https://other.example.test" : "https://untrusted.example.test";
  const untrusted = await preflight(untrustedOrigin);
  assert.equal(untrusted.status, 403, "Untrusted preflight");
  assert.equal(untrusted.headers.get("access-control-allow-origin"), null);

  const session = await get(clientOrigin, "/api/auth/get-session");
  assert.equal(session.status, 200, "Vercel auth rewrite");
  assert.match(session.headers.get("cache-control") ?? "", /no-store/i);
  assert.equal(await session.json(), null);

  const checkout = await get(clientOrigin, "/api/checkout_sessions", { method: "POST" });
  assert.equal(checkout.status, 401, "Anonymous checkout");

  for (const path of ["/dashboard", "/dashboard/admin", "/dashboard/tutor/my-tuitions"]) {
    const dashboard = await get(clientOrigin, path);
    if (dashboard.status >= 300 && dashboard.status < 400) {
      assert.equal(new URL(dashboard.headers.get("location"), clientOrigin).pathname, "/sign-in", path);
    } else {
      assert.equal(dashboard.status, 200, path);
      const body = await dashboard.text();
      assert.match(body, /NEXT_REDIRECT[^<]*\/sign-in|http-equiv="refresh"[^>]*\/sign-in/, path);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const clientOrigin = httpsOrigin(process.env.SMOKE_CLIENT_URL, "SMOKE_CLIENT_URL");
    const apiOrigin = httpsOrigin(process.env.SMOKE_API_URL, "SMOKE_API_URL");
    await runDeploymentSmoke(clientOrigin, apiOrigin);
    console.log("PASS: API health, public tuition, exact-origin CORS, auth proxy, and protected routes.");
  } catch (error) {
    console.error("FAIL: " + (error instanceof Error ? error.message : "Deployment smoke check failed."));
    process.exitCode = 1;
  }
}
