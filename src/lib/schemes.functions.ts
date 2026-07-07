import { createServerFn } from "@tanstack/react-start";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createGateway } from "./ai-gateway.server";
import { langLabel } from "./prompt-templates";

const InputSchema = z.object({
  age: z.number().min(0).max(120),
  gender: z.string().max(30),
  state: z.string().max(60),
  occupation: z.string().max(80),
  monthlyIncome: z.number().min(0).max(10_000_000),
  tags: z.array(z.string().max(40)).max(10),
  language: z.string().max(10).default("en"),
});

const SchemeSchema = z.object({
  schemes: z.array(
    z.object({
      name: z.string(),
      ministry: z.string(),
      whyEligible: z.string(),
      benefits: z.array(z.string()),
      documents: z.array(z.string()),
      steps: z.array(z.string()),
      officialLink: z.string().nullable(),
    }),
  ),
  nextActions: z.array(
    z.object({
      label: z.string(),
      kind: z.enum(["assistant", "documents", "complaints"]),
      payload: z.string(),
    }),
  ),
});

export type SchemeResult = z.infer<typeof SchemeSchema>;

export const recommendSchemes = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<SchemeResult> => {
    const gateway = createGateway();
    const model = gateway(CHAT_MODEL);
    const lang = langLabel(data.language);

    const prompt = `Recommend up to 4 real Government of India schemes for this citizen. Prioritize national schemes and well-known state schemes for ${data.state}.

Citizen profile:
- Age: ${data.age}
- Gender: ${data.gender}
- State: ${data.state}
- Occupation: ${data.occupation}
- Monthly income (INR): ${data.monthlyIncome}
- Special categories: ${data.tags.length ? data.tags.join(", ") : "none"}

For each scheme, provide: name, administering ministry, a single sentence whyEligible, up to 4 benefits, up to 6 required documents, up to 5 clear application steps, and the official website URL if you are confident (use null otherwise — never invent URLs).

Then provide exactly 3 nextActions the citizen should take. Each nextAction "kind" must be one of:
- "assistant": pose a follow-up question to the AI (payload = the question)
- "documents": open the Document Assistant for a specific doc (payload = doc name like "Aadhaar", "Income Certificate")
- "complaints": draft a complaint (payload = brief description)

Write all user-facing text in ${lang}. Keep total output concise.`;

    try {
      const { object } = await generateObject({
        model,
        prompt,
        schema: SchemeSchema,
      });
      return {
        schemes: object.schemes.slice(0, 4),
        nextActions: object.nextActions.slice(0, 3),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { schemes: [], nextActions: [] };
      }
      throw error;
    }
  });
