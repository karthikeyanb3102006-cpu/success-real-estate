import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Heart, Ruler } from "lucide-react";

import { formatPrice, type Listing } from "@/data/properties";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function PropertyCard({ listing }: { listing: Listing }) {
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(listing.id);

  return (
    <article className="group overflow-hidden rounded-xl border border-gold/35 bg-card transition-all duration-300 hover:border-gold hover:shadow-[var(--shadow-gold)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link to="/properties/$id" params={{ id: listing.id }}>
          <img
            src={listing.images[0]}
            alt={`${listing.title} in ${listing.city}`}
            loading="lazy"
            width={1200}
            height={800}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        <span className="absolute left-4 top-4 rounded-full border border-gold/70 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold backdrop-blur">
          For {listing.deal}
        </span>
        <button
          aria-label={saved ? "Remove from collection" : "Save to collection"}
          onClick={() => toggle(listing.id)}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/70 bg-background/80 text-gold backdrop-blur transition-colors hover:bg-accent"
        >
          <Heart className={cn("h-5 w-5", saved && "fill-current")} />
        </button>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl text-foreground">{listing.title}</h3>
          <p className="whitespace-nowrap font-display text-lg text-gold">{formatPrice(listing)}</p>
        </div>
        <p className="text-sm text-muted-foreground">{listing.city}</p>
        <div className="flex flex-wrap gap-4 border-t border-border/70 pt-3 text-sm text-muted-foreground">
          {listing.beds > 0 ? (
            <span className="inline-flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-gold" /> {listing.beds} bd
            </span>
          ) : null}
          {listing.baths > 0 ? (
            <span className="inline-flex items-center gap-2">
              <Bath className="h-4 w-4 text-gold" /> {listing.baths} ba
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2">
            <Ruler className="h-4 w-4 text-gold" /> {listing.sqft.toLocaleString()} sq ft
          </span>
        </div>
        <Link
          to="/properties/$id"
          params={{ id: listing.id }}
          className="inline-flex w-full items-center justify-center rounded-md border border-gold/60 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-accent"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
