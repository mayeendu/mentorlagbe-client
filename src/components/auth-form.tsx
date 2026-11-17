"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function AuthForm({ register }: { register: boolean }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const title = register ? "Create an account" : "Sign in";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const credentials = {
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    };
    const registration = {
      ...credentials,
      name: String(form.get("name")).trim(),
      accountType: form.get("accountType") === "tutor" ? "tutor" : "student",
    };

    setError("");
    setPending(true);
    try {
      const result = register
        ? await authClient.signUp.email(registration)
        : await authClient.signIn.email({ ...credentials, rememberMe: true });
      if (result.error) {
        setError(result.error.message || "Authentication failed.");
        return;
      }
      window.location.replace("/dashboard");
    } catch {
      setError("Could not reach the authentication service.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex flex-1 justify-center bg-muted px-4 py-10 sm:py-16">
      <div className="h-fit w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm sm:p-9">
        <h1 className="mb-6 text-3xl font-bold tracking-[-0.05em]">{title}</h1>
        <form className="grid gap-4 text-sm" onSubmit={submit}>
          {register && (
            <label className="grid gap-1">
              Name
              <input className="rounded border px-3 py-2" name="name" autoComplete="name" required />
            </label>
          )}
          <label className="grid gap-1">
            Email
            <input className="rounded border px-3 py-2" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="grid gap-1">
            Password
            <input
              className="rounded border px-3 py-2"
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={register ? 8 : undefined}
              required
            />
          </label>
          {register && (
            <label className="grid gap-1">
              Account type
              <select className="rounded border bg-background px-3 py-2" name="accountType" defaultValue="student">
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </select>
            </label>
          )}
          {error && <p role="alert">{error}</p>}
          <Button type="submit" size="lg" className="mt-1" disabled={pending}>
            {pending ? "Please wait…" : title}
          </Button>
        </form>
        <Link className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4" href={register ? "/sign-in" : "/sign-up"}>
          {register ? "Sign in" : "Create an account"}
        </Link>
      </div>
    </main>
  );
}
