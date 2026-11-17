"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(result.error.message || "Sign-out failed.");
        return;
      }
      window.location.replace("/sign-in");
    } catch {
      setError("Could not reach the authentication service.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-60" onClick={signOut} disabled={pending}>
        <LogOut aria-hidden="true" className="size-4" />
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
