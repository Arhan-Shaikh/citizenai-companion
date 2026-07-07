import { describe, expect, it } from "vitest";
import { asClampedInt, asString, asStringArray, extractJson } from "@/lib/safe-json";

describe("safe-json edge cases", () => {
  it("parses arrays wrapped in fences", () => {
    expect(extractJson("```json\n[1,2,3]\n```")).toEqual([1, 2, 3]);
  });

  it("handles nested objects with trailing commas", () => {
    const parsed = extractJson('{"a":{"b":[1,2,],},}') as { a: { b: number[] } };
    expect(parsed.a.b).toEqual([1, 2]);
  });

  it("strips control characters", () => {
    const parsed = extractJson('{"a":"b\u0001c"}') as { a: string };
    expect(parsed.a).toBe("bc");
  });

  it("asString coerces null and undefined to fallback", () => {
    expect(asString(null)).toBe("");
    expect(asString(undefined, "x")).toBe("x");
  });

  it("asStringArray trims blank-only entries", () => {
    expect(asStringArray(["\t", "  a "])).toEqual(["  a "]);
  });

  it("asClampedInt handles numeric strings", () => {
    expect(asClampedInt("42", 0, 100, 0)).toBe(42);
    expect(asClampedInt("nope", 0, 100, 7)).toBe(7);
  });
});
