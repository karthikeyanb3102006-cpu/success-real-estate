import { createFileRoute } from "@tanstack/react-router";

import { CategoryListings } from "@/components/CategoryListings";
import { CATEGORIES, categoryHead } from "@/lib/categories";
import { propertiesQuery } from "@/lib/properties.queries";

const def = CATEGORIES.find((c) => c.path === "/villas-for-sale-coimbatore")!;

export const Route = createFileRoute("/villas-for-sale-coimbatore")({
  head: () => categoryHead(def),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQuery),
  errorComponent: () => (
    <p className="mx-auto max-w-6xl px-5 py-24 text-center text-muted-foreground">
      We couldn't load these listings right now. Please refresh in a moment.
    </p>
  ),
  component: VillasForSaleCoimbatorePage,
});

function VillasForSaleCoimbatorePage() {
  return <CategoryListings def={def} />;
}
