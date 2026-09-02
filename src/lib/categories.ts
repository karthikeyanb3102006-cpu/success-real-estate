import type { Listing } from "@/data/properties";

export const CITY = "Coimbatore";
export const SITE_URL = "https://success-real-estate.lovable.app";

export type CategoryFaq = { q: string; a: string };

export type CategoryDef = {
  /** Route path, e.g. /properties-for-sale-coimbatore */
  path: string;
  h1: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  deal?: Listing["deal"];
  type?: Listing["type"];
  faqs: CategoryFaq[];
  /** When set, this page points its canonical at another category (near-duplicate intent). */
  canonicalPath?: string;
};

const buyFaq: CategoryFaq[] = [
  {
    q: "What documents should I check before buying property in Coimbatore?",
    a: "Ask for the parent document, current sale deed, patta/chitta, EC for the last 15 years, approved plan and property tax receipts. Our team reviews these with you before you pay any advance.",
  },
  {
    q: "Do you help with home loans?",
    a: "Yes. We share the paperwork banks ask for and introduce you to lenders we work with regularly, so approvals move faster. We do not charge for this introduction.",
  },
  {
    q: "Can I visit a property before deciding?",
    a: "Always. Call or WhatsApp +91 88077 39441 and we will arrange a site visit at a time that suits you.",
  },
];

const rentFaq: CategoryFaq[] = [
  {
    q: "How much advance is normal for rentals in Coimbatore?",
    a: "Most owners ask for three to ten months of rent as an advance, depending on the locality and whether the home is furnished. The exact figure is confirmed before you view the property.",
  },
  {
    q: "Are maintenance and other charges included in the rent shown?",
    a: "Rents listed here are the monthly rent only. Apartment maintenance, water and electricity are billed separately unless the listing says otherwise.",
  },
  {
    q: "How quickly can I move in?",
    a: "Once the owner approves your profile and the agreement is signed, most homes are handed over within a week.",
  },
];

export const CATEGORIES: CategoryDef[] = [
  {
    path: "/properties-for-sale-coimbatore",
    h1: "Properties for Sale in Coimbatore",
    eyebrow: "Buy in Coimbatore",
    title: "Properties for Sale in Coimbatore — Success Real Estate",
    description:
      "Browse verified houses, flats, villas and plots for sale in Coimbatore with prices, sizes and locality details. Site visits arranged by Success Real Estate.",
    intro:
      "Every listing below is available to buy in and around Coimbatore. Use the filters to narrow by budget, bedrooms or property type, and reach out when you would like to see a place in person.",
    deal: "buy",
    faqs: buyFaq,
  },
  {
    path: "/properties-for-rent-coimbatore",
    h1: "Properties for Rent in Coimbatore",
    eyebrow: "Rent in Coimbatore",
    title: "Properties for Rent in Coimbatore — Success Real Estate",
    description:
      "Houses, flats and villas for rent in Coimbatore with monthly rent, bedrooms and locality details. Schedule a viewing with Success Real Estate.",
    intro:
      "Rental homes across Coimbatore, from compact flats near the IT corridor to independent houses in quieter residential areas. Monthly rents are shown as quoted by the owner.",
    deal: "rent",
    faqs: rentFaq,
  },
  {
    path: "/houses-for-sale-coimbatore",
    h1: "Houses for Sale in Coimbatore",
    eyebrow: "Independent houses",
    title: "Independent Houses for Sale in Coimbatore — Success Real Estate",
    description:
      "Independent houses for sale in Coimbatore with plot size, built-up area, bedrooms and parking details. Verified listings from Success Real Estate.",
    intro:
      "Independent houses give you the land as well as the building. The listings below show built-up area, bedrooms and parking so you can compare quickly.",
    deal: "buy",
    type: "house",
    faqs: buyFaq,
  },
  {
    path: "/flats-for-sale-coimbatore",
    h1: "Flats and Apartments for Sale in Coimbatore",
    eyebrow: "Flats & apartments",
    title: "Flats & Apartments for Sale in Coimbatore — Success Real Estate",
    description:
      "2 BHK and 3 BHK flats and apartments for sale in Coimbatore with carpet area, floor and amenity details from Success Real Estate.",
    intro:
      "Apartments suit buyers who want security, lifts and shared amenities without maintaining a whole building. Compare carpet area and amenities below.",
    deal: "buy",
    type: "apartment",
    faqs: buyFaq,
  },
  {
    path: "/villas-for-sale-coimbatore",
    h1: "Villas for Sale in Coimbatore",
    eyebrow: "Gated villas",
    title: "Villas for Sale in Coimbatore — Success Real Estate",
    description:
      "Gated-community and standalone villas for sale in Coimbatore with land area, bedrooms and amenities. Arrange a private viewing with Success Real Estate.",
    intro:
      "Villas combine the privacy of an independent home with community security and shared amenities. Each listing shows land area, bedrooms and what the community offers.",
    deal: "buy",
    type: "villa",
    faqs: buyFaq,
  },
  {
    path: "/plots-for-sale-coimbatore",
    h1: "Plots for Sale in Coimbatore",
    eyebrow: "Residential plots",
    title: "Residential Plots for Sale in Coimbatore — Success Real Estate",
    description:
      "DTCP and panchayat-approved residential plots for sale in Coimbatore with dimensions, locality and pricing. Documentation checked by Success Real Estate.",
    intro:
      "Buying a plot lets you build to your own plan. We list the approval status and dimensions for each plot, and we walk you through the documents before you commit.",
    deal: "buy",
    type: "plot",
    faqs: [
      {
        q: "What approval should a plot have in Coimbatore?",
        a: "Look for DTCP or CMDA approval, or a clear panchayat approval with an approved layout number. We confirm the approval on record before listing a plot.",
      },
      ...buyFaq.slice(0, 2),
    ],
  },
  {
    path: "/land-for-sale-coimbatore",
    h1: "Land for Sale in Coimbatore",
    eyebrow: "Land & plots",
    title: "Land for Sale in Coimbatore — Success Real Estate",
    description:
      "Land and residential plots for sale in and around Coimbatore with area, approval status and locality details from Success Real Estate.",
    intro:
      "Land parcels and residential plots available in and around Coimbatore. Sizes, localities and approval details are listed for each parcel.",
    deal: "buy",
    type: "plot",
    canonicalPath: "/plots-for-sale-coimbatore",
    faqs: [
      {
        q: "Can you help verify land documents?",
        a: "Yes. We check the patta, encumbrance certificate and layout approval, and recommend a lawyer for a full title opinion on larger parcels.",
      },
      ...buyFaq.slice(1),
    ],
  },
];

export function filterByCategory(listings: Listing[], def: CategoryDef) {
  const base = listings.filter(
    (l) => (!def.deal || l.deal === def.deal) && (!def.type || l.type === def.type),
  );
  const local = base.filter((l) =>
    `${l.city} ${l.locality}`.toLowerCase().includes(CITY.toLowerCase()),
  );
  return local.length > 0 ? { results: local, cityOnly: true } : { results: base, cityOnly: false };
}
