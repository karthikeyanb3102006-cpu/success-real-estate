import { defineTool } from "@lovable.dev/mcp-js";

import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_profile",
  title: "Get my profile",
  description:
    "Return the signed-in Success Real Estate account's profile (name, phone, email) so the assistant can personalise property recommendations.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, created_at")
      .eq("id", ctx.getUserId()!)
      .maybeSingle();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const profile = {
      email: ctx.getUserEmail() ?? null,
      full_name: data?.full_name ?? null,
      phone: data?.phone ?? null,
      member_since: data?.created_at ?? null,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(profile, null, 2) }],
      structuredContent: { profile },
    };
  },
});
