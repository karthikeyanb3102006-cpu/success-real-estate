export type Listing = {
  id: string;
  title: string;
  city: string;
  zip: string;
  price: number;
  deal: "buy" | "rent";
  type: "house" | "apartment" | "villa" | "plot";
  beds: number;
  baths: number;
  sqft: number;
  year: number;
  images: string[];
  amenities: string[];
  blurb: string;
  lat: number;
  lng: number;
};

export const formatPrice = (l: Pick<Listing, "price" | "deal">) =>
  l.deal === "rent"
    ? `₹${l.price.toLocaleString("en-IN")}/mo`
    : `₹${l.price.toLocaleString("en-IN")}`;

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
