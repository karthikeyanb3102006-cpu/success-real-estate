import { createFileRoute } from "@tanstack/react-router";

import { CategoryListings } from "@/components/CategoryListings";
import { CATEGORIES, categoryHead } from "@/lib/categories";
import { propertiesQuery } from "@/lib/properties.queries";

const def = CATEGORIES.find((c) => c.path === "/flats-for-sale-coimbatore")!;

export const Route = createFileRoute("/flats-for-sale-coimbatore")({
  head: () => categoryHead(def),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQuery),
  errorComponent: () => (
    <p className="mx-auto max-w-6xl px-5 py-24 text-center text-muted-foreground">
      We couldn't load these listings right now. Please refresh in a moment.
    </p>
  ),
  component: FlatsForSaleCoimbatorePage,
});

function FlatsForSaleCoimbatorePage() {
  return <CategoryListings def={def} />;
}
