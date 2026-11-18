"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";
import { upgradePrices } from "@/lib/payments";

export function UpgradeButton({ role, className }: { role: "student" | "tutor"; className?: string }) {
  const [busy, setBusy] = useState(false);

  async function checkout() {
    setBusy(true);
    try {
      const { url, provider } = await authenticatedApiJson<{ url: string; provider: "mock" | "stripe" }>("/api/payments/checkout", { method: "POST" });
      const target = new URL(url);
      const allowed = provider === "mock"
        ? target.origin === window.location.origin && target.pathname === "/payments/mock"
        : provider === "stripe" && target.origin === "https://checkout.stripe.com";
      if (!allowed) throw new Error("Invalid Checkout address.");
      window.location.assign(target.href);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open Checkout.");
      setBusy(false);
    }
  }

  return <Button type="button" className={className} disabled={busy} onClick={() => void checkout()}>
    {busy ? "Opening checkout…" : "Upgrade to Pro · $" + upgradePrices[role]}
  </Button>;
}
