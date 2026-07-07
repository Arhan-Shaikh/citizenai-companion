import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "@/components/markdown";

describe("Markdown", () => {
  it("renders headings and paragraphs", () => {
    render(<Markdown>{"# Title\n\nHello **world**"}</Markdown>);
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("world").tagName.toLowerCase()).toBe("strong");
  });

  it("opens external links safely in a new tab", () => {
    render(<Markdown>{"[gov](https://india.gov.in)"}</Markdown>);
    const link = screen.getByRole("link", { name: "gov" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("href", "https://india.gov.in");
  });

  it("does not execute raw HTML inside markdown", () => {
    const { container } = render(<Markdown>{"<img src=x onerror=alert(1) />\n\ntext"}</Markdown>);
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders GFM task lists / tables via remark-gfm", () => {
    render(<Markdown>{"| a | b |\n|---|---|\n| 1 | 2 |"}</Markdown>);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
