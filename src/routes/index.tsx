import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Key, Search, ShieldCheck, Star, Tag } from "lucide-react";

import hero from "@/assets/hero-estate.jpg";
import crest from "@/assets/logo-crest.png";
import { PropertyCard } from "@/components/PropertyCard";
import { listings, testimonials } from "@/data/properties";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Success Real Estate — Luxury Homes to Buy & Rent" },
      {
        name: "description",
        content:
          "Search, save and tour premium homes for sale or rent with Success Real Estate. Your Dream • Our Priority.",
      },
      { property: "og:title", content: "Success Real Estate — Luxury Homes to Buy & Rent" },
      {
        property: "og:description",
        content:
          "A five-star property concierge: curated listings, private tours and advisors who answer.",
      },
    ],
  }),
  component: Index,
});

const intents = [
  { key: "buy", label: "Buy", icon: Key, copy: "Find the home you'll keep." },
  { key: "rent", label: "Rent", icon: Building2, copy: "Move in without compromise." },
  { key: "sell", label: "Sell", icon: Tag, copy: "List with a marketing team." },
] as const;

function Index() {
  const [intent, setIntent] = useState<(typeof intents)[number]["key"]>("buy");
  const [query, setQuery] = useState("");
  const featured = listings.slice(0, 3);

  return (
    <div>
      <section className="relative min-h-[86vh] overflow-hidden">
        <img
          src={hero}
          alt="Luxury cliffside villa at dusk"
          width={1600}
          height={1008}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 veil" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-4xl flex-col items-center justify-center px-5 py-24 text-center">
          <img src={crest} alt="Success Real Estate crest" width={96} height={96} className="h-24 w-24 rise" />
          <h1 className="mt-6 font-display text-5xl leading-tight sm:text-7xl">
            <span className="shimmer">Success Real Estate</span>
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.42em] text-gold-soft">
            Your Dream • Our Priority
          </p>
          <p className="mt-6 max-w-xl text-base text-muted-foreground">
            A private concierge for buying, renting and selling exceptional homes — without the
            clutter of a listing portal.
          </p>

          <div className="mt-10 grid w-full gap-3 sm:grid-cols-3">
            {intents.map((item) => (
              <button
                key={item.key}
                onClick={() => setIntent(item.key)}
                className={`rounded-xl border px-5 py-5 text-left transition-all ${
                  intent === item.key
                    ? "border-gold bg-accent shadow-[var(--shadow-gold)]"
                    : "border-border bg-background/60 hover:border-gold/70"
                }`}
              >
                <item.icon className="h-6 w-6 text-gold" />
                <p className="mt-3 font-display text-xl text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.copy}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex w-full flex-col gap-3 rounded-xl border border-gold/50 bg-background/80 p-3 backdrop-blur sm:flex-row">
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search className="h-5 w-5 shrink-0 text-gold" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City, neighborhood or ZIP"
                className="h-12 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Link
              to="/properties"
              search={{ q: query, deal: intent === "sell" ? "all" : intent }}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Search
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            No account needed to browse. Location sharing is always optional.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">Curated this week</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl">Featured residences</h2>
          <Link to="/properties" className="text-sm text-gold hover:underline">
            Browse all listings →
          </Link>
        </div>
        <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l) => (
            <PropertyCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "22 years", copy: "Guiding families through their largest decisions." },
            { icon: Star, title: "4.9 / 5", copy: "Average client rating across 1,400+ closings." },
            { icon: Key, title: "11 days", copy: "Median time from private tour to accepted offer." },
          ].map((s) => (
            <div key={s.title} className="text-center">
              <s.icon className="mx-auto h-8 w-8 text-gold" />
              <p className="mt-4 font-display text-3xl text-gilded">{s.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">Client stories</p>
        <h2 className="mt-3 font-display text-4xl">Trusted at every price point</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-xl border border-gold/35 bg-card p-6">
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-border/70 pt-4">
                <p className="font-display text-lg text-foreground">{t.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-gold">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
