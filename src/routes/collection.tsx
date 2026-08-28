import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { PropertyCard } from "@/components/PropertyCard";
import { formatPrice } from "@/data/properties";
import { useFavorites } from "@/lib/favorites";
import { propertiesQuery } from "@/lib/properties.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "My Collection — Saved Homes | Success Real Estate" },
      {
        name: "description",
        content: "Organize your saved homes and compare up to three properties side by side.",
      },
      { property: "og:title", content: "My Collection — Saved Homes" },
      { property: "og:description", content: "Compare up to three saved properties side by side." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(propertiesQuery),
  component: CollectionPage,
});

function CollectionPage() {
  const { ids, remove } = useFavorites();
  const { data: listings } = useSuspenseQuery(propertiesQuery);
  const saved = listings.filter((l) => ids.includes(l.id));
  const compare = saved.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">Saved</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">My Collection</h1>
      <p className="mt-3 text-muted-foreground">
        Everything you've favorited, kept on this device. Compare the first three side by side.
      </p>

      {saved.length === 0 ? (
        <div className="mt-16 rounded-xl border border-gold/40 bg-card p-12 text-center">
          <p className="font-display text-2xl">No saved homes yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the gold heart on any listing to add it here.
          </p>
          <Link
            to="/properties"
            className="mt-6 inline-flex h-12 items-center rounded-lg bg-primary px-8 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((l) => (
              <PropertyCard key={l.id} listing={l} />
            ))}
          </div>

          {compare.length > 1 ? (
            <section className="mt-16">
              <h2 className="font-display text-3xl">Side-by-side comparison</h2>
              <div className="mt-6 overflow-x-auto rounded-xl border border-gold/40">
                <table className="w-full min-w-[38rem] text-sm">
                  <thead>
                    <tr className="bg-surface/60 text-left">
                      <th className="p-4 font-normal text-muted-foreground">Detail</th>
                      {compare.map((l) => (
                        <th key={l.id} className="p-4 font-display text-lg text-gold">
                          <div className="flex items-center justify-between gap-3">
                            {l.title}
                            <button onClick={() => remove(l.id)} aria-label={`Remove ${l.title}`}>
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Price", (l: (typeof compare)[number]) => formatPrice(l)],
                        ["Location", (l: (typeof compare)[number]) => l.city],
                        ["Type", (l: (typeof compare)[number]) => l.type],
                        ["Bedrooms", (l: (typeof compare)[number]) => l.beds || "—"],
                        ["Bathrooms", (l: (typeof compare)[number]) => l.baths || "—"],
                        ["Size", (l: (typeof compare)[number]) => `${l.sqft.toLocaleString()} sq ft`],
                        ["Year built", (l: (typeof compare)[number]) => l.year || "Land"],
                        ["Amenities", (l: (typeof compare)[number]) => l.amenities.join(", ")],
                      ] as const
                    ).map(([label, get]) => (
                      <tr key={label} className="border-t border-border/70">
                        <td className="p-4 text-muted-foreground">{label}</td>
                        {compare.map((l) => (
                          <td key={l.id} className="p-4 capitalize">
                            {get(l)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
