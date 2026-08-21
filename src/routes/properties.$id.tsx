import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bath, BedDouble, CalendarDays, Check, Heart, MapPin, Ruler } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { formatPrice, getListing } from "@/data/properties";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/properties/$id")({
  loader: ({ params }) => {
    const listing = getListing(params.id);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Listing unavailable — Success Real Estate" }, { name: "robots", content: "noindex" }] };
    }
    const { listing } = loaderData;
    const title = `${listing.title}, ${listing.city} — Success Real Estate`;
    return {
      meta: [
        { title },
        { name: "description", content: listing.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: listing.blurb },
      ],
    };
  },
  component: PropertyDetail,
});

function PropertyDetail() {
  const { listing } = Route.useLoaderData();
  const { isFavorite, toggle } = useFavorites();
  const [active, setActive] = useState(0);
  const saved = isFavorite(listing.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Link to="/properties" className="text-sm text-gold hover:underline">
        ← Back to listings
      </Link>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-xl frame-gold">
          <img
            src={listing.images[active]}
            alt={`${listing.title} photo ${active + 1}`}
            width={1200}
            height={800}
            className="aspect-[3/2] w-full object-cover"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {listing.images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-lg border transition-all",
                i === active ? "border-gold shadow-[var(--shadow-gold)]" : "border-border opacity-70 hover:opacity-100",
              )}
            >
              <img src={img} alt="" loading="lazy" width={1200} height={800} className="aspect-[3/2] w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl">{listing.title}</h1>
              <p className="mt-2 inline-flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold" /> {listing.city} {listing.zip}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl text-gilded">{formatPrice(listing)}</p>
              <button
                onClick={() => toggle(listing.id)}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-2 text-sm text-gold hover:bg-accent"
              >
                <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{listing.blurb}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: BedDouble, label: "Bedrooms", value: listing.beds || "—" },
              { icon: Bath, label: "Bathrooms", value: listing.baths || "—" },
              { icon: Ruler, label: "Size", value: `${listing.sqft.toLocaleString()} sq ft` },
              { icon: CalendarDays, label: "Year built", value: listing.year || "Land" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-card p-4">
                <item.icon className="h-5 w-5 text-gold" />
                <dt className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</dt>
                <dd className="mt-1 font-display text-xl">{item.value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-12 font-display text-2xl">Amenities</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {listing.amenities.map((a) => (
              <li key={a} className="inline-flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-gold" /> {a}
              </li>
            ))}
          </ul>

          <Calculator price={listing.price} deal={listing.deal} />
        </div>

        <aside className="h-fit lg:sticky lg:top-28">
          <InquiryPanel title={listing.title} />
        </aside>
      </div>
    </div>
  );
}

function Calculator({ price, deal }: { price: number; deal: "buy" | "rent" }) {
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(6.2);
  const [years, setYears] = useState(30);

  const monthly = useMemo(() => {
    if (deal === "rent") return price;
    const principal = price * (1 - down / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }, [price, down, rate, years, deal]);

  return (
    <section className="mt-12 rounded-xl border border-gold/40 bg-card p-6">
      <h2 className="font-display text-2xl">
        {deal === "rent" ? "Rent affordability" : "Mortgage calculator"}
      </h2>
      {deal === "rent" ? (
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>Monthly rent: <span className="text-gold">${price.toLocaleString()}</span></p>
          <p>
            Recommended household income:{" "}
            <span className="text-gold">${(price * 40).toLocaleString()}</span> per year
          </p>
          <p>Typical move-in cost (first, last + deposit): <span className="text-gold">${(price * 3).toLocaleString()}</span></p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <Field label={`Down payment · ${down}%`} min={5} max={60} step={1} value={down} onChange={setDown} />
            <Field label={`Interest rate · ${rate.toFixed(1)}%`} min={2} max={10} step={0.1} value={rate} onChange={setRate} />
            <Field label={`Term · ${years} yrs`} min={10} max={30} step={5} value={years} onChange={setYears} />
          </div>
          <p className="mt-6 border-t border-border/70 pt-5 text-sm text-muted-foreground">
            Estimated monthly payment
          </p>
          <p className="font-display text-4xl text-gilded">
            ${Math.round(monthly).toLocaleString()}
            <span className="text-base text-muted-foreground"> /mo</span>
          </p>
        </>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-sm text-muted-foreground">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--gold)]"
      />
    </label>
  );
}

function InquiryPanel({ title }: { title: string }) {
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        toast.success("Request received — an advisor will reply within the hour.");
      }}
      className="space-y-3 rounded-xl border border-gold/50 bg-card p-6"
    >
      <p className="eyebrow">Agent connect</p>
      <h2 className="font-display text-2xl">Contact Success Real Estate</h2>
      <p className="text-sm text-muted-foreground">
        No sign-up required. Ask about {title} and we'll respond personally.
      </p>
      <input required placeholder="Your name" className="h-12 w-full rounded-lg border border-border bg-background px-4 outline-none focus:border-gold" />
      <input required type="email" placeholder="Email or phone" className="h-12 w-full rounded-lg border border-border bg-background px-4 outline-none focus:border-gold" />
      <textarea
        rows={3}
        defaultValue={`I'd like to know more about ${title}.`}
        className="w-full rounded-lg border border-border bg-background p-4 text-sm outline-none focus:border-gold"
      />
      <button className="h-12 w-full rounded-lg bg-primary text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90">
        {sent ? "Request sent" : "Send inquiry"}
      </button>
      <button
        type="button"
        onClick={() => toast.success("Private tour requested — we'll confirm a time shortly.")}
        className="h-12 w-full rounded-lg border border-gold/60 text-sm text-gold transition-colors hover:bg-accent"
      >
        Schedule a Private Tour
      </button>
    </form>
  );
}
