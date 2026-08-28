import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AdminProperty } from "./admin-properties.server";

export const propertyInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  title: z.string().min(2, "Property name is required"),
  price: z.number().nonnegative("Price must be 0 or more"),
  deal: z.enum(["buy", "rent"]),
  type: z.enum(["house", "apartment", "villa", "plot"]),
  city: z.string().min(1, "Location is required"),
  zip: z.string().default(""),
  description: z.string().min(10, "Add a short description (10+ characters)"),
  beds: z.number().int().min(0),
  baths: z.number().int().min(0),
  sqft: z.number().int().min(0),
  year: z.number().int().min(0),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  amenities: z.array(z.string()),
  published: z.boolean(),
});

export type PropertyInput = z.infer<typeof propertyInputSchema>;

export const adminListPropertiesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminProperty[]> => {
    const { assertAdmin, withImages, ADMIN_SELECT } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("properties")
      .select(ADMIN_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return withImages(context.supabase, data ?? []);
  });

export const adminGetPropertyFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }): Promise<AdminProperty | null> => {
    const { assertAdmin, withImages, ADMIN_SELECT } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("properties")
      .select(ADMIN_SELECT)
      .eq("id", data.id)
      .limit(1);
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return null;
    return (await withImages(context.supabase, rows))[0] ?? null;
  });

export const adminSavePropertyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => propertyInputSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { assertAdmin } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...values } = data;

    if (id) {
      const { error } = await context.supabase.from("properties").update(values).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }

    const { data: inserted, error } = await context.supabase
      .from("properties")
      .insert(values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const adminDeletePropertyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { assertAdmin, removeObjects } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: imgs } = await context.supabase
      .from("property_images")
      .select("path")
      .eq("property_id", data.id);
    await removeObjects(context.supabase, (imgs ?? []).map((i) => i.path));

    await context.supabase.from("property_images").delete().eq("property_id", data.id);
    const { error } = await context.supabase.from("properties").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAddImagesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { propertyId: string; paths: string[] }) => data)
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: existing } = await context.supabase
      .from("property_images")
      .select("sort_order")
      .eq("property_id", data.propertyId)
      .order("sort_order", { ascending: false })
      .limit(1);
    let next = (existing?.[0]?.sort_order ?? -1) + 1;

    const rows = data.paths.map((path) => ({
      property_id: data.propertyId,
      path,
      sort_order: next++,
    }));
    if (rows.length === 0) return { ok: true };
    const { error } = await context.supabase.from("property_images").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminReplaceImageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string; path: string }) => data)
  .handler(async ({ data, context }) => {
    const { assertAdmin, removeObjects } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: current } = await context.supabase
      .from("property_images")
      .select("path")
      .eq("id", data.imageId)
      .single();

    const { error } = await context.supabase
      .from("property_images")
      .update({ path: data.path })
      .eq("id", data.imageId);
    if (error) throw new Error(error.message);

    if (current?.path && current.path !== data.path) {
      await removeObjects(context.supabase, [current.path]);
    }
    return { ok: true };
  });

export const adminDeleteImageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string }) => data)
  .handler(async ({ data, context }) => {
    const { assertAdmin, removeObjects } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);

    const { data: current } = await context.supabase
      .from("property_images")
      .select("path")
      .eq("id", data.imageId)
      .single();

    const { error } = await context.supabase
      .from("property_images")
      .delete()
      .eq("id", data.imageId);
    if (error) throw new Error(error.message);

    if (current?.path) await removeObjects(context.supabase, [current.path]);
    return { ok: true };
  });

export const adminReorderImagesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ids: string[] }) => data)
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);
    for (let i = 0; i < data.ids.length; i++) {
      const { error } = await context.supabase
        .from("property_images")
        .update({ sort_order: i })
        .eq("id", data.ids[i]!);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminIsAdminFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return Boolean(data);
  });
