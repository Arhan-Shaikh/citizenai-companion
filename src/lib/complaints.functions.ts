import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { CHAT_MODEL, createGateway } from "./ai-gateway.server";
import { langLabel } from "./prompt-templates";
import { asClampedInt, asString, asStringArray, extractJson } from "./safe-json";
import { createLogger } from "./logger";

const log = createLogger("complaints");

const GenerateInput = z.object({
  description: z.string().min(5).max(2000),
  location: z.string().max(200).optional(),
  language: z.string().max(10).default("en"),
});

export type NextComplaintAction = {
  label: string;
  kind: "translate" | "assistant" | "download";
  payload: string;
};

export type ComplaintResult = {
  subject: string;
  category: string;
  department: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  body: string;
  expectedImpact: string;
  suggestedEvidence: string[];
  affectedCitizensEstimate: string;
  impactScore: number;
  nextActions: NextComplaintAction[];
};

function asPriority(v: unknown): ComplaintResult["priority"] {
  const s = asString(v).trim().toLowerCase();
  if (s.startsWith("crit")) return "Critical";
  if (s.startsWith("hig")) return "High";
  if (s.startsWith("low")) return "Low";
  return "Medium";
}

function extractField(text: string, label: string): string {
  const re = new RegExp(`(?:^|\\n)\\s*(?:\\*\\*|##?\\s*)?${label}\\s*(?:\\*\\*)?\\s*[:\\-]\\s*([^\\n]+(?:\\n(?!\\s*(?:\\*\\*|##?|[A-Z][A-Za-z ]+:))[^\\n]+)*)`, "i");
  const m = text.match(re);
  return m ? m[1].trim().replace(/^\*+|\*+$/g, "").trim() : "";
}

function fallbackParse(text: string, description: string): ComplaintResult {
  const subject = extractField(text, "Subject") || description.slice(0, 100);
  const category = extractField(text, "Category") || "General Grievance";
  const department = extractField(text, "Department") || "Municipal Authority";
  const priority = asPriority(extractField(text, "Priority"));
  const bodyMatch = text.match(/(?:Complaint Body|Body|Complaint Letter)\s*[:\-]?\s*([\s\S]+?)(?=\n\s*(?:Suggested Evidence|Expected|Impact|Affected|Next Actions)\s*[:\-]|$)/i);
  const body = bodyMatch ? bodyMatch[1].trim() : text.trim();
  const evidenceMatch = text.match(/Suggested Evidence\s*[:\-]?\s*([\s\S]+?)(?=\n\s*(?:Expected|Impact|Affected|Next Actions|$))/i);
  const suggestedEvidence = evidenceMatch
    ? evidenceMatch[1]
        .split(/\n|,/)
        .map((s) => s.replace(/^[\s\-*•\d.]+/, "").trim())
        .filter((s) => s.length > 2)
        .slice(0, 5)
    : [];
  const expectedImpact = extractField(text, "Expected Resolution") || extractField(text, "Expected Impact") || "Timely resolution of the reported issue.";

  return {
    subject: subject.slice(0, 140),
    category,
    department,
    priority,
    body,
    expectedImpact,
    suggestedEvidence,
    affectedCitizensEstimate: extractField(text, "Affected") || "Local residents in the area",
    impactScore: 60,
    nextActions: [
      { label: "Translate to Hindi", kind: "translate", payload: "Hindi" },
      { label: "Ask follow-up in Assistant", kind: "assistant", payload: `How do I escalate this complaint: ${subject.slice(0, 80)}?` },
      { label: "Download as .txt", kind: "download", payload: "txt" },
    ],
  };
}

