import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createGateway } from "./ai-gateway.server";
import { langLabel } from "./prompt-templates";

const DocInput = z.object({
  documentType: z.string().min(2).max(80),
  language: z.string().max(10).default("en"),
});

export type NextAction = {
  label: string;
  kind: "assistant" | "schemes" | "complaints";
  payload: string;
};

export type DocumentGuide = {
  summary: string;
  eligibility: string[];
  requiredDocuments: string[];
  fees: string;
  timeline: string;
  applicationSteps: string[];
  commonMistakes: string[];
  tips: string[];
  officialPortal: string | null;
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
    let repaired = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
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

function normalize(raw: unknown, docType: string): DocumentGuide {
  const r = (raw ?? {}) as Record<string, unknown>;
  const link = asString(r.officialPortal, "").trim();
  const naRaw = Array.isArray(r.nextActions) ? r.nextActions : [];
  const nextActions: NextAction[] = naRaw
    .map((a) => {
      const x = (a ?? {}) as Record<string, unknown>;
      const kind = asString(x.kind) as NextAction["kind"];
      return {
        label: asString(x.label).trim(),
        kind: (["assistant", "schemes", "complaints"] as const).includes(kind) ? kind : "assistant",
        payload: asString(x.payload).trim(),
      };
    })
    .filter((a) => a.label && a.payload)
    .slice(0, 3);

  return {
    summary: asString(r.summary).trim() || `Guide for ${docType}.`,
    eligibility: asStringArray(r.eligibility),
    requiredDocuments: asStringArray(r.requiredDocuments),
    fees: asString(r.fees).trim() || "Varies — check the official portal.",
    timeline: asString(r.timeline).trim() || "Varies — check the official portal.",
    applicationSteps: asStringArray(r.applicationSteps),
    commonMistakes: asStringArray(r.commonMistakes),
    tips: asStringArray(r.tips),
    officialPortal: link && /^https?:\/\//i.test(link) ? link : null,
    nextActions,
  };
}

export const getDocumentGuide = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DocInput.parse(data))
  .handler(async ({ data }): Promise<DocumentGuide> => {
    console.log("[documents] request:", data.documentType, "lang:", data.language);
    const gateway = createGateway();
    const model = gateway(CHAT_MODEL);
    const lang = langLabel(data.language);

    const prompt = `You are an expert on Indian government documents. Produce a citizen-facing application guide for obtaining "${data.documentType}" in India. Be precise and factual.

Reply in ${lang} for all user-facing text (keep the officialPortal URL in English).

Return ONLY a valid JSON object (no markdown, no code fences, no commentary) exactly matching this shape:
{
  "summary": "1-2 sentences",
  "eligibility": ["string", "..."],
  "requiredDocuments": ["string", "..."],
  "fees": "plain-language fee summary",
  "timeline": "realistic processing time",
  "applicationSteps": ["string", "..."],
  "commonMistakes": ["string", "..."],
  "tips": ["string", "..."],
  "officialPortal": "https://... or null",
  "nextActions": [
    { "label": "short text", "kind": "assistant" | "schemes" | "complaints", "payload": "string" }
  ]
}

Constraints: up to 5 eligibility, up to 8 requiredDocuments, 4-7 applicationSteps, up to 5 commonMistakes, up to 5 tips. Exactly 3 nextActions. Never invent URLs — use null when unsure. Output JSON only.`;

    console.log("[documents] prompt built, length:", prompt.length);

    let text = "";
    try {
      const result = await generateText({ model, prompt });
      text = result.text ?? "";
      console.log("[documents] gateway response length:", text.length);
    } catch (err) {
      console.error("[documents] gateway request failed:", err);
      throw err instanceof Error ? err : new Error("Document service unavailable");
    }

    if (!text.trim()) {
      console.error("[documents] empty response from gateway");
      throw new Error("The AI returned an empty response. Please try again.");
    }

    try {
      const parsed = extractJson(text);
      const guide = normalize(parsed, data.documentType);
      console.log("[documents] parsed OK. steps:", guide.applicationSteps.length, "docs:", guide.requiredDocuments.length);
      return guide;
    } catch (err) {
      console.error("[documents] JSON parse failed:", err, "\nRaw:", text.slice(0, 800));
      // Fallback: return summary-only guide from raw text so UI shows something useful.
      return normalize({ summary: text.slice(0, 400) }, data.documentType);
    }
  });
