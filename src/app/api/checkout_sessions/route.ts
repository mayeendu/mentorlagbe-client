import { serverApiUrl } from "@/lib/server-api";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization || !/^Bearer +[\w-]+\.[\w-]+\.[\w-]+$/i.test(authorization)) {
    return Response.json({ error: "Bearer token required" }, {
      status: 401, headers: { ...noStore, "WWW-Authenticate": "Bearer" },
    });
  }

  try {
    const response = await fetch(serverApiUrl("/api/payments/checkout"), {
      method: "POST", headers: { authorization }, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(30_000),
    });
    const result: { error?: unknown; url?: unknown; provider?: unknown } | null = await response.json();
    if (!response.ok) {
      return Response.json({ error: typeof result?.error === "string" ? result.error : "Could not open Checkout." }, {
        status: response.status, headers: noStore,
      });
    }

    if (typeof result?.url !== "string") throw new Error("Missing Checkout URL");
    const target = new URL(result.url);
    if (result.provider === "mock" && target.pathname === "/payments/mock" && process.env.NODE_ENV !== "production") {
      return new Response(null, { status: 303, headers: { ...noStore, Location: target.pathname + target.search } });
    }
    if (result.provider === "stripe" && target.origin === "https://checkout.stripe.com" && !target.username && !target.password) {
      return new Response(null, { status: 303, headers: { ...noStore, Location: target.href } });
    }
    throw new Error("Invalid Checkout URL");
  } catch {
    return Response.json({ error: "Checkout is temporarily unavailable." }, { status: 502, headers: noStore });
  }
}
