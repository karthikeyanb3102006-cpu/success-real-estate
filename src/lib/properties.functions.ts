import { createServerFn } from "@tanstack/react-start";

import type { Listing } from "@/data/properties";

export const listPropertiesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Listing[]> => {
    const { serverPublicSupabase, rowsToListings, PROPERTY_SELECT } = await import(
      "./properties.server"
    );
    const supabase = serverPublicSupabase();
    const { data, error } = await supabase
      .from("properties")
      .select(PROPERTY_SELECT)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return rowsToListings(supabase, data ?? []);
  },
);

export const getPropertyFn = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<Listing | null> => {
    const { serverPublicSupabase, rowsToListings, PROPERTY_SELECT } = await import(
      "./properties.server"
    );
    const supabase = serverPublicSupabase();
    const { data: rows, error } = await supabase
      .from("properties")
      .select(PROPERTY_SELECT)
      .eq("published", true)
      .eq("slug", data.slug)
      .limit(1);

    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return null;
    const listings = await rowsToListings(supabase, rows);
    return listings[0] ?? null;
  });
