import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageSelect } from "@/components/language-select";
import { LanguageProvider } from "@/components/language-provider";

describe("LanguageSelect", () => {
  it("renders an accessible trigger with the current language", () => {
    render(
      <LanguageProvider>
        <LanguageSelect />
      </LanguageProvider>,
    );
    const trigger = screen.getByRole("combobox", { name: /choose language/i });
    expect(trigger).toBeInTheDocument();
    // Default language is English → native label "English"
    expect(trigger.textContent).toMatch(/English/);
  });
});
