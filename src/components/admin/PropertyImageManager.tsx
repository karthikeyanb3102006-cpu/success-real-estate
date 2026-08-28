import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  adminAddImagesFn,
  adminDeleteImageFn,
  adminReplaceImageFn,
} from "@/lib/admin-properties.functions";
import type { AdminImage } from "@/lib/admin-properties.server";

const BUCKET = "property-images";
const MAX_MB = 10;

function objectPath(propertyId: string, file: File) {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `properties/${propertyId}/${crypto.randomUUID()}.${ext || "jpg"}`;
}

function validate(files: File[]) {
  for (const f of files) {
    if (!f.type.startsWith("image/")) return `${f.name} is not an image.`;
    if (f.size > MAX_MB * 1024 * 1024) return `${f.name} is larger than ${MAX_MB}MB.`;
  }
  return null;
}

export function PropertyImageManager({
  propertyId,
  images,
  onChanged,
}: {
  propertyId: string;
  images: AdminImage[];
  onChanged: () => void | Promise<unknown>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replacingId = useRef<string | null>(null);

  async function upload(file: File) {
    const path = objectPath(propertyId, file);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw new Error(error.message);
    return path;
  }

  async function handleAdd(files: File[]) {
    const problem = validate(files);
    if (problem) return toast.error(problem);
    setBusy("add");
    try {
      const paths: string[] = [];
      for (const file of files) paths.push(await upload(file));
      await adminAddImagesFn({ data: { propertyId, paths } });
      await onChanged();
      toast.success(`${paths.length} image${paths.length > 1 ? "s" : ""} uploaded.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleReplace(file: File) {
    const imageId = replacingId.current;
    if (!imageId) return;
    const problem = validate([file]);
    if (problem) return toast.error(problem);
    setBusy(imageId);
    try {
      const path = await upload(file);
      await adminReplaceImageFn({ data: { imageId, path } });
      await onChanged();
      toast.success("Image replaced.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Replace failed.");
    } finally {
      replacingId.current = null;
      setBusy(null);
    }
  }

  async function handleDelete(imageId: string) {
    setBusy(imageId);
    try {
      await adminDeleteImageFn({ data: { imageId } });
      await onChanged();
      toast.success("Image deleted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-xl border border-gold/40 bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Gallery</h2>
          <p className="text-sm text-muted-foreground">
            Upload multiple photos, replace or remove any of them. First image is the cover.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addRef.current?.click()}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-lg border border-gold/60 px-4 py-2 text-sm text-gold transition-colors hover:bg-accent disabled:opacity-50"
        >
          {busy === "add" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          Upload images
        </button>
      </div>

      <input
        ref={addRef}
        type="file"
        accept="image/*"
        multiple
        aria-label="Upload property images"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void handleAdd(files);
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        aria-label="Replace property image"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleReplace(file);
        }}
      />

      {images.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No images yet.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="relative">
                <img
                  src={img.url}
                  alt={`Property photo ${i + 1}`}
                  loading="lazy"
                  className="aspect-[3/2] w-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-primary-foreground">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => {
                    replacingId.current = img.id;
                    replaceRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 text-xs text-gold hover:underline disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Replace
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void handleDelete(img.id)}
                  className="inline-flex items-center gap-2 text-xs text-destructive hover:underline disabled:opacity-50"
                >
                  {busy === img.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
