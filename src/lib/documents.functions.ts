import { createServerFn } from "@tanstack/react-start";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createGateway } from "./ai-gateway.server";
import { langLabel } from "./prompt-templates";

const DocInput = z.object({
  documentType: z.string().min(2).max(80),
  language: z.string().max(10).default("en"),
});

const GuideSchema = z.object({
  summary: z.string(),
  eligibility: z.array(z.string()),
  requiredDocuments: z.array(z.string()),
  fees: z.string(),
  timeline: z.string(),
  applicationSteps: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  tips: z.array(z.string()),
  officialPortal: z.string().nullable(),
  nextActions: z.array(
    z.object({
      label: z.string(),
      kind: z.enum(["assistant", "schemes", "complaints"]),
      payload: z.string(),
    }),
  ),
});

export type DocumentGuide = z.infer<typeof GuideSchema>;

export const getDocumentGuide = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DocInput.parse(data))
  .handler(async ({ data }): Promise<DocumentGuide> => {
    const gateway = createGateway();
    const model = gateway(CHAT_MODEL);
    const lang = langLabel(data.language);

    const prompt = `Produce a citizen-facing application guide for obtaining "${data.documentType}" in India. Be precise and factual. Use current, well-known official processes.

Return:
- summary: 1-2 sentences describing what this document is and why it matters.
- eligibility: up to 5 clear eligibility bullets.
- requiredDocuments: up to 8 documents/proofs typically needed.
- fees: plain-language fee summary (e.g. "INR 1,500 for a 36-page normal passport; INR 2,000 for tatkaal"). If fees vary by category, mention it briefly.
- timeline: realistic processing time (e.g. "15-30 days for normal, 3-7 days for tatkaal").
- applicationSteps: 4-7 numbered actions.
- commonMistakes: up to 5 pitfalls citizens frequently make.
- tips: up to 5 insider tips.
- officialPortal: canonical Government of India URL (e.g. https://passportindia.gov.in). Return null if unsure — never invent.
- nextActions: exactly 3. Kinds:
  * "assistant" — payload = a follow-up question
  * "schemes" — payload = a scheme category to explore
  * "complaints" — payload = a common complaint scenario related to this doc

Write everything in ${lang}. Keep the officialPortal URL as-is in English.`;

    try {
      const { object } = await generateObject({
        model,
        prompt,
        schema: GuideSchema,
      });
      return {
        ...object,
        nextActions: object.nextActions.slice(0, 3),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("Could not generate document guide. Please try again.");
      }
      throw error;
    }
  });
