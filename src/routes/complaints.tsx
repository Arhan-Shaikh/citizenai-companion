import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Loader2,
  AlertTriangle,
  FileText,
  Copy,
  Download,
  Bookmark,
  Languages,
  MapPin,
  Gauge,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NextBestAction, type NextAction } from "@/components/next-best-action";
import { ProgressiveLoader, LOADING_STAGES } from "@/components/progressive-loader";
import { useLanguage } from "@/components/language-provider";
import { generateComplaint, translateText, type ComplaintResult } from "@/lib/complaints.functions";
import { saved, assistantSeed } from "@/lib/local-store";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Complaint Generator — Smart Bharat AI" },
      {
        name: "description",
        content:
          "Describe a civic issue in plain words. Get a CPGRAMS-ready professional complaint with subject, department, priority and impact — in seconds.",
      },
      { property: "og:title", content: "Complaint Generator — Smart Bharat AI" },
      {
        property: "og:description",
        content:
          "AI-drafted civic complaints for India, ready for CPGRAMS and municipal grievance portals.",
      },
    ],
  }),
  component: ComplaintsPage,
});

const EXAMPLES = [
  "The streetlight outside my building on MG Road has been broken for 3 weeks. It's unsafe at night.",
  "Garbage is not being collected in our locality for 5 days. Bad smell and stray dogs everywhere.",
  "The road near the school has huge potholes. A child fell down last week.",
];

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-primary/10 text-primary",
  High: "bg-warning/20 text-warning-foreground",
  Critical: "bg-destructive/15 text-destructive",
};

function ComplaintsPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<ComplaintResult | null>(null);
  const [editedBody, setEditedBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [translating, setTranslating] = useState(false);

  // Consume seed from Next Best Action
  useEffect(() => {
    const seed = assistantSeed.consume();
    if (seed) setDescription(seed);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await generateComplaint({
        data: { description, location: location || undefined, language },
      });
      setResult(res);
      setEditedBody(res.body);
    } catch (err) {
      toast.error("Could not draft complaint", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const download = (format: "txt") => {
    if (!result) return;
    const content = `Subject: ${result.subject}\nCategory: ${result.category}\nDepartment: ${result.department}\nPriority: ${result.priority}\n\n${editedBody}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaint-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  const handleNext = async (a: NextAction) => {
    if (!result) return;
    if (a.kind === "translate") {
      setTranslating(true);
      try {
        const { text } = await translateText({
          data: { text: editedBody, targetLanguage: a.payload },
        });
        setEditedBody(text);
        toast.success(`Translated to ${a.payload}`);
      } catch (err) {
        toast.error("Translation failed", { description: err instanceof Error ? err.message : "" });
      } finally {
        setTranslating(false);
      }
    } else if (a.kind === "download") {
      download("txt");
    } else if (a.kind === "assistant") {
      assistantSeed.set(a.payload);
      navigate({ to: "/assistant" });
    }
  };

  const saveComplaint = () => {
    if (!result) return;
    saved.complaints.add({ ...result, body: editedBody }, description);
    toast.success("Saved to My Space");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Feature</p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Complaint Generator
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Describe the issue naturally. Gemini structures it into a professional civic complaint
          ready for CPGRAMS or your municipal portal.
        </p>
      </header>

      <form onSubmit={submit} className="rounded-2xl border border-border/70 bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="desc">What's the issue?</Label>
          <Textarea
            id="desc"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe in your own words. Include what, where, when and impact."
            required
            className="text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setDescription(ex)}
                className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                Try: "{ex.slice(0, 40)}…"
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          <Label htmlFor="location">Location (optional)</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Area, city, landmark"
          />
        </div>
        <div className="mt-6">
          <Button
            type="submit"
            size="lg"
            disabled={busy || !description.trim()}
            className="h-12 gap-2 rounded-xl px-6"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {busy ? "Drafting…" : "Draft professional complaint"}
          </Button>
        </div>
      </form>

      {busy && <ProgressiveLoader stages={LOADING_STAGES.complaints} className="mt-8" />}

      {result && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
        >
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {result.category}
                </p>
                <h2 className="mt-1 text-xl font-semibold leading-tight">{result.subject}</h2>
                <p className="mt-1 text-sm text-muted-foreground">To: {result.department}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                  PRIORITY_COLORS[result.priority] ?? PRIORITY_COLORS.Medium,
                )}
              >
                {result.priority} priority
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MetricCard icon={Gauge} label="Impact Score" value={`${result.impactScore}/100`} />
              <MetricCard
                icon={Users}
                label="Affected citizens"
                value={result.affectedCitizensEstimate}
              />
              <MetricCard icon={MapPin} label="Expected outcome" value={result.expectedImpact} />
            </div>

            <div className="mt-6">
              <Label htmlFor="body" className="mb-2 flex items-center justify-between">
                <span>Complaint body (editable)</span>
                {translating && <span className="text-xs text-muted-foreground">Translating…</span>}
              </Label>
              <Textarea
                id="body"
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={12}
                className="font-mono text-sm leading-relaxed"
              />
            </div>

            {result.suggestedEvidence.length > 0 && (
              <div className="mt-5 rounded-xl border border-warning/30 bg-warning/5 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning-foreground">
                  <AlertTriangle className="h-4 w-4" /> Suggested evidence to attach
                </h3>
                <ul className="ml-6 list-disc space-y-1 text-sm">
                  {result.suggestedEvidence.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(editedBody);
                  toast.success("Copied");
                }}
                className="gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => download("txt")}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Download .txt
              </Button>
              <Button variant="outline" size="sm" onClick={saveComplaint} className="gap-1.5">
                <Bookmark className="h-3.5 w-3.5" /> Save
              </Button>
              <div className="ml-auto text-xs text-muted-foreground">
                <Languages className="mr-1 inline h-3 w-3" />
                Use Next Best Action below to translate
              </div>
            </div>
          </div>

          <NextBestAction
            actions={result.nextActions}
            onCustom={handleNext}
            title="Continue your complaint"
          />
        </motion.section>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 line-clamp-2 text-sm font-medium">{value}</p>
    </div>
  );
}
