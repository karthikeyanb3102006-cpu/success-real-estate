import { queryOptions } from "@tanstack/react-query";

import { getPropertyFn, listPropertiesFn } from "./properties.functions";

export const propertiesQuery = queryOptions({
  queryKey: ["properties"],
  queryFn: () => listPropertiesFn(),
});

export const propertyQuery = (slug: string) =>
  queryOptions({
    queryKey: ["property", slug],
    queryFn: () => getPropertyFn({ data: { slug } }),
  });
