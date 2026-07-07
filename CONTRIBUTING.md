# Contributing to Smart Bharat AI

Thanks for your interest in improving Smart Bharat AI! This document explains
how to propose changes.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies with `bun install` (or `npm install`).
3. Start the dev server with `bun run dev`.
4. Run the test suite with `bun run test`.

## Development workflow

- Create a topic branch off `main`.
- Keep pull requests focused; one logical change per PR.
- Follow the existing code style — Prettier and ESLint are configured.
- Add or update tests for any behavioural change under `src/**/*.test.ts(x)`.
- Do not commit secrets. `LOVABLE_API_KEY` and other credentials live in the
  Lovable Cloud secret store, never in source.

## Required checks before opening a PR

```bash
bun run lint      # ESLint
bun run test      # Vitest suite
bun run build     # Production build
```

All three must pass.

## Commit messages

Use short, imperative commit messages: `fix: handle malformed JSON from gateway`,
`feat: add complaint translation action`, etc.

## Reporting bugs

Open a GitHub issue with:

- What you expected to happen
- What actually happened
- Steps to reproduce (device, browser, route)
- Console/network errors if any

## Code of conduct

Be respectful. Assume good intent. Keep discussions technical.
