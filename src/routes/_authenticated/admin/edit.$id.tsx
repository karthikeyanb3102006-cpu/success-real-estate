import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { PropertyForm, toDraft } from "@/components/admin/PropertyForm";
import { PropertyImageManager } from "@/components/admin/PropertyImageManager";
import { adminGetPropertyFn, adminSavePropertyFn } from "@/lib/admin-properties.functions";

export const Route = createFileRoute("/_authenticated/admin/edit/$id")({
  head: () => ({
    meta: [
      { title: "Edit Property — Success Real Estate Admin" },
      { name: "description", content: "Edit property details and manage its photo gallery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditProperty,
});

function EditProperty() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "property", id],
    queryFn: () => adminGetPropertyFn({ data: { id } }),
  });

  if (isLoading) {
    return <p className="mx-auto max-w-4xl px-5 py-24 text-muted-foreground">Loading property…</p>;
  }
  if (error || !data) {
    return (
      <p className="mx-auto max-w-4xl px-5 py-24 text-muted-foreground">
        {error instanceof Error ? error.message : "Property not found."}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-14">
      <div>
        <Link to="/admin" className="text-sm text-gold hover:underline">
          ← Back to listings
        </Link>
        <h1 className="mt-6 font-display text-4xl">{data.title}</h1>
      </div>

      <PropertyImageManager
        propertyId={data.id}
        images={data.images}
        onChanged={async () => {
          await refetch();
          await qc.invalidateQueries({ queryKey: ["admin", "properties"] });
          await qc.invalidateQueries({ queryKey: ["properties"] });
          await qc.invalidateQueries({ queryKey: ["property", data.slug] });
        }}
      />

      <PropertyForm
        initial={toDraft({
          id: data.id,
          slug: data.slug,
          title: data.title,
          price: Number(data.price),
          deal: data.deal as "buy" | "rent",
          type: data.type as "house" | "apartment" | "villa" | "plot",
          city: data.city,
          zip: data.zip,
          description: data.description,
          beds: data.beds,
          baths: data.baths,
          sqft: data.sqft,
          year: data.year,
          lat: data.lat,
          lng: data.lng,
          amenities: data.amenities ?? [],
          published: data.published,
        })}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          try {
            await adminSavePropertyFn({ data: values });
            await refetch();
            await qc.invalidateQueries({ queryKey: ["admin", "properties"] });
            await qc.invalidateQueries({ queryKey: ["properties"] });
            toast.success("Property updated.");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not save property.");
          }
        }}
      />
    </div>
  );
}
