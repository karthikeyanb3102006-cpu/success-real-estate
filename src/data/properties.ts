import hero from "@/assets/hero-estate.jpg";
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import p4 from "@/assets/property-4.jpg";

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

export const listings: Listing[] = [
  {
    id: "crown-ridge-villa",
    title: "Crown Ridge Villa",
    city: "Beverly Hills, CA",
    zip: "90210",
    price: 4850000,
    deal: "buy",
    type: "villa",
    beds: 5,
    baths: 6,
    sqft: 6400,
    year: 2021,
    images: [hero, p1, p4],
    amenities: ["Infinity pool", "Wine cellar", "Smart home", "4-car garage", "Ocean view"],
    blurb:
      "A cliffside statement residence with walls of glass, an infinity edge pool and uninterrupted sunset views.",
    lat: 34.09,
    lng: -118.4,
  },
  {
    id: "skyline-penthouse",
    title: "The Skyline Penthouse",
    city: "Manhattan, NY",
    zip: "10019",
    price: 12500,
    deal: "rent",
    type: "apartment",
    beds: 3,
    baths: 3,
    sqft: 2450,
    year: 2019,
    images: [p2, hero],
    amenities: ["Concierge", "Private elevator", "Gym", "Skyline terrace"],
    blurb:
      "Floor-to-ceiling glass wrapped around the skyline, with a private elevator landing and 24/7 concierge.",
    lat: 40.76,
    lng: -73.98,
  },
  {
    id: "oakwood-family-home",
    title: "Oakwood Family Home",
    city: "Naperville, IL",
    zip: "60540",
    price: 875000,
    deal: "buy",
    type: "house",
    beds: 4,
    baths: 3,
    sqft: 3100,
    year: 2008,
    images: [p3, p1],
    amenities: ["Corner lot", "Finished basement", "Top school district", "Fireplace"],
    blurb:
      "Classic curb appeal on a quiet tree-lined street, minutes from the best schools in the district.",
    lat: 41.78,
    lng: -88.15,
  },
  {
    id: "azure-beach-residence",
    title: "Azure Beach Residence",
    city: "Naples, FL",
    zip: "34102",
    price: 3290000,
    deal: "buy",
    type: "villa",
    beds: 4,
    baths: 5,
    sqft: 4800,
    year: 2020,
    images: [p4, hero],
    amenities: ["Private beach access", "Heated pool", "Outdoor kitchen", "Hurricane glass"],
    blurb:
      "Direct beachfront living with a wraparound terrace, heated pool and sunsets over the Gulf.",
    lat: 26.14,
    lng: -81.79,
  },
  {
    id: "hillcrest-glass-house",
    title: "Hillcrest Glass House",
    city: "Austin, TX",
    zip: "78703",
    price: 8900,
    deal: "rent",
    type: "house",
    beds: 4,
    baths: 4,
    sqft: 3600,
    year: 2017,
    images: [p1, p3],
    amenities: ["Hill country views", "Home office", "EV charger", "Chef's kitchen"],
    blurb:
      "Terraced hillside home with cantilevered decks and a chef's kitchen made for entertaining.",
    lat: 30.29,
    lng: -97.77,
  },
  {
    id: "goldleaf-estate-lot",
    title: "Goldleaf Estate Lot",
    city: "Scottsdale, AZ",
    zip: "85255",
    price: 640000,
    deal: "buy",
    type: "plot",
    beds: 0,
    baths: 0,
    sqft: 21780,
    year: 0,
    images: [p3, p4],
    amenities: ["Half-acre", "Utilities at lot line", "Mountain views", "Gated community"],
    blurb:
      "A half-acre build-ready parcel inside a gated enclave, with mountain views on every elevation.",
    lat: 33.65,
    lng: -111.9,
  },
];

export const getListing = (id: string) => listings.find((l) => l.id === id);

export const formatPrice = (l: Pick<Listing, "price" | "deal">) =>
  l.deal === "rent"
    ? `$${l.price.toLocaleString()}/mo`
    : `$${l.price.toLocaleString()}`;

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
