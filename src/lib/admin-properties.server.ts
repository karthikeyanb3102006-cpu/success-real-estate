import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { IMAGE_BUCKET, resolveImageUrls } from "./properties.server";

export type Admin = SupabaseClient<Database>;

export type AdminImage = { id: string; path: string; url: string; sort_order: number };

export type AdminProperty = Database["public"]["Tables"]["properties"]["Row"] & {
  images: AdminImage[];
};

export async function assertAdmin(supabase: Admin, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required.");
}

type ImageRow = { id: string; path: string; sort_order: number };

export async function withImages(
  supabase: Admin,
  rows: (Database["public"]["Tables"]["properties"]["Row"] & {
    property_images?: ImageRow[] | null;
  })[],
): Promise<AdminProperty[]> {
  const paths = [...new Set(rows.flatMap((r) => (r.property_images ?? []).map((i) => i.path)))];
  const urls = await resolveImageUrls(supabase, paths);
  return rows.map(({ property_images, ...row }) => ({
    ...row,
    images: [...(property_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ id: i.id, path: i.path, sort_order: i.sort_order, url: urls[i.path] ?? "" })),
  }));
}

export async function removeObjects(supabase: Admin, paths: string[]) {
  const storagePaths = paths.filter((p) => p && !/^https?:\/\//i.test(p));
  if (storagePaths.length === 0) return;
  await supabase.storage.from(IMAGE_BUCKET).remove(storagePaths);
}

export const ADMIN_SELECT = "*, property_images(id, path, sort_order)";
