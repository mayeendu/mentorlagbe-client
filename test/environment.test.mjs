import assert from "node:assert/strict";
import { test } from "node:test";
import { readClientEnvironment, securityHeaders } from "../config/environment.mjs";

test("requires HTTPS API origins at production startup", () => {
  const base = { NODE_ENV: "production", NEXT_PUBLIC_API_URL: "https://api.example.test" };
  assert.deepEqual(readClientEnvironment(base), { publicApiOrigin: base.NEXT_PUBLIC_API_URL, serverApiOrigin: base.NEXT_PUBLIC_API_URL, production: true });
  assert.equal(readClientEnvironment({ ...base, API_URL: "https://upstream.example.test" }).serverApiOrigin, "https://upstream.example.test");
  for (const value of [undefined, "", "https://user:password@api.example.test", "https://api.example.test/auth", "http://api.example.test", "https://localhost"]) {
    assert.throws(() => readClientEnvironment({ ...base, NEXT_PUBLIC_API_URL: value }), /NEXT_PUBLIC_API_URL/);
  }
  assert.throws(() => readClientEnvironment({ ...base, API_URL: "" }), /API_URL/);
  assert.equal(readClientEnvironment({ NEXT_PUBLIC_API_URL: "http://localhost:4321" }).publicApiOrigin, "http://localhost:4321");
});

test("production browser policy permits only configured API connections and disables embedding", () => {
  const headers = Object.fromEntries(securityHeaders("https://api.example.test", true).map(({ key, value }) => [key, value]));
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.match(headers["Strict-Transport-Security"], /max-age=31536000/);
  assert.match(headers["Content-Security-Policy"], /connect-src 'self' https:\/\/api.example.test$/);
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.doesNotMatch(headers["Content-Security-Policy"], /unsafe-eval/);
});
