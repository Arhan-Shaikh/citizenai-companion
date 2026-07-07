import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import { act } from "react";

function ThemeProbe() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} data-testid="probe">
      {theme}
    </button>
  );
}

function LangProbe() {
  const { language, setLanguage } = useLanguage();
  return (
    <button data-testid="lang" onClick={() => setLanguage("hi")}>
      {language}
    </button>
  );
}

describe("providers", () => {
  it("ThemeProvider exposes toggle that flips light/dark", () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    const btn = screen.getByTestId("probe");
    expect(btn.textContent).toBe("light");
    act(() => btn.click());
    expect(btn.textContent).toBe("dark");
  });

  it("LanguageProvider defaults to en and updates on setLanguage", () => {
    render(
      <LanguageProvider>
        <LangProbe />
      </LanguageProvider>,
    );
    const btn = screen.getByTestId("lang");
    expect(btn.textContent).toBe("en");
    act(() => btn.click());
    expect(btn.textContent).toBe("hi");
  });
});