function normalize(raw: unknown, description: string): ComplaintResult {
  const obj = (raw ?? {}) as Record<string, unknown>;

  const nextActionsRaw = Array.isArray(obj.nextActions) ? obj.nextActions : [];
  const nextActions: NextComplaintAction[] = nextActionsRaw
    .map((a) => {
      const r = (a ?? {}) as Record<string, unknown>;
      const kind = asString(r.kind).toLowerCase();
      const validKind: NextComplaintAction["kind"] =
        kind === "translate" || kind === "assistant" || kind === "download" ? kind : "assistant";
      return {
        label: asString(r.label).trim(),
        kind: validKind,
        payload: asString(r.payload).trim(),
      };
    })
    .filter((a) => a.label && a.payload)
    .slice(0, 3);

  while (nextActions.length < 3) {
    const defaults: NextComplaintAction[] = [
      { label: "Translate to Hindi", kind: "translate", payload: "Hindi" },
      { label: "Ask follow-up in Assistant", kind: "assistant", payload: `How do I escalate this complaint?` },
      { label: "Download as .txt", kind: "download", payload: "txt" },
    ];
    nextActions.push(defaults[nextActions.length]);
  }

  const impactScore = asClampedInt(obj.impactScore, 0, 100, 60);

  const subject = asString(obj.subject).trim() || description.slice(0, 100);
  const body = asString(obj.body).trim() || asString(obj.complaintBody).trim() || description;

  return {
    subject: subject.slice(0, 140),
    category: asString(obj.category).trim() || "General Grievance",
    department: asString(obj.department).trim() || "Municipal Authority",
    priority: asPriority(obj.priority),
    body,
    expectedImpact: asString(obj.expectedImpact).trim() || asString(obj.expectedResolution).trim() || "Timely resolution of the reported issue.",
    suggestedEvidence: asStringArray(obj.suggestedEvidence).slice(0, 5),
    affectedCitizensEstimate: asString(obj.affectedCitizensEstimate).trim() || "Local residents in the area",
    impactScore,
    nextActions,
  };
}

export const generateComplaint = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => GenerateInput.parse(data))
  .handler(async ({ data }): Promise<ComplaintResult> => {
    const gateway = createGateway();
    const model = gateway(CHAT_MODEL);
    const lang = langLabel(data.language);

    const prompt = `You are drafting a professional civic complaint for CPGRAMS / municipal grievance portals in India.

Citizen description: """${data.description}"""
Location: ${data.location ?? "not specified"}

Return ONLY a valid JSON object (no markdown, no code fences, no commentary) exactly matching this shape:
{
  "subject": "single formal line, max 120 chars",
  "category": "short label e.g. Sanitation, Road Infrastructure, Water Supply",
  "department": "most likely responsible Indian government department or municipal body",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "body": "formal complaint letter, 4-8 short paragraphs, polite factual action-oriented",
  "expectedImpact": "one sentence on what resolution would achieve",
  "suggestedEvidence": ["up to 5 items citizen should attach"],
  "affectedCitizensEstimate": "plain-language estimate e.g. 50-100 residents",
  "impactScore": 0-100 integer,
  "nextActions": [
    { "label": "short text", "kind": "translate" | "assistant" | "download", "payload": "string" }
  ]
}

nextActions: exactly 3 items. kinds:
- "translate" — payload = target language name (e.g. "Hindi", "Marathi")
- "assistant" — payload = specific follow-up question citizen should ask the AI
- "download" — payload = "pdf" or "txt"

Write subject, body, expectedImpact in ${lang}. Keep category, department, priority in English. Output JSON only.`;

    log.debug("prompt built", { length: prompt.length });

    let text = "";
    try {
      const result = await generateText({ model, prompt });
      text = result.text ?? "";
      log.debug("gateway response", { length: text.length });
    } catch (err) {
      log.error("gateway request failed", err);
      throw new Error("Complaint service is temporarily unavailable. Please try again in a moment.");
    }

    if (!text.trim()) {
      log.error("empty response from gateway");
      throw new Error("The AI returned an empty response. Please try again.");
    }

    try {
      const parsed = extractJson(text);
      const normalized = normalize(parsed, data.description);
      log.debug("parsed", { subject: normalized.subject });
      return normalized;
    } catch (err) {
      log.warn("JSON parse failed; falling back to text extraction", err);
      const fallback = fallbackParse(text, data.description);
      log.debug("fallback subject", { subject: fallback.subject });
      return fallback;
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
