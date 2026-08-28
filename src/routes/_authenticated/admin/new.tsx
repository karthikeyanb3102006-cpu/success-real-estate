import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { PropertyForm, toDraft } from "@/components/admin/PropertyForm";
import { adminSavePropertyFn } from "@/lib/admin-properties.functions";

export const Route = createFileRoute("/_authenticated/admin/new")({
  head: () => ({
    meta: [
      { title: "New Property — Success Real Estate Admin" },
      { name: "description", content: "Add a new property listing with photos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewProperty,
});

function NewProperty() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <Link to="/admin" className="text-sm text-gold hover:underline">
        ← Back to listings
      </Link>
      <h1 className="mt-6 font-display text-4xl">New property</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Save the details first, then upload the photo gallery.
      </p>

      <div className="mt-8">
        <PropertyForm
          initial={toDraft({})}
          submitLabel="Save and add photos"
          onSubmit={async (values) => {
            try {
              const { id } = await adminSavePropertyFn({ data: values });
              await qc.invalidateQueries({ queryKey: ["admin", "properties"] });
              await qc.invalidateQueries({ queryKey: ["properties"] });
              toast.success("Property created.");
              await navigate({ to: "/admin/edit/$id", params: { id } });
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Could not save property.");
            }
          }}
        />
      </div>
    </div>
  );
}
