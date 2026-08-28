import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatPrice } from "@/data/properties";
import { adminDeletePropertyFn, adminListPropertiesFn } from "@/lib/admin-properties.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Manage Listings — Success Real Estate Admin" },
      { name: "description", content: "Create, edit and remove property listings and photos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminList,
});

function AdminList() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "properties"],
    queryFn: () => adminListPropertiesFn(),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminDeletePropertyFn({ data: { id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "properties"] });
      await qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property deleted.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed."),
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 font-display text-4xl">Manage listings</h1>
        </div>
        <Link
          to="/admin/new"
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New property
        </Link>
      </div>

      {isLoading && <p className="mt-10 text-muted-foreground">Loading listings…</p>}
      {error && (
        <p className="mt-10 rounded-lg border border-destructive/50 p-6 text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load listings."}
        </p>
      )}

      <ul className="mt-10 space-y-4">
        {(data ?? []).map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            {p.images[0] ? (
              <img
                src={p.images[0].url}
                alt=""
                className="h-20 w-28 rounded-lg object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-40 flex-1">
              <p className="font-display text-xl">{p.title}</p>
              <p className="text-sm text-muted-foreground">
                {p.city} · {formatPrice({ price: Number(p.price), deal: p.deal as "buy" | "rent" })} ·{" "}
                {p.images.length} photo{p.images.length === 1 ? "" : "s"} ·{" "}
                {p.published ? "Published" : "Draft"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/edit/$id"
                params={{ id: p.id }}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/60 px-4 py-2 text-sm text-gold hover:bg-accent"
              >
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Delete "${p.title}" and all its photos?`)) del.mutate(p.id);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/60 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!isLoading && !error && (data ?? []).length === 0 && (
        <p className="mt-10 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No properties yet. Create your first listing.
        </p>
      )}
    </div>
  );
}
