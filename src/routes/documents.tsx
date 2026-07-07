import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2, FileText, AlertTriangle, Lightbulb, ExternalLink, Bookmark, CheckCircle2,
  Clock, IndianRupee, Landmark, ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NextBestAction } from "@/components/next-best-action";
import { ProgressiveLoader, LOADING_STAGES } from "@/components/progressive-loader";
import { useLanguage } from "@/components/language-provider";
import { getDocumentGuide, type DocumentGuide } from "@/lib/documents.functions";
import { saved, assistantSeed } from "@/lib/local-store";
import { safeHttpUrl } from "@/lib/utils";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Document Assistant — Smart Bharat AI" },
      {
        name: "description",
        content:
          "Get required documents, fees, timelines, common mistakes and insider tips for Passport, Aadhaar, PAN, Driving License and more — powered by Gemini.",
      },
      { property: "og:title", content: "Document Assistant — Smart Bharat AI" },
      {
        property: "og:description",
        content: "Complete guides for Indian government documents with checklists and pitfalls.",
      },
    ],
  }),
  component: DocumentsPage,
});

const DOCS = [
  { name: "Aadhaar Card", subtitle: "UIDAI" },
  { name: "PAN Card", subtitle: "Income Tax Dept." },
  { name: "Passport", subtitle: "Passport Seva" },
  { name: "Driving License", subtitle: "RTO / Parivahan" },
  { name: "Voter ID (EPIC)", subtitle: "ECI" },
  { name: "Ration Card", subtitle: "State PDS" },
  { name: "Income Certificate", subtitle: "State Revenue" },
  { name: "Birth Certificate", subtitle: "Municipal / CRS" },
  { name: "Caste Certificate", subtitle: "State Social Welfare" },
];

function DocumentsPage() {
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [guide, setGuide] = useState<DocumentGuide | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const seed = assistantSeed.consume();
    if (seed) setCustom(seed);
  }, []);

  const fetchGuide = async (doc: string) => {
    setSelected(doc);
    setBusy(true);
    setGuide(null);
    try {
      const res = await getDocumentGuide({ data: { documentType: doc, language } });
      setGuide(res);
    } catch (err) {
      toast.error("Could not fetch guide", { description: err instanceof Error ? err.message : "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Feature</p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight sm:text-5xl">Document Assistant</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick a document. Gemini returns eligibility, required proofs, fees, realistic timeline, common mistakes and
          insider tips — plus what to do next.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOCS.map((d) => (
          <button
            key={d.name}
            type="button"
            onClick={() => fetchGuide(d.name)}
            className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors hover:border-primary/40 ${
              selected === d.name ? "border-primary bg-primary/5" : "border-border/70 bg-card"
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{d.name}</p>
              <p className="truncate text-xs text-muted-foreground">{d.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) fetchGuide(custom.trim());
        }}
        className="mt-4 flex flex-wrap gap-2"
      >
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or type any other document (e.g. GST Registration)"
          className="flex-1 min-w-[200px]"
        />
        <Button type="submit" variant="outline" disabled={!custom.trim() || busy}>Get guide</Button>
      </form>

      {busy && <ProgressiveLoader stages={LOADING_STAGES.documents} className="mt-8" />}

      {guide && !busy && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold tracking-tight">{selected}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{guide.summary}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  saved.documents.add(selected!, guide);
                  toast.success("Saved to My Space");
                }}
                aria-label="Save guide"
                className="min-h-11 min-w-11"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MetricCard icon={Clock} label="Timeline" value={guide.timeline} />
              <MetricCard icon={IndianRupee} label="Fees" value={guide.fees} />
              <MetricCard
                icon={Landmark}
                label="Official portal"
                value={safeHttpUrl(guide.officialPortal) ?? "Not confirmed"}
                link={safeHttpUrl(guide.officialPortal) ?? undefined}
              />

            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Block icon={CheckCircle2} title="Eligibility" items={guide.eligibility} tone="success" />
              <Block icon={ScrollText} title="Required documents" items={guide.requiredDocuments} />
              <Block icon={ScrollText} title="Application steps" items={guide.applicationSteps} numbered />
              <Block icon={AlertTriangle} title="Common mistakes" items={guide.commonMistakes} tone="warning" />
              <Block icon={Lightbulb} title="Insider tips" items={guide.tips} tone="accent" />
            </div>
          </div>

          <NextBestAction actions={guide.nextActions} title="Next best action" />
        </motion.section>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  link,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  link?: string;
}) {
  const body = (
    <>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 line-clamp-2 text-sm font-medium">{value}</p>
    </>
  );
  return link ? (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border/60 bg-background p-3 transition-colors hover:border-primary/40"
    >
      {body}
      <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
        Open <ExternalLink className="h-3 w-3" />
      </span>
    </a>
  ) : (
    <div className="rounded-xl border border-border/60 bg-background p-3">{body}</div>
  );
}

function Block({
  icon: Icon,
  title,
  items,
  numbered,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  numbered?: boolean;
  tone?: "default" | "success" | "warning" | "accent";
}) {
  if (!items?.length) return null;
  const toneClass = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning-foreground",
    accent: "text-accent-foreground",
  }[tone];
  return (
    <div>
      <h3 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${toneClass}`}>
        <Icon className="h-4 w-4" /> {title}
      </h3>
      {numbered ? (
        <ol className="list-decimal space-y-1 pl-5 text-sm">{items.map((it, i) => <li key={i}>{it}</li>)}</ol>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
