import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { formatPrice, listings } from "@/data/properties";

export default defineTool({
  name: "list_properties",
  title: "List properties",
  description:
    "List Success Real Estate listings, optionally filtered by deal (buy/rent), property type, city text, price range or minimum bedrooms. Prices are in Indian Rupees.",
  inputSchema: {
    deal: z.enum(["buy", "rent"]).optional().describe("Only listings for sale or for rent."),
    type: z.enum(["house", "apartment", "villa", "plot"]).optional().describe("Property type."),
    city: z.string().optional().describe("Case-insensitive match on city, state or ZIP."),
    max_price: z.number().optional().describe("Maximum price in rupees (monthly rent for rentals)."),
    min_beds: z.number().optional().describe("Minimum number of bedrooms."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ deal, type, city, max_price, min_beds }) => {
    const q = city?.trim().toLowerCase();
    const results = listings.filter(
      (l) =>
        (!deal || l.deal === deal) &&
        (!type || l.type === type) &&
        (!q || `${l.title} ${l.city} ${l.zip}`.toLowerCase().includes(q)) &&
        (max_price === undefined || l.price <= max_price) &&
        (min_beds === undefined || l.beds >= min_beds),
    );

    const rows = results.map((l) => ({
      id: l.id,
      title: l.title,
      city: l.city,
      zip: l.zip,
      deal: l.deal,
      type: l.type,
      price: l.price,
      price_display: formatPrice(l),
      beds: l.beds,
      baths: l.baths,
      sqft: l.sqft,
    }));

    return {
      content: [
        {
          type: "text",
          text:
            rows.length === 0
              ? "No listings match those filters."
              : rows
                  .map(
                    (r) =>
                      `${r.title} (${r.id}) — ${r.city} ${r.zip} · ${r.type} for ${r.deal} · ${r.price_display} · ${r.beds} bd / ${r.baths} ba · ${r.sqft.toLocaleString("en-IN")} sqft`,
                  )
                  .join("\n"),
        },
      ],
      structuredContent: { count: rows.length, listings: rows },
    };
  },
});
