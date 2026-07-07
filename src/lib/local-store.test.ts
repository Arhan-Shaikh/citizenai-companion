import { describe, expect, it, beforeEach } from "vitest";
import { prefs, saved, clearAllData, thread, exportAllData } from "@/lib/local-store";

describe("local-store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("prefs.language defaults to en and persists", () => {
    expect(prefs.language.load()).toBe("en");
    prefs.language.save("hi");
    expect(prefs.language.load()).toBe("hi");
  });

  it("prefs.theme defaults to light and round-trips dark", () => {
    expect(prefs.theme.load()).toBe("light");
    prefs.theme.save("dark");
    expect(prefs.theme.load()).toBe("dark");
  });

  it("saved.schemes dedupes by name", () => {
    const scheme = {
      name: "PM-KISAN",
      ministry: "MoA",
      whyEligible: "farmer",
      benefits: [],
      documents: [],
      steps: [],
      officialLink: null,
    };
    saved.schemes.add(scheme);
    saved.schemes.add(scheme);
    expect(saved.schemes.load()).toHaveLength(1);
    saved.schemes.remove("PM-KISAN");
    expect(saved.schemes.load()).toHaveLength(0);
  });

  it("thread.save trims to the last 40 messages", () => {
    const msgs = Array.from({ length: 60 }, (_, i) => ({
      role: "user" as const,
      content: `m${i}`,
    }));
    thread.save(msgs);
    const loaded = thread.load();
    expect(loaded).toHaveLength(40);
    expect(loaded[0].content).toBe("m20");
  });

  it("clearAllData wipes every namespaced key", () => {
    prefs.language.save("hi");
    prefs.theme.save("dark");
    clearAllData();
    expect(prefs.language.load()).toBe("en");
    expect(prefs.theme.load()).toBe("light");
  });

  it("exportAllData returns valid JSON with expected shape", () => {
    const raw = exportAllData();
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveProperty("thread");
    expect(parsed).toHaveProperty("schemes");
    expect(parsed).toHaveProperty("complaints");
    expect(parsed).toHaveProperty("documents");
    expect(parsed).toHaveProperty("exportedAt");
  });
});
