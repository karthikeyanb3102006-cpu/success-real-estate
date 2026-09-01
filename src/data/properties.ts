export type ListingImage = { url: string; alt: string };

export type Listing = {
  id: string;
  title: string;
  city: string;
  locality: string;
  zip: string;
  price: number;
  deal: "buy" | "rent";
  type: "house" | "apartment" | "villa" | "plot";
  beds: number;
  baths: number;
  parking: number;
  sqft: number;
  year: number;
  status: string;
  images: ListingImage[];
  amenities: string[];
  blurb: string;
  lat: number;
  lng: number;
  seoTitle: string;
  seoDescription: string;
  noindex: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export const PROPERTY_TYPE_LABEL: Record<Listing["type"], string> = {
  house: "House",
  apartment: "Flat / Apartment",
  villa: "Villa",
  plot: "Plot / Land",
};

export const formatPrice = (l: Pick<Listing, "price" | "deal">) =>
  l.deal === "rent"
    ? `₹${l.price.toLocaleString("en-IN")}/mo`
    : `₹${l.price.toLocaleString("en-IN")}`;

/** A listing is indexable only when it has genuine, complete content. */
export function isIndexable(l: Listing): boolean {
  return (
    !l.noindex &&
    !l.isDemo &&
    l.images.length > 0 &&
    l.blurb.trim().length >= 60 &&
    l.price > 0 &&
    l.city.trim().length > 0
  );
}

export function listingHeadline(l: Listing): string {
  const bedPart = l.beds > 0 ? `${l.beds} BHK ` : "";
  const kind =
    l.type === "apartment" ? "Flat" : l.type === "plot" ? "Plot" : l.type === "villa" ? "Villa" : "House";
  const action = l.deal === "rent" ? "for Rent" : "for Sale";
  const place = [l.locality, l.city].filter(Boolean).join(", ");
  return `${bedPart}${kind} ${action} in ${place}`;
}

export const testimonials = [
  {
    name: "Amara & David Okoye",
    role: "Bought in Beverly Hills",
    quote:
      "They treated our search like a concierge service. Every showing was curated, and we closed 11 days early.",
  },
  {
    name: "Priya Raman",
    role: "Leased in Manhattan",
    quote:
      "I moved across the country without a single site visit. The team's honesty made that possible.",
  },
  {
    name: "Marcus Bell",
    role: "Sold in Naples",
    quote:
      "Listed Friday, four offers by Tuesday, closed above asking. The marketing photography was unmatched.",
  },
];
