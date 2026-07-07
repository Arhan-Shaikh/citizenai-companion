/**
 * Shared utilities for extracting and normalizing JSON from LLM responses.
 * LLMs frequently wrap JSON in markdown fences, add commentary, or emit
 * slightly malformed JSON (trailing commas, unbalanced braces). These helpers
 * strip the noise and best-effort repair the payload.
 */

/**
 * Extract the first JSON object/array from a possibly noisy LLM response.
 * Attempts JSON.parse, then a repair pass (trailing commas, control chars,
 * unbalanced brace/bracket balancing) before giving up.
 *
 * @throws Error when no JSON structure can be located or repaired.
 */
export function extractJson(text: string): unknown {
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
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

/** Coerce an unknown value to a string, with a fallback for objects/null. */
export function asString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}

/** Coerce an unknown value to a filtered string array. */
export function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x : String(x ?? "")))
    .filter((s) => s.trim().length > 0);
}

/** Clamp a number-like value into [min, max]; falls back if not numeric. */
export function asClampedInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}
