import { describe, expect, it } from "vitest";
import { LANGUAGES, langLabel, personaForLanguage, OFFICER_PERSONA } from "@/lib/prompt-templates";

describe("prompt-templates", () => {
  it("lists the 9 supported Indian languages", () => {
    expect(LANGUAGES.length).toBe(9);
    expect(LANGUAGES.map((l) => l.code)).toContain("hi");
    expect(LANGUAGES.map((l) => l.code)).toContain("en");
  });

  it("langLabel returns known labels and defaults to English", () => {
    expect(langLabel("hi")).toBe("Hindi");
    expect(langLabel("zz")).toBe("English");
  });

  it("personaForLanguage returns base persona for English", () => {
    expect(personaForLanguage("en")).toBe(OFFICER_PERSONA);
  });

  it("personaForLanguage appends a translation directive for other languages", () => {
    const p = personaForLanguage("hi");
    expect(p).toContain(OFFICER_PERSONA);
    expect(p).toContain("Hindi");
    expect(p.toLowerCase()).toContain("respond entirely in");
  });
});
