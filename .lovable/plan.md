# Smart Bharat AI — Final Plan (Judge-Optimized)

A premium AI-native civic companion where the Gemini-powered assistant is the connective tissue for every feature. Optimized end-to-end for Innovation, AI Usage, Code Quality, Security, Accessibility, Efficiency, Problem Alignment, Design, and Execution.

## Guiding principle: "AI-native, not AI-bolted-on"

Every feature routes through — or returns to — the AI Civic Companion. Every completed action ends with an AI-generated **Next Best Action** card carrying real CTAs, not dead-ends.

Cross-feature AI flow:

```text
Schemes result   ─┐
Complaint output ─┼─► AI generates a "Next Best Action" panel
Document guide   ─┘   (2-3 CTAs that jump into another feature
                       or continue the chat with pre-filled context)
```

Examples baked in:
- Schemes → "Generate application checklist" · "Draft cover letter to office" · "Ask the assistant about eligibility"
- Complaint → "Translate to Hindi/Marathi/…" · "Download as PDF/TXT" · "Get department contact guidance"
- Document → "Common mistakes" · "Estimated timeline" · "Preparation tips" · "Open in assistant to ask follow-ups"

Implementation: a shared `NextBestAction` component fed by each server function's `nextActions: { label, kind, payload }[]` (Gemini structured output). Clicking a CTA either calls another server fn with prefilled context, or opens `/assistant` seeded with a system + user turn.

## Scope (v1)

1. Landing page — hero, value prop, feature grid, "How it works", trust strip, footer
2. AI Civic Companion (`/assistant`) — streaming officer-style chat, structured 6-section responses, voice input (STT), spoken replies (browser TTS), 9-language switch, suggested prompt chips, per-message actions (copy, speak, translate, save), local thread persistence
3. Scheme Recommender (`/schemes`) — form → Gemini structured cards → NextBestAction
4. Complaint Generator (`/complaints`) — natural text → Gemini professional complaint (subject, category, dept, priority, body, evidence, impact) → NextBestAction (translate / download / guidance)
5. Document Assistant (`/documents`) — pick doc → Gemini checklist, fees, timeline, common mistakes, tips → NextBestAction
6. My Space (`/my-space`) — localStorage: saved schemes, complaints, checklists, chats; import/export JSON

Not in v1 (shown as "Roadmap" strip on landing, not empty routes): map-based issue reporter, Impact Score analytics, accounts/sync, dedicated language-simplifier page.

## AI response shape (structured, never a wall of text)

Every AI output — chat and feature — is rendered as a **StructuredResponse** with:
- Section headers with lucide icons (Summary, Steps, Documents, Warnings, Tips, Useful Links)
- Numbered step chips, doc pill list, warning callouts (`bg-destructive/10 border-l-4`)
- Inline **ActionCard** components for referenced schemes/docs/departments
- Sticky footer **NextBestAction** with 2-3 primary CTAs
- Copy / speak / translate buttons per section
- Skeleton loaders during stream; shimmer "Thinking…" state

Chat messages render the same StructuredResponse component when Gemini returns the tagged markdown format; free-form answers fall back to markdown but never plain paragraphs (system prompt enforces sections).

## Design direction — premium, minimal, distinctive

- Type: `@fontsource-variable/geist` (UI) + `@fontsource-variable/instrument-serif` (display accents on hero + section headings). Tight tracking, large sizes.
- Palette (oklch tokens):
  - Light: warm off-white background, near-black foreground, indigo primary, saffron accent, emerald success, rose destructive
  - Dark: deep charcoal-blue background, soft white foreground, lifted indigo, warm saffron accent
- Layered gradient mesh + subtle dot-grid utility behind hero and section dividers
- Glass nav bar with theme toggle + language switcher (persists to localStorage)
- Rounded-2xl surfaces, layered soft shadows via CSS vars, `hover-scale` on interactive cards, `fade-in` on route mount
- Motion via `motion` package: hero staggered entrance, message-in animation, action-card hover lift, success confetti on save (subtle)
- Custom saffron-indigo emblem logo (generated) — replaces any generic Sparkles usage

## Architecture

```text
src/
  routes/
    __root.tsx              # theme + language provider, HeadContent, layout shell
    index.tsx               # landing
    assistant.tsx           # AI Civic Companion chat
    schemes.tsx             # Scheme Recommender
    complaints.tsx          # Complaint Generator
    documents.tsx           # Document Assistant
    my-space.tsx            # local dashboard
    api/
      chat.ts               # streaming chat endpoint (AI SDK Gemini)
      transcribe.ts         # STT proxy (multipart → Lovable AI)
  lib/
    ai-gateway.server.ts    # Lovable AI Gateway provider + run-id helpers
    prompt-templates.ts     # officer persona, structured-output prompts, i18n
    schemes.functions.ts    # createServerFn: recommendSchemes
    complaints.functions.ts # createServerFn: generateComplaint, translateComplaint
    documents.functions.ts  # createServerFn: getDocumentGuide
    next-action.functions.ts# createServerFn: suggestNextActions (shared)
    local-store.ts          # typed localStorage: bookmarks, threads, history
    seed-assistant.ts       # helper to open /assistant with prefilled context
  components/
    ai-elements/*           # installed via ai-elements CLI
    site/                   # Nav, Footer, HeroMesh, FeatureCard, RoadmapStrip, TrustStrip
    structured/             # StructuredResponse, SectionBlock, ActionCard, NextBestAction, StepList, DocPillList, WarningCallout
    features/               # SchemeForm, SchemeResultCard, ComplaintComposer, ComplaintPreview, DocumentPicker, DocumentGuide
    chat/                   # ChatShell, MessageBubble (uses StructuredResponse), VoiceButton, SpeakButton, LanguageSelect, PromptChips
    theme-toggle.tsx
    language-provider.tsx
  styles.css                # tokens (light + dark), mesh/dot-grid utilities, motion-safe rules
```

