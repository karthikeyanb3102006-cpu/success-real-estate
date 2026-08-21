import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { List, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { PropertyCard } from "@/components/PropertyCard";
import { formatPrice, listings } from "@/data/properties";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  deal: fallback(z.string(), "all").default("all"),
});

export const Route = createFileRoute("/properties/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Homes for Sale & Rent — Success Real Estate" },
      {
        name: "description",
        content:
          "Filter luxury houses, apartments, villas and land by price, bedrooms and location. Map or list view.",
      },
      { property: "og:title", content: "Homes for Sale & Rent — Success Real Estate" },
      {
        property: "og:description",
        content: "Filter luxury homes by price, bedrooms, type and location.",
      },
    ],
  }),
  component: PropertiesPage,
});

const types = ["all", "house", "apartment", "villa", "plot"] as const;

function PropertiesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [query, setQuery] = useState(search["q"]);
  const [type, setType] = useState<string>("all");
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const dealParam = search["deal"];
  const deal = ["buy", "rent"].includes(dealParam) ? dealParam : "all";

  const results = listings.filter((l) => {
    const q = query.trim().toLowerCase();
    if (q && !`${l.city} ${l.zip} ${l.title}`.toLowerCase().includes(q)) return false;
    if (deal !== "all" && l.deal !== deal) return false;
    if (type !== "all" && l.type !== type) return false;
    if (beds && l.beds < beds) return false;
    if (baths && l.baths < baths) return false;
    if (maxPrice && l.price > maxPrice) return false;
    return true;
  });

  const setDeal = (value: string) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, deal: value }) });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">The collection</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Find your next address</h1>

      <div className="mt-8 rounded-xl border border-gold/40 bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-border px-3">
            <Search className="h-5 w-5 text-gold" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City, neighborhood or ZIP"
              className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            {["all", "buy", "rent"].map((d) => (
              <button
                key={d}
                onClick={() => setDeal(d)}
                className={`h-12 flex-1 rounded-lg border px-5 text-sm capitalize transition-colors ${
                  deal === d ? "border-gold bg-accent text-gold" : "border-border text-muted-foreground hover:text-gold"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAdvanced((v) => !v)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gold/60 px-5 text-sm text-gold"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {advanced ? "Hide filters" : "More filters"}
          </button>
        </div>

        {advanced ? (
          <div className="mt-4 grid gap-4 border-t border-border/70 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-muted-foreground">
              Property type
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 capitalize text-foreground outline-none"
              >
                {types.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </label>
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
              Bathrooms (min)
              <select
                value={baths}
                onChange={(e) => setBaths(Number(e.target.value))}
                className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-foreground outline-none"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "Any" : `${n}+`}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted-foreground">
              Max price
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-foreground outline-none"
              >
                {[0, 15000, 900000, 3500000, 6000000].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "No limit" : `$${n.toLocaleString()}`}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "residence" : "residences"}
        </p>
        <div className="flex gap-2 rounded-lg border border-border p-1">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm capitalize transition-colors ${
                view === v ? "bg-accent text-gold" : "text-muted-foreground hover:text-gold"
              }`}
            >
              {v === "list" ? <List className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => (
            <PropertyCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <MapView results={results} />
      )}

      {results.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          No residences match those filters yet. Widen your search or contact our concierge desk.
        </p>
      ) : null}
    </div>
  );
}

function MapView({ results }: { results: typeof listings }) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-gold/40">
      <div className="relative h-[26rem] bg-surface">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {results.map((l, i) => (
          <div
            key={l.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${12 + ((i * 17) % 76)}%`, top: `${26 + ((i * 23) % 58)}%` }}
          >
            <span className="whitespace-nowrap rounded-full border border-gold bg-background/90 px-3 py-1.5 text-xs text-gold shadow-[var(--shadow-gold)]">
              {formatPrice(l)}
            </span>
          </div>
        ))}
      </div>
      <p className="border-t border-border/70 bg-card px-5 py-3 text-xs text-muted-foreground">
        Approximate map preview — connect a live map provider for street-level detail.
      </p>
    </div>
  );
}
