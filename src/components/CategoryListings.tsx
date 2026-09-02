import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { PropertyCard } from "@/components/PropertyCard";
import { CATEGORIES, filterByCategory, type CategoryDef } from "@/lib/categories";
import { propertiesQuery } from "@/lib/properties.queries";

const PRICE_STEPS = [0, 2500000, 5000000, 10000000, 25000000, 50000000, 100000000];

export function CategoryListings({ def }: { def: CategoryDef }) {
  const [beds, setBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState<"newest" | "asc" | "desc">("newest");

  const { data: listings } = useSuspenseQuery(propertiesQuery);
  const { results: scoped, cityOnly } = filterByCategory(listings, def);

  const results = scoped
    .filter((l) => (!beds || l.beds >= beds) && (!maxPrice || l.price <= maxPrice))
    .sort((a, b) =>
      sort === "asc" ? a.price - b.price : sort === "desc" ? b.price - a.price : 0,
    );

  const rent = def.deal === "rent";

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-gold">
              Home
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <li>
            <Link to="/properties" className="hover:text-gold">
              Properties
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <li aria-current="page" className="text-gold">
            {def.h1}
          </li>
        </ol>
      </nav>

      <p className="eyebrow mt-6">{def.eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{def.h1}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{def.intro}</p>
      {!cityOnly && scoped.length > 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No Coimbatore listing matches this category right now, so we are showing comparable
          properties from across our portfolio.
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-end gap-4 rounded-xl border border-gold/40 bg-card p-4">
        <label className="text-sm text-muted-foreground">
          Bedrooms (min)
          <select
            value={beds}
            onChange={(e) => setBeds(Number(e.target.value))}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-foreground outline-none"
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "Any" : `${n}+`}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-muted-foreground">
          {rent ? "Max monthly rent" : "Max price"}
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-foreground outline-none"
          >
            {(rent ? [0, 10000, 20000, 35000, 50000, 100000] : PRICE_STEPS).map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "No limit" : `₹${n.toLocaleString("en-IN")}`}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-muted-foreground">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-foreground outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="asc">Price: low to high</option>
            <option value="desc">Price: high to low</option>
          </select>
        </label>
        <p className="ml-auto text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "listing" : "listings"}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => (
            <PropertyCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-gold/35 bg-card p-8 text-muted-foreground">
          <p>
            We do not have a listing in this category at the moment. Tell us what you are looking
            for and we will match you as soon as one comes in.
          </p>
          <Link
            to="/contact"
            className="mt-5 inline-flex rounded-md border border-gold/60 px-5 py-2.5 text-sm text-gold hover:bg-accent"
          >
            Share your requirement
          </Link>
        </div>
      )}

      <section className="mt-16">
        <h2 className="font-display text-3xl">Questions buyers and tenants ask us</h2>
        <dl className="mt-6 space-y-5">
          {def.faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-gold/30 bg-card p-6">
              <dt className="font-display text-xl text-foreground">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14 border-t border-border/70 pt-8">
        <h2 className="eyebrow">Browse other categories</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {CATEGORIES.filter((c) => c.path !== def.path).map((c) => (
            <li key={c.path}>
              <Link
                to={c.path}
                className="inline-flex rounded-full border border-gold/40 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-gold hover:text-gold"
              >
                {c.h1}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
