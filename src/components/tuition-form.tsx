"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { tuitionFields, tuitionJson, tuitionRequest, type Tuition } from "@/lib/tuitions";

const inputClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm";
const acceptedImages = ["image/jpeg", "image/png", "image/webp"];
const fields = [
  { name: "title", label: "Title", min: 3, max: 100 },
  { name: "subject", label: "Subject", min: 2, max: 80 },
  { name: "location", label: "Location", min: 2, max: 120 },
] as const;

export function TuitionForm({ tuition, onSave, onCancel }: {
  tuition?: Tuition;
  onSave?: (tuition: Tuition) => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(tuition?.imageUrl ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (preview) return () => URL.revokeObjectURL(preview);
  }, [preview]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const input = tuitionFields.safeParse({
      title: form.get("title"),
      subject: form.get("subject"),
      location: form.get("location"),
      classLevel: String(form.get("classLevel") ?? "").trim() || null,
      format: form.get("format"),
      daysPerWeek: Number(form.get("daysPerWeek")),
      monthlyFee: Number(form.get("monthlyFee")),
      description: form.get("description"),
    });
    if (!input.success) {
      toast.error("Check the tuition details and remove any extra spaces.");
      return;
    }

    setBusy(true);
    try {
      let savedImage = imageUrl;
      if (file) {
        const upload = await tuitionRequest<{ imageUrl: string }>("/image", {
          method: "POST", headers: { "Content-Type": file.type }, body: file,
        });
        savedImage = upload.imageUrl;
        setImageUrl(savedImage);
        setFile(null);
        setPreview(null);
      }
      const saved = await tuitionRequest<Tuition>(
        tuition ? "/" + tuition._id : "",
        tuitionJson(tuition ? "PATCH" : "POST", { ...input.data, imageUrl: savedImage }),
      );
      toast.success(tuition ? "Tuition updated." : "Tuition posted and pending approval.");
      if (onSave) onSave(saved);
      else router.push("/dashboard/tutor/my-tuitions");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the tuition.");
    } finally {
      setBusy(false);
    }
  }

  const visibleImage = file ? preview : imageUrl;

  return (
    <section className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{tuition ? "Edit tuition" : "Post tuition"}</h1>
        {!tuition && <Link href="/dashboard/tutor/my-tuitions" className="text-sm font-semibold text-primary underline">My tuitions</Link>}
      </div>
      <form onSubmit={submit} className="rounded-2xl border bg-card p-5 sm:p-7" aria-busy={busy}>
        <fieldset disabled={busy} className="grid min-w-0 gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-1.5 [&_label]:text-sm [&_label]:font-medium">
          {fields.map(({ name, label, min, max }) => (
            <label key={name}>{label}
              <input name={name} required minLength={min} maxLength={max} defaultValue={tuition?.[name]} className={inputClass} />
            </label>
          ))}
          <label>Class level (optional)
            <input name="classLevel" maxLength={80} defaultValue={tuition?.classLevel ?? ""} className={inputClass} />
          </label>
          <label>Format
            <select name="format" defaultValue={tuition?.format ?? "Home tuition"} className={inputClass}>
              <option>Home tuition</option>
              <option>Online</option>
            </select>
          </label>
          <label>Days per week
            <input name="daysPerWeek" required type="number" min={1} max={7} defaultValue={tuition?.daysPerWeek} className={inputClass} />
          </label>
          <label>Monthly fee (৳)
            <input name="monthlyFee" required type="number" min={1} max={1000000} defaultValue={tuition?.monthlyFee} className={inputClass} />
          </label>
          <label className="sm:col-span-2">Description
            <textarea name="description" required rows={5} minLength={10} maxLength={2000} defaultValue={tuition?.description} className={inputClass} />
          </label>
          <div className="space-y-2 sm:col-span-2">
            <label>Image (optional)
              <input type="file" accept={acceptedImages.join(",")} aria-describedby="tuition-image-hint" className={inputClass}
                onChange={(event) => {
                  const selected = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (!selected) return;
                  if (!acceptedImages.includes(selected.type) || selected.size > 5 * 1024 * 1024 || selected.size === 0) {
                    toast.error("Select a JPEG, PNG, or WebP image up to 5 MB.");
                    return;
                  }
                  setPreview(URL.createObjectURL(selected));
                  setFile(selected);
                }}
              />
            </label>
            <p id="tuition-image-hint" className="text-xs text-muted-foreground">JPEG, PNG, or WebP up to 5 MB.</p>
            {visibleImage && (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- Preview may be a local blob URL. */}
                <img src={visibleImage} alt="Tuition image preview" className="h-40 max-w-full rounded-lg border object-contain" />
                <Button type="button" size="sm" variant="outline" onClick={() => { setFile(null); setPreview(null); setImageUrl(null); }}>Remove image</Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit">{busy ? "Saving…" : tuition ? "Save changes" : "Post tuition"}</Button>
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          </div>
        </fieldset>
      </form>
    </section>
  );
}
