import { describe, expect, it } from "vitest";
import { asClampedInt, asString, asStringArray, extractJson } from "@/lib/safe-json";

describe("safe-json", () => {
  describe("extractJson", () => {
    it("parses a plain JSON object", () => {
      expect(extractJson('{"a":1}')).toEqual({ a: 1 });
    });

    it("strips ```json fences", () => {
      expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    });

    it("strips prose before and after JSON", () => {
      expect(extractJson('Here you go: {"ok":true}. Thanks!')).toEqual({ ok: true });
    });

    it("repairs trailing commas", () => {
      expect(extractJson('{"a":1,}')).toEqual({ a: 1 });
    });

    it("balances mismatched trailing braces via repair pass", () => {
      // Outer terminator present but inner object is missing its closer.
      const result = extractJson('{"a":{"b":1}') as { a: { b: number } };
      expect(result.a.b).toBe(1);
    });

    it("throws when no JSON is present", () => {
      expect(() => extractJson("just prose here")).toThrow();
    });
  });

  describe("asString", () => {
    it("returns strings unchanged", () => {
      expect(asString("x")).toBe("x");
    });
    it("stringifies numbers and booleans", () => {
      expect(asString(3)).toBe("3");
      expect(asString(true)).toBe("true");
    });
    it("returns fallback for objects", () => {
      expect(asString({}, "fb")).toBe("fb");
      expect(asString(null, "fb")).toBe("fb");
    });
  });

  describe("asStringArray", () => {
    it("filters non-strings and empties", () => {
      expect(asStringArray(["a", "", "  ", null, 2])).toEqual(["a", "2"]);
    });
    it("returns [] for non-arrays", () => {
      expect(asStringArray("nope")).toEqual([]);
      expect(asStringArray(null)).toEqual([]);
    });
  });

  describe("asClampedInt", () => {
    it("clamps within bounds", () => {
      expect(asClampedInt(150, 0, 100, 50)).toBe(100);
      expect(asClampedInt(-1, 0, 100, 50)).toBe(0);
    });
    it("rounds and returns", () => {
      expect(asClampedInt(42.6, 0, 100, 0)).toBe(43);
    });
    it("falls back for NaN", () => {
      expect(asClampedInt("nope", 0, 100, 60)).toBe(60);
    });
  });
});
