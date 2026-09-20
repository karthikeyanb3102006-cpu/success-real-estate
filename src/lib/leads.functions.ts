import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadNote = Database["public"]["Tables"]["lead_notes"]["Row"] & {
  author_name: string | null;
};
export type Agent = { id: string; name: string };

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
    const { data: inserted, error } = await supabase
      .from("leads")
      .insert({
        source: data.source,
        name: data.name ?? null,
        contact: data.contact ?? null,
        intent: data.intent ?? null,
        message: data.message ?? null,
        property_slug: data.property_slug ?? null,
        property_title: data.property_title ?? null,
        page_path: data.page_path ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const { notifyNewLead } = await import("./lead-email.server");
    await notifyNewLead({ ...data, id: inserted?.id ?? null });

    return { ok: true };
  });

async function admin(context: { supabase: any; userId: string }) {
  const { assertAdmin } = await import("./admin-properties.server");
  await assertAdmin(context.supabase, context.userId);
  return context.supabase;
}

export const adminListLeadsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Lead[]> => {
    const supabase = await admin(context);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListAgentsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Agent[]> => {
    const supabase = await admin(context);
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (rolesError) throw new Error(rolesError.message);
    const ids = [...new Set((roles ?? []).map((r: { user_id: string }) => r.user_id))];
    if (ids.length === 0) return [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    const names = new Map<string, string | null>(
      (profiles ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name]),
    );
    return ids.map((id) => ({
      id,
      name: names.get(id) || `Agent ${id.slice(0, 6)}`,
    }));
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "closed"]).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  follow_up_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});

export const adminUpdateLeadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: z.input<typeof updateSchema>) => updateSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const supabase = await admin(context);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.status !== undefined) patch.status = data.status;
    if (data.assigned_to !== undefined) patch.assigned_to = data.assigned_to;
    if (data.follow_up_on !== undefined) patch.follow_up_on = data.follow_up_on;
    const { error } = await supabase.from("leads").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Kept for backwards compatibility with existing callers.
export const adminUpdateLeadStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "new" | "contacted" | "closed" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["new", "contacted", "closed"]) }).parse(data),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const supabase = await admin(context);
    const { error } = await supabase
      .from("leads")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListNotesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { leadId: string }) => z.object({ leadId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<LeadNote[]> => {
    const supabase = await admin(context);
    const { data: notes, error } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", data.leadId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const authorIds = [
      ...new Set((notes ?? []).map((n: { author_id: string | null }) => n.author_id).filter(Boolean)),
    ] as string[];
    const names = new Map<string, string | null>();
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", authorIds);
      for (const p of profiles ?? []) names.set(p.id, p.full_name);
    }
    return (notes ?? []).map((n: Database["public"]["Tables"]["lead_notes"]["Row"]) => ({
      ...n,
      author_name: n.author_id ? (names.get(n.author_id) ?? null) : null,
    }));
  });

export const adminAddNoteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { leadId: string; body: string }) =>
    z.object({ leadId: z.string().uuid(), body: z.string().trim().min(1).max(2000) }).parse(data),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const supabase = await admin(context);
    const { error } = await supabase.from("lead_notes").insert({
      lead_id: data.leadId,
      author_id: context.userId,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const draftSchema = z.object({
  enquiry: z.string().trim().min(1).max(4000),
  propertyDetails: z.string().trim().max(4000).optional(),
  buyerName: z.string().trim().max(120).optional(),
  tone: z.enum(["warm", "formal", "concise"]).default("warm"),
});

export const draftLeadReplyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: z.input<typeof draftSchema>) => draftSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ reply: string }> => {
    await admin(context);
    const { draftReply } = await import("./ai-reply.server");
    return { reply: await draftReply(data) };
  });
