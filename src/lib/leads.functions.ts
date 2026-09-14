import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];

export const leadInputSchema = z.object({
  source: z.enum(["contact_form", "property_inquiry", "tour_request", "whatsapp"]),
  name: z.string().trim().max(120).optional(),
  contact: z.string().trim().max(180).optional(),
  intent: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
  property_slug: z.string().trim().max(200).optional(),
  property_title: z.string().trim().max(200).optional(),
  page_path: z.string().trim().max(300).optional(),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export const submitLeadFn = createServerFn({ method: "POST" })
  .inputValidator((data: LeadInput) => leadInputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { serverPublicSupabase } = await import("./properties.server");
    const supabase = serverPublicSupabase();
    const { error } = await supabase.from("leads").insert({
      source: data.source,
      name: data.name ?? null,
      contact: data.contact ?? null,
      intent: data.intent ?? null,
      message: data.message ?? null,
      property_slug: data.property_slug ?? null,
      property_title: data.property_title ?? null,
      page_path: data.page_path ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListLeadsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Lead[]> => {
    const { assertAdmin } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateLeadStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "new" | "contacted" | "closed" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["new", "contacted", "closed"]) }).parse(data),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { assertAdmin } = await import("./admin-properties.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("leads")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
