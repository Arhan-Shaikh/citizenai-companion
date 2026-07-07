import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
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

export type Scheme = {
  name: string;
  ministry: string;
  whyEligible: string;
  benefits: string[];
  documents: string[];
  steps: string[];
  officialLink: string | null;
};

export type NextAction = {
  label: string;
  kind: "assistant" | "documents" | "complaints";
  payload: string;
};

export type SchemeResult = {
  schemes: Scheme[];
  nextActions: NextAction[];
};

function extractJson(text: string): unknown {
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.search(/[{[]/);
  if (start === -1) throw new Error("No JSON found in response");
  const openChar = cleaned[start];
  const closeChar = openChar === "[" ? "]" : "}";
  const end = cleaned.lastIndexOf(closeChar);
  if (end === -1 || end < start) throw new Error("No JSON terminator found");
  cleaned = cleaned.substring(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch {
    // repair pass
    let repaired = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
    // balance braces/brackets
    let braces = 0;
    let brackets = 0;
    for (const c of repaired) {
      if (c === "{") braces++;
      else if (c === "}") braces--;
      else if (c === "[") brackets++;
      else if (c === "]") brackets--;
    }
    while (brackets-- > 0) repaired += "]";
    while (braces-- > 0) repaired += "}";
    return JSON.parse(repaired);
  }
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === "string" ? x : String(x ?? ""))).filter(Boolean);
}

function normalize(raw: unknown): SchemeResult {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const schemesRaw = Array.isArray(obj.schemes) ? obj.schemes : Array.isArray(raw) ? (raw as unknown[]) : [];
  const schemes: Scheme[] = schemesRaw
    .map((s) => {
      const r = (s ?? {}) as Record<string, unknown>;
      const link = asString(r.officialLink, "").trim();
      return {
        name: asString(r.name).trim(),
        ministry: asString(r.ministry).trim() || "Government of India",
        whyEligible: asString(r.whyEligible).trim(),
        benefits: asStringArray(r.benefits),
        documents: asStringArray(r.documents),
        steps: asStringArray(r.steps),
        officialLink: link && /^https?:\/\//i.test(link) ? link : null,
      };
    })
    .filter((s) => s.name.length > 0);

  const naRaw = Array.isArray(obj.nextActions) ? obj.nextActions : [];
  const nextActions: NextAction[] = naRaw
    .map((a) => {
      const r = (a ?? {}) as Record<string, unknown>;
      const kind = asString(r.kind) as NextAction["kind"];
      return {
        label: asString(r.label).trim(),
        kind: (["assistant", "documents", "complaints"] as const).includes(kind) ? kind : "assistant",
        payload: asString(r.payload).trim(),
      };
    })
    .filter((a) => a.label && a.payload);

  return { schemes: schemes.slice(0, 6), nextActions: nextActions.slice(0, 3) };
}

export const recommendSchemes = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<SchemeResult> => {
    const gateway = createGateway();
    const model = gateway(CHAT_MODEL);
    const lang = langLabel(data.language);

    const prompt = `You are an expert on Government of India welfare schemes. Recommend 4 to 6 REAL schemes (mix of Central and ${data.state} state schemes) for this citizen. Always return schemes — every citizen qualifies for something (e.g. Ayushman Bharat, PMJAY, PM-KISAN, Sukanya Samriddhi, NPS, Atal Pension Yojana, Startup India, Skill India, Stand-Up India, state-specific ration/education/pension schemes).

Citizen profile:
- Age: ${data.age}
- Gender: ${data.gender}
- State: ${data.state}
- Occupation: ${data.occupation}
- Monthly income (INR): ${data.monthlyIncome}
- Special categories: ${data.tags.length ? data.tags.join(", ") : "none"}

Reply in ${lang} for all user-facing text (keep scheme names and URLs in English).

Return ONLY a valid JSON object (no markdown, no code fences, no commentary) exactly matching this shape:
{
  "schemes": [
    {
      "name": "string",
      "ministry": "string",
      "whyEligible": "one sentence",
      "benefits": ["string", "..."],
      "documents": ["string", "..."],
      "steps": ["string", "..."],
      "officialLink": "https://... or null"
    }
  ],
  "nextActions": [
    { "label": "short button text", "kind": "assistant" | "documents" | "complaints", "payload": "string" }
  ]
}

Constraints: 4-6 schemes, up to 4 benefits, up to 6 documents, up to 5 steps each. Provide exactly 3 nextActions. Never invent URLs — use null when unsure. Output JSON only.`;

    let text = "";
    try {
      const result = await generateText({ model, prompt });
      text = result.text ?? "";
      console.log("[schemes] gateway response length:", text.length);
    } catch (err) {
      console.error("[schemes] gateway request failed:", err);
      throw err instanceof Error ? err : new Error("Scheme service unavailable");
    }

    if (!text.trim()) {
      console.error("[schemes] empty response text from gateway");
      throw new Error("The AI returned an empty response. Please try again.");
    }

    try {
      const parsed = extractJson(text);
      const normalized = normalize(parsed);
      console.log("[schemes] parsed schemes:", normalized.schemes.length);
      return normalized;
    } catch (err) {
      console.error("[schemes] JSON parse failed:", err, "\nRaw:", text.slice(0, 500));
      // Do not throw — return what we can so the UI shows a helpful state.
      return { schemes: [], nextActions: [] };
    }
  });
