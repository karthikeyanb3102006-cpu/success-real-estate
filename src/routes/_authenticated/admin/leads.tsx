import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { adminListLeadsFn, adminUpdateLeadStatusFn } from "@/lib/leads.functions";

const SOURCE_LABEL: Record<string, string> = {
  contact_form: "Contact form",
  property_inquiry: "Property inquiry",
  tour_request: "Tour request",
  whatsapp: "WhatsApp",
};

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({
    meta: [
      { title: "Enquiry Inbox — Success Real Estate Admin" },
      { name: "description", content: "Every enquiry captured from the website in one inbox." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadsInbox,
});

function LeadsInbox() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: () => adminListLeadsFn(),
  });

  const setStatus = useMutation({
    mutationFn: (vars: { id: string; status: "new" | "contacted" | "closed" }) =>
      adminUpdateLeadStatusFn({ data: vars }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "leads"] });
      toast.success("Enquiry updated.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed."),
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 font-display text-4xl">Enquiry inbox</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Leads from the contact form, property inquiries, tour requests and WhatsApp taps.
      </p>

      {isLoading && <p className="mt-10 text-muted-foreground">Loading enquiries…</p>}
      {error && (
        <p className="mt-10 rounded-lg border border-destructive/50 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load enquiries."}
        </p>
      )}
      {data && data.length === 0 && (
        <p className="mt-10 rounded-lg border border-border p-6 text-sm text-muted-foreground">
          No enquiries yet.
        </p>
      )}

      <ul className="mt-10 space-y-4">
        {(data ?? []).map((lead) => (
          <li key={lead.id} className="rounded-xl border border-gold/35 bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl">{lead.name || "Website visitor"}</p>
                <p className="text-sm text-muted-foreground">
                  {SOURCE_LABEL[lead.source] ?? lead.source}
                  {lead.contact ? ` · ${lead.contact}` : ""} ·{" "}
                  {new Date(lead.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <select
                aria-label="Enquiry status"
                value={lead.status}
                onChange={(e) =>
                  setStatus.mutate({
                    id: lead.id,
                    status: e.target.value as "new" | "contacted" | "closed",
                  })
                }
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            {lead.property_title && (
              <p className="mt-3 text-sm text-gold">Property: {lead.property_title}</p>
            )}
            {lead.intent && <p className="mt-1 text-sm text-muted-foreground">{lead.intent}</p>}
            {lead.message && <p className="mt-3 text-sm leading-relaxed">{lead.message}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
