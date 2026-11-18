"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AccountAvatar } from "@/components/account-menu";
import { useProfileIdentity } from "@/components/profile-identity";
import { Button } from "@/components/ui/button";
import { authenticatedApiJson } from "@/lib/api-client";

const schema = z.object({
  name: z.string().trim().min(2, "Enter at least two characters.").max(80),
  phone: z.string().trim().max(24).refine((value) => value === "" || /^\+?\d{7,15}$/.test(value.replace(/[\s().-]/g, "")), "Enter a valid phone number."),
  location: z.string().trim().max(120),
  bio: z.string().trim().max(500),
});
type Editable = z.infer<typeof schema>;
type Profile = Editable & {
  id: string; email: string; emailVerified: boolean; image: string | null;
  role: string; plan: string; createdAt: string | null; updatedAt: string | null;
};
const endpoint = "/api/users/me";
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const fields: { name: keyof Editable; label: string; max: number; autoComplete?: string }[] = [
  { name: "name", label: "Full name", max: 80, autoComplete: "name" },
  { name: "phone", label: "Phone", max: 24, autoComplete: "tel" },
  { name: "location", label: "Location", max: 120, autoComplete: "address-level2" },
  { name: "bio", label: "Bio", max: 500 },
];
const fieldClass = "form-control";
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });

function ProfileForm({ initial }: { initial: Profile }) {
  const { update } = useProfileIdentity();
  const [profile, setProfile] = useState(initial);
  const [form, setForm] = useState<Editable>(initial);
  const [image, setImage] = useState(initial.image);
  const [selected, setSelected] = useState<{ file: File; preview: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Editable, string[]>>>({});
  const [saving, setSaving] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected) return () => URL.revokeObjectURL(selected.preview);
  }, [selected]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const input = schema.safeParse(form);
    if (!input.success) {
      setErrors(input.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      let imageUrl = image;
      if (selected) {
        const upload = await authenticatedApiJson<{ imageUrl: string }>(endpoint + "/avatar", {
          method: "POST", headers: { "Content-Type": selected.file.type }, body: selected.file,
        });
        imageUrl = upload.imageUrl;
        setImage(imageUrl);
        setSelected(null);
      }
      const saved = await authenticatedApiJson<Profile>(endpoint, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input.data, ...(imageUrl !== profile.image ? { image: imageUrl } : {}) }),
      });
      setProfile(saved);
      setForm(saved);
      setImage(saved.image);
      update({ id: saved.id, name: saved.name, image: saved.image });
      toast.success("Profile saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
      <form onSubmit={save} noValidate className="rounded-2xl border bg-card p-5 sm:p-6" aria-busy={saving}>
        <fieldset disabled={saving} className="grid min-w-0 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {selected
              ? <Image unoptimized src={selected.preview} alt="Selected avatar preview" width={64} height={64} className="size-16 rounded-full object-cover" />
              : <AccountAvatar name={form.name} image={image} large />}
            <div className="space-y-2">
              <input ref={picker} type="file" accept={imageTypes.join(",")} className="hidden" aria-label="Choose an avatar"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (!file) return;
                  if (!imageTypes.includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
                    toast.error("Select a JPEG, PNG, or WebP image up to 5 MB.");
                    return;
                  }
                  setSelected({ file, preview: URL.createObjectURL(file) });
                }} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => picker.current?.click()}>Choose avatar</Button>
                {(image || selected) && <Button type="button" variant="ghost" onClick={() => { setSelected(null); setImage(null); }}>Remove avatar</Button>}
              </div>
              <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP up to 5 MB.</p>
            </div>
          </div>
          {fields.map(({ name, label, max, autoComplete }) => {
            const issue = errors[name]?.[0];
            const attributes = {
              id: "profile-" + name, value: form[name], maxLength: max, className: fieldClass,
              "aria-invalid": Boolean(issue), "aria-describedby": issue ? "error-" + name : undefined,
            };
            return (
              <div key={name} className="grid gap-1.5">
                <label htmlFor={attributes.id} className="text-sm font-medium">{label}</label>
                {name === "bio" ? <textarea {...attributes} rows={4} onChange={(event) => setForm({ ...form, bio: event.target.value })} /> :
                  <input {...attributes} type={name === "phone" ? "tel" : "text"} autoComplete={autoComplete} required={name === "name"}
                    onChange={(event) => setForm({ ...form, [name]: event.target.value })} />}
                {issue && <p id={"error-" + name} role="alert" className="text-sm text-destructive">{issue}</p>}
              </div>
            );
          })}
          <Button type="submit" className="justify-self-start">{saving ? "Saving…" : "Save profile"}</Button>
        </fieldset>
      </form>
      <section className="space-y-4 self-start rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">Account details</h2>
        <dl className="grid gap-3 text-sm">
          <div><dt className="text-muted-foreground">Email</dt><dd className="wrap-anywhere">{profile.email}</dd></div>
          <div><dt className="text-muted-foreground">Email verification</dt><dd>{profile.emailVerified ? "Verified" : "Unverified"}</dd></div>
          <div><dt className="text-muted-foreground">Role</dt><dd className="capitalize">{profile.role}</dd></div>
          <div><dt className="text-muted-foreground">Plan</dt><dd className="capitalize">{profile.plan}</dd></div>
          {profile.createdAt && <div><dt className="text-muted-foreground">Member since</dt><dd>{date.format(new Date(profile.createdAt))}</dd></div>}
        </dl>
      </section>
    </div>
  );
}

export function ProfileEditor() {
  const [state, setState] = useState<Profile | { error: string } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    authenticatedApiJson<Profile>(endpoint, { signal: controller.signal }).then((profile) => {
      if (!controller.signal.aborted) setState(profile);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ error: error instanceof Error ? error.message : "Could not load your profile." });
    });
    return () => controller.abort();
  }, [attempt]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">My profile</h1>
      {!state && <p role="status" className="rounded-xl border bg-card p-5">Loading profile…</p>}
      {state && ("error" in state ? (
        <div role="alert" className="space-y-3 rounded-xl border bg-card p-5">
          <p>{state.error}</p>
          <Button type="button" variant="outline" onClick={() => { setState(null); setAttempt((value) => value + 1); }}>Retry</Button>
        </div>
      ) : <ProfileForm key={state.id} initial={state} />)}
    </section>
  );
}
