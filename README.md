# 🇮🇳 Smart Bharat AI

> **India's AI-Powered Civic Companion**
>
> Making government services simple, accessible, multilingual, and intelligent using Google Gemini.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌍 Live Demo

🔗 **Application**
https://smartbharat-ai.lovable.app

📂 **GitHub Repository**
https://github.com/Arhan-Shaikh/citizenai-companion

---

# 📖 Overview

Smart Bharat AI is an AI-native civic assistant designed to simplify access to Government of India services.

Instead of forcing citizens to search across dozens of portals, understand complex eligibility rules, or draft formal complaints themselves, Smart Bharat AI acts like an experienced government officer who guides citizens from start to finish.

Powered by **Google Gemini**, it provides personalized recommendations, explains government documents, drafts professional complaints, and answers civic questions in multiple Indian languages.

---

# 🚨 Problem Statement

Millions of Indian citizens struggle with government services because:

- Government information is scattered across hundreds of websites.
- Eligibility rules are difficult to understand.
- Many citizens are not comfortable writing official complaints.
- Language barriers prevent access to information.
- Government documents are confusing.
- Citizens often don't know the next step after receiving information.

This results in wasted time, missed benefits, and poor accessibility.

---

# 💡 Our Solution

Smart Bharat AI combines conversational AI with structured government guidance.

Instead of only answering questions, the AI understands the user's situation and recommends the next best action.

Every response is designed to help citizens complete their task—not just read information.

---

# ✨ Key Features

## 🤖 AI Civic Companion

- Natural language conversations
- Voice input support
- AI-generated structured responses
- 9 Indian languages
- Next Best Action suggestions
- Streaming AI responses

---

## 🎯 Smart Scheme Recommendation

Personalized recommendations based on:

- Age
- Gender
- State
- Occupation
- Income
- Citizen category

Returns:

- Eligible schemes
- Benefits
- Required documents
- Application steps
- Official portal links

---

## 📝 Complaint Generator

Convert a simple description into a professional complaint.

Automatically generates:

- Complaint Title
- Department
- Priority
- Complaint Body
- Supporting Evidence Suggestions
- Impact Score
- Downloadable Draft

---

## 📑 Document Assistant

Provides complete guidance for documents like:

- Aadhaar Card
- Passport
- PAN Card
- Driving Licence
- Voter ID
- Birth Certificate
- Income Certificate
- Ration Card
- Caste Certificate

Each guide includes:

- Eligibility
- Required documents
- Fees
- Timeline
- Common mistakes
- Insider tips
- Official links

---

## 👤 My Space

A privacy-first dashboard that stores user information only inside the browser.

Features:

- Saved complaints
- Saved schemes
- Export data
- Clear data
- No cloud storage

---

# 🌐 Supported Languages

- English
- हिन्दी
- मराठी
- தமிழ்
- ગુજરાતી
- বাংলা
- తెలుగు
- ಕನ್ನಡ
- ਪੰਜਾਬੀ

---

# 🏗 Architecture

```
Citizen
      │
      ▼
React + TanStack Start
      │
      ▼
Server Functions
      │
      ▼
Lovable AI Gateway
      │
      ▼
Google Gemini
```

---

# 🛠 Technology Stack

## Frontend

- React 19
- TypeScript
- TanStack Start
- Tailwind CSS v4
- shadcn/ui
- Motion
- React Markdown

## Backend

- TanStack Server Functions
- Cloudflare Workers

## AI

- Google Gemini
- AI SDK v7
- Lovable AI Gateway

## Storage

- Browser Local Storage

---

# 🧠 AI Workflow

Every request follows the same pipeline:

1. User asks a question
2. AI detects user intent
3. Government officer persona is injected
4. Gemini generates structured output
5. Response is validated
6. Next Best Action is generated
7. User receives actionable guidance

---

# 🔒 Security

- API keys never exposed
- Zod validation on every request
- Server-side AI calls only
- No Aadhaar or OTP collection
- No server-side personal storage
- Safe Markdown rendering
- Graceful AI fallback handling

---

# ♿ Accessibility

- WCAG-AA color contrast
- Keyboard navigation
- Skip-to-content support
- Screen reader friendly
- ARIA labels
- Responsive mobile layout
- Dark mode
- Reduced motion support

---

# 🧪 Testing

Built with:

- Vitest
- React Testing Library
- jsdom

Tests cover:

- JSON parsing
- URL validation
- Theme provider
- Language provider
- Local storage
- Prompt templates
- Utility functions

---

# 📂 Project Structure

```
src
│
├── routes
├── components
├── hooks
├── lib
├── providers
├── test
└── styles
```

---

# 🚀 Installation

```bash
bun install       # install dependencies
bun run dev       # start the dev server on http://localhost:8080
bun run test      # run the Vitest suite
bun run lint      # run ESLint
bun run build     # production build
```

# 🔐 Environment Variables

Secrets live in the Lovable Cloud secret store, never in a committed `.env`.

| Name              | Where set              | Purpose                                    |
| ----------------- | ---------------------- | ------------------------------------------ |
| `LOVABLE_API_KEY` | Lovable Cloud (server) | Auth for the Lovable AI Gateway (Gemini)   |

Nothing sensitive is ever exposed to the browser bundle — all AI calls run
inside TanStack server functions on Cloudflare Workers.

# 🧪 Running Tests

```bash
bun run test          # single run
bun run test:watch    # watch mode
bunx vitest run --coverage   # with coverage (v8)
```

# 🚢 Deployment

The project is a TanStack Start app targeting Cloudflare Workers via Nitro.
On Lovable, pushing to `main` publishes to
[smartbharat-ai.lovable.app](https://smartbharat-ai.lovable.app). For
self-hosting, run `bun run build` and deploy the `.output` directory to any
Workers-compatible edge runtime.




# 🌱 Future Scope

- DigiLocker Integration
- UMANG Integration
- WhatsApp AI Assistant
- Voice-first Interface
- AI Analytics Dashboard
- Department Auto Routing
- Smart Civic Map
- Real-time Complaint Tracking

---

# 🏆 Built For

**PromptWars × Global Prompt Challenge**

Theme:

**AI-Powered Civic Companion**

---

# 👨‍💻 Developer

**Arhan Shaikh**

BCA (Information Technology)

Cybersecurity & AI Enthusiast

GitHub:
https://github.com/Arhan-Shaikh

LinkedIn:
https://www.linkedin.com/in/arhan-shaikh-191528f/

---

---

# 📸 Screenshots

Add screenshots here:

- Home Page
- AI Assistant
- Scheme Recommendation
- Complaint Generator
- Document Assistant
- Mobile View

---
<img width="451" height="881" alt="ss3" src="https://github.com/user-attachments/assets/d6668f10-32fe-45bd-89dc-2d5ce9bd5d80" />
<img width="497" height="882" alt="ss1" src="https://github.com/user-attachments/assets/5b2e9513-4626-4223-8ceb-9e49e26926e4" />
<img width="468" height="875" alt="ss2" src="https://github.com/user-attachments/assets/b16f8611-9993-455c-a8cc-4f4c8b5f1e17" />
<img width="477" height="876" alt="ss4" src="https://github.com/user-attachments/assets/9d075bc5-b516-42c9-9987-c527ead8fabf" />
# 📄 License

MIT License
