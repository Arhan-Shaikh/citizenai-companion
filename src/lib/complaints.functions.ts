import { createServerFn } from "@tanstack/react-start";
import { generateObject, generateText, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createGateway } from "./ai-gateway.server";
import { langLabel } from "./prompt-templates";

const GenerateInput = z.object({
  description: z.string().min(5).max(2000),
  location: z.string().max(200).optional(),
  language: z.string().max(10).default("en"),
});

const ComplaintSchema = z.object({
  subject: z.string(),
  category: z.string(),
  department: z.string(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  body: z.string(),
  expectedImpact: z.string(),
  suggestedEvidence: z.array(z.string()),
  affectedCitizensEstimate: z.string(),
  impactScore: z.number().min(0).max(100),
  nextActions: z.array(
    z.object({
      label: z.string(),
      kind: z.enum(["translate", "assistant", "download"]),
      payload: z.string(),
    }),
  ),
});

export type ComplaintResult = z.infer<typeof ComplaintSchema>;

export const generateComplaint = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => GenerateInput.parse(data))
  .handler(async ({ data }): Promise<ComplaintResult> => {
    const gateway = createGateway();
    const model = gateway(CHAT_MODEL);
    const lang = langLabel(data.language);

    const prompt = `Transform this citizen's informal description into a professional civic complaint suitable for CPGRAMS / municipal grievance portals in India.

Citizen description: """${data.description}"""
Location: ${data.location ?? "not specified"}

Return:
- subject: single formal line, max 120 chars
- category: one short label (e.g. "Sanitation", "Road Infrastructure", "Water Supply")
- department: most likely responsible Indian government department or municipal body
- priority: Low / Medium / High / Critical based on urgency and public risk
- body: a formal complaint letter, 4-8 short paragraphs. Polite, factual, action-oriented. Include reference to relevant laws/citizen rights only if truly applicable.
- expectedImpact: one sentence on what resolution would achieve
- suggestedEvidence: up to 5 items the citizen should attach (photos, receipts, videos)
- affectedCitizensEstimate: a plain-language estimate like "50-100 residents" or "an entire neighborhood"
- impactScore: 0-100 integer weighing urgency, scale of impact, and public safety
- nextActions: exactly 3 items. Kinds:
  * "translate" — payload = target language name (e.g. "Hindi", "Marathi")
  * "assistant" — payload = a specific follow-up question the citizen should ask the AI
  * "download" — payload = "pdf" or "txt"

Write subject, body, expectedImpact in ${lang}. Keep category, department, priority in English (they are internal labels).`;

    try {
      const { object } = await generateObject({
        model,
        prompt,
        schema: ComplaintSchema,
      });
      return {
        ...object,
        nextActions: object.nextActions.slice(0, 3),
        suggestedEvidence: object.suggestedEvidence.slice(0, 5),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("Could not generate a complaint. Please try rewording your description.");
      }
      throw error;
    }
  });

const TranslateInput = z.object({
  text: z.string().min(1).max(6000),
  targetLanguage: z.string().min(2).max(40),
});

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => TranslateInput.parse(data))
  .handler(async ({ data }): Promise<{ text: string }> => {
    const gateway = createGateway();
    const model = gateway(CHAT_MODEL);
    const { text: out } = await generateText({
      model,
      prompt: `Translate the following formal civic complaint into ${data.targetLanguage}. Preserve paragraph structure, formality, and all factual details. Return only the translated text with no preamble.\n\n---\n${data.text}`,
    });
    return { text: out.trim() };
  });
