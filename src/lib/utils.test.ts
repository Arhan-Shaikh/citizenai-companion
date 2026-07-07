import { describe, expect, it } from "vitest";
import { cn, safeHttpUrl } from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind classes and drops falsy values", () => {
    expect(cn("p-2", false && "hidden", "p-4")).toBe("p-4");
  });
  it("joins conditional class arrays", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toContain("c");
  });
});

describe("safeHttpUrl", () => {
  it("accepts https and http", () => {
    expect(safeHttpUrl("https://india.gov.in/")).toMatch(/^https:\/\//);
    expect(safeHttpUrl("http://example.org")).toMatch(/^http:\/\//);
  });
  it("rejects javascript: and data:", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,<script>")).toBeNull();
  });
  it("rejects malformed and non-string inputs", () => {
    expect(safeHttpUrl("not a url")).toBeNull();
    expect(safeHttpUrl(undefined)).toBeNull();
    expect(safeHttpUrl(42)).toBeNull();
  });
  it("trims whitespace and normalizes", () => {
    expect(safeHttpUrl("  https://x.io  ")).toBe("https://x.io/");
  });
});
