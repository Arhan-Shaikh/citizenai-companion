# Smart Bharat AI

> Your Intelligent Civic Companion — Making Government of India services simple, smart and accessible for every citizen.

Built for the **PromptWars × Global Prompt Challenge**. Powered by **Google Gemini** via the Lovable AI Gateway.

---

## 🎯 Problem

Interacting with government services in India is time-consuming, opaque, and language-limited. Citizens waste days:

- Searching for schemes they qualify for across ~600 central and state programs
- Writing complaints in "proper" formal language for CPGRAMS and municipal portals
- Figuring out required documents, fees, and realistic timelines
- Translating official documents into their own language

## ✨ Solution

An **AI-native civic companion** — not a portal directory — where Google Gemini plays the role of an experienced government officer.

- **9 Indian languages** end-to-end (English, हिन्दी, मराठी, தமிழ், ગુજરાતી, বাংলা, తెలుగు, ಕನ್ನಡ, ਪੰਜਾਬੀ)
- **Voice input** via server-side transcription
- **Structured answers**, never a wall of text (Summary · Steps · Documents · Warnings · Tips · Links)
- **Next Best Action** after every response — the AI itself decides what the citizen should do next
- **Private by design** — all personal data stays in the browser (localStorage), nothing is sent to a server

## 🧩 Features

| Feature | What it does |
|---|---|
| AI Civic Companion | Streaming officer-style chat with voice + speak-back |
| Scheme Recommender | Personalized central + state schemes based on age, state, income, tags |
| Complaint Generator | Plain description → CPGRAMS-ready complaint with subject, category, department, priority, impact score |
| Document Assistant | Passport, Aadhaar, PAN, DL, Voter ID, Ration Card, Income/Birth/Caste certificates with fees, timeline, mistakes, tips |
| My Space | Private on-device dashboard with export/clear |

## 🏗 Architecture

```
Browser  ──►  TanStack Start server function / route  ──►  Lovable AI Gateway  ──►  Gemini 3 Flash Preview
                                                        └─►  OpenAI transcription model (STT)
```

- **Frontend**: TanStack Start (React 19), Tailwind CSS v4, shadcn/ui, motion, react-markdown
- **Backend**: TanStack `createServerFn` + `createFileRoute` server routes (Cloudflare Workers runtime)
- **AI**: `ai` SDK v7 with `@ai-sdk/openai-compatible` provider pointing at `https://ai.gateway.lovable.dev/v1`
- **Storage**: browser localStorage only — no database

### File map

```
src/
├── routes/
│   ├── __root.tsx           layout, providers, SEO
│   ├── index.tsx            landing page
│   ├── assistant.tsx        AI chat
│   ├── schemes.tsx          scheme recommender
│   ├── complaints.tsx       complaint generator
│   ├── documents.tsx        document assistant
│   ├── my-space.tsx         private dashboard
│   └── api/transcribe.ts    STT proxy
├── lib/
│   ├── ai-gateway.server.ts  Gemini provider wiring
│   ├── prompt-templates.ts   officer persona + language directives
│   ├── chat.functions.ts     askAssistant()
│   ├── schemes.functions.ts  recommendSchemes()
│   ├── complaints.functions.ts generateComplaint(), translateText()
│   ├── documents.functions.ts  getDocumentGuide()
│   └── local-store.ts        typed localStorage helpers
└── components/               design system + AI UI primitives
```

## 🤖 Gemini Integration & Prompt Workflow

Every AI call follows the same recipe:

1. **Persona** — a 25-year government officer prompt injected as system message. Refuses to invent scheme names, URLs, or ask for Aadhaar/OTP/passwords.
2. **Language pinning** — the persona is switched based on the user's chosen language; section headings translate too.
3. **Structured output** — feature endpoints use `generateObject` with narrow Zod schemas. Chat uses `generateText` with an enforced 6-section markdown format.
4. **Next Best Action** — every feature call returns 3 typed follow-up CTAs (`assistant`, `documents`, `schemes`, `complaints`, `translate`, `download`) that the UI wires into other features or a pre-seeded chat prompt.
5. **Guarded fallback** — `NoObjectGeneratedError` is caught and gracefully degrades instead of crashing.

## 🔐 Security

- `LOVABLE_API_KEY` is server-only, never exposed to the browser
- Every server function validates input with Zod
- No PII is stored server-side — all citizen data lives on-device
- Markdown is rendered via `react-markdown` with the default escape (no `dangerouslySetInnerHTML`)
- The assistant explicitly refuses to ask for Aadhaar numbers, OTPs, or passwords

## ♿ Accessibility

- Semantic landmarks (`<header>`, `<main>`, `<footer>`, `<nav>`)
- Skip-to-content link
- 44 × 44 minimum tap targets on all controls
- Focus-visible rings, keyboard nav, ARIA labels on all icon buttons
- `prefers-reduced-motion` respected
- Live region on the chat transcript
- WCAG-AA contrast tokens in both light and dark themes

## 🚀 Installation

```bash
bun install
bun dev            # start Vite dev server
bun test           # run the Vitest suite once
bun test:watch     # watch mode
bun run build      # production build
bun run lint       # ESLint
```

The `LOVABLE_API_KEY` environment variable is auto-provisioned by Lovable. To run outside Lovable, set it manually.

## 🧪 Testing

Unit and component tests are written with **Vitest** + **React Testing Library** and run in a `jsdom` environment. Setup lives in `src/test/setup.ts` and pulls in `@testing-library/jest-dom` matchers.

Current coverage focuses on the fragile bits: LLM JSON parsing/repair (`safe-json`), URL sanitization (`safeHttpUrl`), the officer persona template, on-device storage helpers, and the Theme/Language providers. Add new specs alongside their source as `*.test.ts` / `*.test.tsx`.

## 🗺 Future Scope

- Interactive civic issue map with department routing
- Impact Score analytics dashboard
- WhatsApp bot voice-first assistant
- Deep-links into DigiLocker, UMANG, Passport Seva, MyScheme

## 📄 License

MIT
