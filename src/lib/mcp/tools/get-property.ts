import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { formatPrice } from "@/data/properties";
import { getPropertyFn } from "@/lib/properties.functions";

export default defineTool({
  name: "get_property",
  title: "Get property details",
  description:
    "Get full details for one Success Real Estate listing by its id, including amenities, size, year built and coordinates.",
  inputSchema: { id: z.string().describe("Listing id, e.g. crown-ridge-villa.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const l = await getPropertyFn({ data: { slug: id } });
    if (!l) throw new ToolError(`No listing found with id "${id}".`);

    const detail = {
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
      year: l.year,
      amenities: l.amenities,
      description: l.blurb,
      lat: l.lat,
      lng: l.lng,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
      structuredContent: { listing: detail },
    };
  },
});
