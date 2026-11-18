"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";
import { tuitionJson } from "@/lib/tuitions";

const fields = [
  { name: "phone", label: "Phone number", max: 24 },
  { name: "preferredSchedule", label: "Preferred schedule", max: 200 },
  { name: "studentNote", label: "Note to the tutor (optional)", max: 1000 },
] as const;
const input = z.object({
  phone: z.string().trim().max(24).refine((value) => /^\+?\d{7,15}$/.test(value.replace(/[\s().-]/g, "")), "Enter a valid phone number."),
  preferredSchedule: z.string().trim().min(3, "Enter your preferred schedule.").max(200),
  studentNote: z.string().trim().max(1000),
});

export function ApplyTuition({ tuitionId, title }: { tuitionId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof z.infer<typeof input>, string[]>>>({});
  const [serverError, setServerError] = useState("");
  const formId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    const result = input.safeParse(Object.fromEntries(form));
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    setServerError("");
    setSaving(true);
    try {
      await authenticatedApiJson("/api/tuitions/" + tuitionId + "/applications", tuitionJson("POST", result.data));
      setSent(true);
      setOpen(false);
      toast.success("Application submitted.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit your application.";
      setServerError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog.Root open={open} onOpenChange={(next) => {
        if (saving) return;
        if (next) {
          setErrors({});
          setServerError("");
        }
        setOpen(next);
      }}>
        <Dialog.Trigger render={<Button type="button" />} disabled={sent}>{sent ? "Application submitted" : "Apply now"}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg -translate-1/2 overflow-y-auto rounded-xl border bg-card p-5 text-card-foreground shadow-lg">
            <Dialog.Title className="text-lg font-bold">Apply for tuition</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm wrap-anywhere text-muted-foreground">{title}. Your phone number and schedule will be shared with the tutor.</Dialog.Description>
            <form className="mt-4" noValidate onSubmit={submit} aria-busy={saving}>
              <fieldset className="grid gap-3" disabled={saving}>
                {fields.map(({ name, label, max }) => {
                  const id = formId + "-" + name;
                  const issue = errors[name]?.[0];
                  const attributes = {
                    id, name, maxLength: max, required: name !== "studentNote",
                    "aria-invalid": Boolean(issue),
                    "aria-describedby": issue ? id + "-error" : undefined,
                    className: "form-control",
                  };
                  return (
                    <div key={name} className="grid gap-1.5">
                      <label htmlFor={id} className="text-sm font-medium">{label}</label>
                      {name === "phone" ? <input {...attributes} type="tel" autoComplete="tel" /> :
                        <textarea {...attributes} rows={name === "studentNote" ? 3 : 2} />}
                      {issue && <p id={id + "-error"} role="alert" className="text-sm text-destructive">{issue}</p>}
                    </div>
                  );
                })}
                {serverError && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
                <div className="flex flex-wrap justify-end gap-2">
                  <Dialog.Close render={<Button type="button" variant="outline" />}>Cancel</Dialog.Close>
                  <Button type="submit">{saving ? "Submitting…" : "Submit application"}</Button>
                </div>
              </fieldset>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Link href="/dashboard/student/my-applications" className="text-sm font-semibold text-primary underline">My applications</Link>
    </div>
  );
}
