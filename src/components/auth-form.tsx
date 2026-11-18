"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function AuthForm({ register }: { register: boolean }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const title = register ? "Create an account" : "Sign in";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
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

    if (register && !registration.name) {
      setError("Enter your name to create an account.");
      return;
    }
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
    <main id="main-content" tabIndex={-1} className="flex flex-1 justify-center bg-linear-to-br from-muted to-background px-4 py-9 sm:py-16">
      <div className="h-fit w-full min-w-0 max-w-md rounded-3xl border bg-card p-5 shadow-sm sm:p-9">
        <h1 className="mb-6 text-3xl font-bold tracking-[-0.05em]">{title}</h1>
        <form onSubmit={submit} aria-busy={pending}>
          <fieldset disabled={pending} className="grid min-w-0 gap-4 text-sm">
          {register && (
            <label className="grid gap-1.5 font-medium">
              Name
              <input className="form-control" name="name" autoComplete="name" required />
            </label>
          )}
          <label className="grid gap-1.5 font-medium">
            Email
            <input className="form-control" name="email" type="email" autoComplete="email" required />
          </label>
          <div className="grid gap-1.5">
            <label htmlFor="auth-password" className="font-medium">Password</label>
            <div className="relative">
              <input id="auth-password" className="form-control pr-12" name="password" type={showPassword ? "text" : "password"}
                autoComplete={register ? "new-password" : "current-password"}
                minLength={register ? 8 : undefined} aria-describedby={register ? "password-hint" : undefined} required />
              <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1"
                aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </Button>
            </div>
            {register && <p id="password-hint" className="text-xs text-muted-foreground">Use at least 8 characters.</p>}
          </div>
          {register && (
            <label className="grid gap-1.5 font-medium">
              Account type
              <select className="form-control" name="accountType" defaultValue="student">
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </select>
            </label>
          )}
          {error && <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="mt-1" disabled={pending}>
            {pending ? "Please wait…" : title}
          </Button>
          </fieldset>
        </form>
        <Link className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4" href={register ? "/sign-in" : "/sign-up"}>
          {register ? "Sign in" : "Create an account"}
        </Link>
      </div>
    </main>
  );
}
