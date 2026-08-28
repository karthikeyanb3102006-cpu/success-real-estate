import { useState } from "react";
import { Loader2 } from "lucide-react";

import { propertyInputSchema, type PropertyInput } from "@/lib/admin-properties.functions";

type Draft = Record<string, string | boolean>;

const empty: Draft = {
  slug: "",
  title: "",
  price: "0",
  deal: "buy",
  type: "house",
  city: "",
  zip: "",
  description: "",
  beds: "0",
  baths: "0",
  sqft: "0",
  year: "0",
  lat: "11.0168",
  lng: "76.9558",
  amenities: "",
  published: true,
};

export function toDraft(p: Partial<PropertyInput> & { amenities?: string[] }): Draft {
  return {
    ...empty,
    ...Object.fromEntries(
      Object.entries(p).map(([k, v]) => [
        k,
        Array.isArray(v) ? v.join(", ") : typeof v === "boolean" ? v : String(v ?? ""),
      ]),
    ),
  };
}

function Text({
  label,
  name,
  draft,
  set,
  error,
  type = "text",
  textarea = false,
}: {
  label: string;
  name: string;
  draft: Draft;
  set: (k: string, v: string | boolean) => void;
  error?: string | undefined;
  type?: string;
  textarea?: boolean;
}) {
  const value = String(draft[name] ?? "");
  const cls =
    "mt-2 w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-gold " +
    (error ? "border-destructive" : "border-border");
  return (
    <label className="block text-sm text-muted-foreground">
      {label}
      {textarea ? (
        <textarea rows={4} value={value} onChange={(e) => set(name, e.target.value)} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => set(name, e.target.value)} className={cls} />
      )}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function PropertyForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: Draft;
  submitLabel: string;
  onSubmit: (values: PropertyInput) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string | boolean) => setDraft((d) => ({ ...d, [k]: v }));

  const num = (k: string) => Number(String(draft[k] ?? "0").replace(/,/g, "")) || 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const candidate = {
      ...(draft["id"] ? { id: String(draft["id"]) } : {}),
      slug: String(draft["slug"] ?? "").trim(),
      title: String(draft["title"] ?? "").trim(),
      price: num("price"),
      deal: String(draft["deal"]),
      type: String(draft["type"]),
      city: String(draft["city"] ?? "").trim(),
      zip: String(draft["zip"] ?? "").trim(),
      description: String(draft["description"] ?? "").trim(),
      beds: num("beds"),
      baths: num("baths"),
      sqft: num("sqft"),
      year: num("year"),
      lat: num("lat"),
      lng: num("lng"),
      amenities: String(draft["amenities"] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      published: Boolean(draft["published"]),
    };

    const parsed = propertyInputSchema.safeParse(candidate);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSubmit(parsed.data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-xl border border-gold/40 bg-card p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Text label="Property name" name="title" draft={draft} set={set} error={errors["title"]} />
        <Text label="URL slug" name="slug" draft={draft} set={set} error={errors["slug"]} />
        <Text label="Price (₹)" name="price" draft={draft} set={set} error={errors["price"]} />
        <label className="block text-sm text-muted-foreground">
          Deal
          <select
            value={String(draft["deal"])}
            onChange={(e) => set("deal", e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          >
            <option value="buy">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </label>
        <label className="block text-sm text-muted-foreground">
          Property type
          <select
            value={String(draft["type"])}
            onChange={(e) => set("type", e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          >
            {["house", "apartment", "villa", "plot"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <Text label="Location / city" name="city" draft={draft} set={set} error={errors["city"]} />
        <Text label="PIN code" name="zip" draft={draft} set={set} error={errors["zip"]} />
        <Text label="Bedrooms" name="beds" draft={draft} set={set} error={errors["beds"]} />
        <Text label="Bathrooms" name="baths" draft={draft} set={set} error={errors["baths"]} />
        <Text label="Square feet" name="sqft" draft={draft} set={set} error={errors["sqft"]} />
        <Text label="Year built" name="year" draft={draft} set={set} error={errors["year"]} />
        <Text label="Latitude" name="lat" draft={draft} set={set} error={errors["lat"]} />
        <Text label="Longitude" name="lng" draft={draft} set={set} error={errors["lng"]} />
      </div>

      <Text
        label="Description"
        name="description"
        draft={draft}
        set={set}
        error={errors["description"]}
        textarea
      />
      <Text label="Amenities (comma separated)" name="amenities" draft={draft} set={set} />

      <label className="inline-flex items-center gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={Boolean(draft["published"])}
          onChange={(e) => set("published", e.target.checked)}
          className="h-4 w-4 accent-[var(--gold)]"
        />
        Published on the public website
      </label>

      <button
        disabled={saving}
        className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
