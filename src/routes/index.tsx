import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Landmark,
  MessageSquare,
  Languages,
  ShieldCheck,
  Bookmark,
  Mic,
  MapPin,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Civic Companion",
    body: "Chat with a virtual government officer. Structured answers with steps, documents, warnings and tips — never a wall of text.",
    to: "/assistant" as const,
    tag: "Powered by Gemini",
  },
  {
    icon: Sparkles,
    title: "Scheme Recommender",
    body: "Answer 6 questions. Get personalized central and state schemes with eligibility, benefits and application steps.",
    to: "/schemes" as const,
    tag: "Personalized",
  },
  {
    icon: FileText,
    title: "Complaint Generator",
    body: "Describe an issue in plain words. Get a CPGRAMS-ready professional complaint with subject, department and priority.",
    to: "/complaints" as const,
    tag: "One-tap",
  },
  {
    icon: Landmark,
    title: "Document Assistant",
    body: "Choose a document. Get required proofs, fees, realistic timeline, common mistakes and insider tips.",
    to: "/documents" as const,
    tag: "Passport, Aadhaar, PAN…",
  },
  {
    icon: Bookmark,
    title: "My Space",
    body: "Bookmark schemes, save complaints, download document checklists. All stored privately in your browser.",
    to: "/my-space" as const,
    tag: "Private by design",
  },
  {
    icon: Languages,
    title: "9 Indian languages",
    body: "Switch instantly between English, Hindi, Marathi, Tamil, Gujarati, Bengali, Telugu, Kannada and Punjabi.",
    to: "/assistant" as const,
    tag: "Inclusive",
  },
];

function Landing() {
  return (
    <div className="relative">
      <Hero />
      <TrustStrip />
      <FeatureGrid />
      <HowItWorks />
      <Roadmap />
      <FinalCTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-70" aria-hidden />
      <div className="absolute inset-0 dot-grid opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 md:pb-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-soft backdrop-blur">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3" />
            </span>
            <span>Powered by Google Gemini</span>
            <span className="text-border">·</span>
            <span>Global Prompt Challenge</span>
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Your AI <span className="text-primary">Government</span> Companion
            <span className="text-accent">.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Access government services, report issues, discover schemes, understand documents and receive AI-powered
            guidance in seconds — in nine Indian languages.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 min-w-[180px] rounded-xl px-6 text-base shadow-lift">
              <Link to="/assistant">
                Try AI Assistant
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-xl px-6 text-base">
              <Link to="/schemes">Explore Services</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-lift backdrop-blur sm:p-8">
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <img src={logo} alt="" width={20} height={20} className="h-5 w-5" />
              <span className="font-medium text-foreground">Smart Bharat AI</span>
              <span>·</span>
              <span className="shimmer-text">Thinking…</span>
            </div>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">You: "How do I apply for a passport?"</p>
              <div className="rounded-xl border border-border/60 bg-background p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Summary
                </h3>
                <p className="text-muted-foreground">
                  Apply online at Passport Seva, book an appointment at your nearest PSK, and carry originals of address
                  and identity proof.
                </p>
                <h3 className="mb-2 mt-4 flex items-center gap-2 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Steps
                </h3>
                <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                  <li>Register on passportindia.gov.in</li>
                  <li>Fill Form 1 and pay fees online</li>
                  <li>Book appointment at your nearest PSK</li>
                </ol>
              </div>
              <div className="flex flex-wrap gap-2">
                <NextChip icon={FileText} label="Get document checklist" />
                <NextChip icon={Languages} label="Translate to Hindi" />
                <NextChip icon={MessageSquare} label="What if my address differs?" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function NextChip({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-foreground">
      <Icon className="h-3 w-3 text-primary" />
      {label}
    </span>
  );
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, label: "Privacy first — data stays on your device" },
    { icon: Mic, label: "Voice input in 9 languages" },
    { icon: Sparkles, label: "Structured answers, always" },
    { icon: MapPin, label: "Real Indian ministries & portals" },
  ];
  return (
    <section className="border-y border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex min-w-0 items-center gap-2.5 text-xs text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">The platform</p>
        <h2 className="mt-2 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Everything a citizen needs, connected by AI.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Each feature ends with an AI-generated <em>Next Best Action</em>, so you never hit a dead-end.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          >
            <Link
              to={f.to}
              className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift"
            >
              <span className="mb-4 inline-grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{f.tag}</span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Ask in your language", body: "Type or speak. Nine Indian languages supported end-to-end." },
    { n: "02", title: "Gemini structures the answer", body: "Summary, Steps, Documents, Warnings, Tips, Links — never a paragraph dump." },
    { n: "03", title: "Take the next best action", body: "Every response ends with real CTAs into other features." },
  ];
  return (
    <section className="relative border-y border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-2 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            AI-native, not AI-bolted-on.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border/70 bg-card p-6">
              <div className="font-display text-4xl text-primary">{s.n}</div>
              <h3 className="mt-3 text-base font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  const items = ["Interactive civic issue map", "Impact Score analytics", "Voice-first assistant on WhatsApp", "State-specific scheme deep-links"];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-8 sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Roadmap</p>
        <h2 className="mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl">Coming next.</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <li key={it} className="flex items-center gap-3 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-24 pt-4 text-center sm:px-6">
      <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
        Government services, made human.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
        24/7. Multilingual. Structured. Free. Built with Google Gemini for every citizen of India.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base shadow-lift">
          <Link to="/assistant">Start talking to the assistant</Link>
        </Button>
      </div>
    </section>
  );
}
