import { auth, defineMcp } from "@lovable.dev/mcp-js";

import getMyProfileTool from "./tools/get-my-profile";
import getPropertyTool from "./tools/get-property";
import listPropertiesTool from "./tools/list-properties";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "success-real-estate",
  title: "Success real estate",
  version: "0.1.0",
  instructions:
    "Tools for Success Real Estate, a luxury property brand. Use `list_properties` to browse or filter the catalogue (prices in Indian Rupees), `get_property` for full details of one listing, and `get_my_profile` for the signed-in user's contact details.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listPropertiesTool, getPropertyTool, getMyProfileTool],
});
