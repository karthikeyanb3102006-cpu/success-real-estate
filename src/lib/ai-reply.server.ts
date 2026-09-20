import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type DraftInput = {
  enquiry: string;
  propertyDetails?: string;
  buyerName?: string;
  tone: "warm" | "formal" | "concise";
};

const TONE: Record<DraftInput["tone"], string> = {
  warm: "warm, welcoming and personal, while staying professional",
  formal: "formal, precise and businesslike",
  concise: "brief and to the point, no more than six short sentences",
};

export async function draftReply(input: DraftInput): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project.");

  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  const result = streamText({
    model: lovable.responses("openai/gpt-6-astra"),
    system: [
      "You are a senior agent at Success Real Estate, a luxury property firm in Coimbatore, India.",
      "Write a ready-to-send reply to a buyer's enquiry.",
      "Answer what the buyer asked using only the property details provided; never invent prices, sizes, approvals or availability.",
      "Prices are in Indian Rupees. Close by offering a private tour and sharing our WhatsApp number +91 88077 39441.",
      "Return only the message body: a greeting, the reply, and a sign-off from the Success Real Estate team. No subject line, no placeholders in square brackets other than none at all.",
    ].join(" "),
    prompt: [
      input.buyerName ? `Buyer name: ${input.buyerName}` : "Buyer name: unknown",
      `Preferred tone: ${TONE[input.tone]}`,
      `Buyer's enquiry message:\n${input.enquiry}`,
      input.propertyDetails ? `Property details:\n${input.propertyDetails}` : "No property details supplied.",
    ].join("\n\n"),
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const text = await result.text;
  if (!text.trim()) throw new Error("The model returned an empty draft. Try again.");
  return text.trim();
}
