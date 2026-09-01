import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type { Listing } from "@/data/properties";

export const IMAGE_BUCKET = "property-images";
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

export function serverPublicSupabase(): SupabaseClient<Database> {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

type Row = Database["public"]["Tables"]["properties"]["Row"] & {
  property_images?: { path: string; sort_order: number; alt?: string | null }[] | null;
};

export const PROPERTY_SELECT = "*, property_images(path, sort_order, alt)";

/** Resolves storage paths (or absolute URLs) into browser-usable image URLs. */
export async function resolveImageUrls(
  supabase: SupabaseClient<Database>,
  paths: string[],
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const storagePaths = paths.filter((p) => !/^https?:\/\//i.test(p));
  for (const p of paths) if (!storagePaths.includes(p)) map[p] = p;

  if (storagePaths.length > 0) {
    const { data } = await supabase.storage
      .from(IMAGE_BUCKET)
      .createSignedUrls(storagePaths, SIGNED_URL_TTL);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
    }
  }
  return map;
}

export function rowToListing(row: Row, urls: Record<string, string>): Listing {
  const place = [row.locality, row.city].filter(Boolean).join(", ");
  const images = [...(row.property_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({
      url: urls[i.path] ?? "",
      alt: (i.alt ?? "").trim() || `${row.title} in ${place}`,
    }))
    .filter((i) => Boolean(i.url));

  return {
    id: row.slug,
    title: row.title,
    city: row.city,
    locality: row.locality ?? "",
    zip: row.zip,
    price: Number(row.price),
    deal: row.deal as Listing["deal"],
    type: row.type as Listing["type"],
    beds: row.beds,
    baths: row.baths,
    parking: row.parking ?? 0,
    sqft: row.sqft,
    year: row.year,
    status: row.status ?? "available",
    images,
    amenities: row.amenities ?? [],
    blurb: row.description,
    lat: row.lat,
    lng: row.lng,
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    noindex: row.noindex ?? false,
    isDemo: row.is_demo ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function rowsToListings(
  supabase: SupabaseClient<Database>,
  rows: Row[],
): Promise<Listing[]> {
  const paths = [...new Set(rows.flatMap((r) => (r.property_images ?? []).map((i) => i.path)))];
  const urls = await resolveImageUrls(supabase, paths);
  return rows.map((r) => rowToListing(r, urls));
}