## Model & AI usage

- Chat + generation: `google/gemini-3-flash-preview` (fast, multilingual, structured output friendly)
- STT: `openai/gpt-4o-mini-transcribe` via `/api/transcribe`
- TTS: browser `speechSynthesis` (zero latency, zero cost, respects language)
- Structured features use AI SDK `generateText` + `Output.object` with **small flat zod schemas** — length limits in the prompt, clamped in code, guarded with `NoObjectGeneratedError` fallback parse
- Every server fn returns `{ result, nextActions[] }` so UI can render the NextBestAction card without a second round trip
- Chat sends full running `messages[]` on each turn; language + persona injected via system prompt

## Judge-criterion mapping

| Criterion | How it's earned |
|---|---|
| Innovation | AI-native cross-feature flow, next-best-action loop, voice + spoken officer persona, structured response system |
| AI Usage | Gemini powers chat, recommendation, complaint drafting, doc guidance, translation, next-action inference, transcription |
| Code Quality | Typed server fns, zod schemas, shared components, no duplication, TS strict, ESLint clean, small files |
| Security | `LOVABLE_API_KEY` server-only, zod input validation on every server fn, no PII stored beyond user's own localStorage, safe markdown rendering (react-markdown, no dangerouslySetInnerHTML), env-based config |
| Accessibility | Semantic landmarks, keyboard nav, focus rings, aria-labels on all icon buttons, 44px hit targets, contrast-verified tokens, `prefers-reduced-motion`, screen-reader live region for streaming chat, alt text on all imagery |
| Efficiency | Streaming chat, single-round-trip feature calls (result + next actions), lazy route loading via TanStack, no unnecessary re-renders, image assets sized appropriately |
| Problem Alignment | Every feature maps to a real citizen pain point named in the brief; officer persona; 9 Indian languages; Indian doc types and departments |
| Design | Custom logo, unique type pairing, gradient mesh, dark/light, motion, no purple-on-white AI cliché |
| Execution | Polished loading skeletons, shimmer thinking, success toasts (`sonner`), inline error cards, empty states with CTAs, printable/downloadable outputs, README |

## Polish checklist (removes hackathon smell)

- Loading: skeletons on all feature results, shimmer text on chat, spinner-free
- Empty states: illustrated (svg) with primary CTA into the assistant
- Errors: friendly inline cards, retry button, credit/rate-limit messaging pulled from gateway status
- Success: toast + subtle animation + auto-generated Next Best Action panel
- Transitions: page fade-in, message stagger, card hover lift
- Copy: written in officer voice, no lorem ipsum, no "Lovable Generated Project" strings anywhere
- Responsiveness: grid + `min-w-0` + `shrink-0` header pattern; tested mental model at 375/768/1280
- SEO: unique title / description / og per route; JSON-LD for Government Service on landing; llms.txt in `public/`
- README with problem, solution, architecture, Gemini integration, prompt workflow, install, roadmap, license

## Security & privacy details

- Zod validation on every `createServerFn` input
- Server functions return typed errors; UI surfaces user-friendly copy
- Local-only storage with explicit "Clear my data" button in My Space
- No hardcoded secrets; `LOVABLE_API_KEY` provisioned via `lovable_api_key--create` before wiring
- Content Security: user text sanitized before rendering (react-markdown default escape)

## Dependencies to install

- `motion`, `@fontsource-variable/geist`, `@fontsource-variable/instrument-serif`, `react-markdown`, `remark-gfm`, `sonner`
- AI Elements: `bun x ai-elements@latest add conversation message prompt-input shimmer`

## Deliverable checklist

- [ ] Tokens, fonts, dark mode, mesh + dot-grid utilities in `src/styles.css`
- [ ] Nav (glass, language + theme), Footer, custom logo asset
- [ ] Landing: hero, feature grid, how-it-works, roadmap strip, trust strip
- [ ] AI Civic Companion with streaming, voice input, spoken replies, language switch, prompt chips, structured messages, per-message actions, local thread
- [ ] Scheme Recommender + NextBestAction
- [ ] Complaint Generator + NextBestAction (translate/download/guidance)
- [ ] Document Assistant + NextBestAction (mistakes/timeline/tips)
- [ ] My Space with import/export, clear-data, empty states
- [ ] Route-level SEO metadata, JSON-LD on landing, `public/llms.txt`
- [ ] README

Approve to build.
