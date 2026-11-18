function readOrigin(value, key, production) {
  try {
    if (!value || value.trim() !== value) throw new Error();
    const url = new URL(value);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      (url.protocol !== "https:" && (production || url.protocol !== "http:" || !loopback)) ||
      (production && loopback)) throw new Error();
    return url.origin;
  } catch {
    throw new Error(key + " must be an HTTPS origin without a path or credentials (loopback HTTP is allowed only in development).");
  }
}

export function readClientEnvironment(env = process.env) {
  const production = env.NODE_ENV === "production";
  const publicApiOrigin = readOrigin(env.NEXT_PUBLIC_API_URL, "NEXT_PUBLIC_API_URL", production);
  const serverApiOrigin = env.API_URL === undefined ? publicApiOrigin : readOrigin(env.API_URL, "API_URL", production);
  return { publicApiOrigin, serverApiOrigin, production };
}

export function securityHeaders(publicApiOrigin, production) {
  const policy = [
    "default-src 'self'", "base-uri 'none'", "object-src 'none'", "frame-ancestors 'none'", "form-action 'self'",
    "script-src 'self' 'unsafe-inline'" + (production ? "" : " 'unsafe-eval'"),
    "style-src 'self' 'unsafe-inline'", "font-src 'self'",
    "img-src 'self' data: blob: https://i.ibb.co",
    "connect-src 'self' " + publicApiOrigin + (production ? "" : " ws: wss:"),
  ].join("; ");
  return [
    { key: "Content-Security-Policy", value: policy },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ...(production ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
  ];
}
