import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Loader2, Sparkles, ExternalLink, Bookmark, BookmarkCheck, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { NextBestAction } from "@/components/next-best-action";
import { useLanguage } from "@/components/language-provider";
import { recommendSchemes, type SchemeResult } from "@/lib/schemes.functions";
import { saved } from "@/lib/local-store";
import { cn, safeHttpUrl } from "@/lib/utils";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Scheme Recommender — Smart Bharat AI" },
      {
        name: "description",
        content:
          "Get personalized Government of India scheme recommendations with eligibility, benefits, documents, and application steps — powered by Gemini.",
      },
      { property: "og:title", content: "Scheme Recommender — Smart Bharat AI" },
      { property: "og:description", content: "AI-personalized central and state schemes for every citizen." },
    ],
  }),
  component: SchemesPage,
});

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const TAGS = ["Student", "Senior Citizen", "Farmer", "Disabled", "Woman-headed household", "Unemployed"];

function SchemesPage() {
  const { language } = useLanguage();
  const [form, setForm] = useState({
    age: 28,
    gender: "Female",
    state: "Maharashtra",
    occupation: "Small farmer",
    monthlyIncome: 12000,
    tags: [] as string[],
  });
  const [result, setResult] = useState<SchemeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedNames, setSavedNames] = useState<string[]>(() => saved.schemes.load().map((s) => s.scheme.name));

  const toggleTag = (t: string) =>
    setForm((f) => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await recommendSchemes({ data: { ...form, language } });
      setResult(res);
      if (res.schemes.length === 0) toast.info("No matching schemes — try adjusting your profile.");
    } catch (err) {
      toast.error("Could not fetch schemes", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const toggleSave = (scheme: SchemeResult["schemes"][number]) => {
    if (savedNames.includes(scheme.name)) {
      saved.schemes.remove(scheme.name);
      setSavedNames((s) => s.filter((n) => n !== scheme.name));
      toast.success("Removed from My Space");
    } else {
      saved.schemes.add(scheme);
      setSavedNames((s) => [scheme.name, ...s]);
      toast.success("Saved to My Space");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Feature</p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight sm:text-5xl">Scheme Recommender</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Tell us about you. Gemini scans central and state schemes and returns eligibility, benefits, documents and
          application steps.
        </p>
      </header>

      <form onSubmit={submit} className="grid gap-6 rounded-2xl border border-border/70 bg-card p-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={120}
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
            <SelectTrigger id="gender"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select value={form.state} onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}>
            <SelectTrigger id="state"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={form.occupation}
            onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
            placeholder="e.g. Small farmer, Teacher, Auto driver"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="income">Monthly income (INR)</Label>
          <Input
            id="income"
            type="number"
            min={0}
            value={form.monthlyIncome}
            onChange={(e) => setForm((f) => ({ ...f, monthlyIncome: Number(e.target.value) }))}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Special categories (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <label
                key={t}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  form.tags.includes(t) ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background",
                )}
              >
                <Checkbox
                  checked={form.tags.includes(t)}
                  onCheckedChange={() => toggleTag(t)}
                  aria-label={t}
                  className="h-4 w-4"
                />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" size="lg" disabled={busy} className="h-12 gap-2 rounded-xl px-6">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Finding schemes…" : "Recommend schemes"}
          </Button>
        </div>
      </form>

      {busy && <SkeletonList />}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h2 className="font-display text-2xl">{result.schemes.length} matching schemes</h2>
          </div>
          {result.schemes.map((s, i) => (
            <motion.article
              key={s.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.ministry}</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.whyEligible}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSave(s)}
                  aria-label={savedNames.includes(s.name) ? "Remove bookmark" : "Save scheme"}
                  className="min-h-11 min-w-11"
                >
                  {savedNames.includes(s.name) ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-5 grid gap-6 md:grid-cols-3">
                <Column title="Benefits" items={s.benefits} />
                <Column title="Documents" items={s.documents} />
                <Column title="Steps" items={s.steps} numbered />
              </div>
              {(() => {
                const safeLink = safeHttpUrl(s.officialLink);
                return safeLink ? (
                  <a
                    href={safeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Visit official portal <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null;
              })()}

            </motion.article>
          ))}
          <NextBestAction actions={result.nextActions} title="Continue your journey" />
        </div>
      )}

      {!result && !busy && (
        <div className="mt-10 rounded-2xl border border-dashed border-border/70 bg-secondary/30 p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Fill the form above and get personalized scheme recommendations in seconds.
          </p>
        </div>
      )}
    </div>
  );
}

function Column({ title, items, numbered }: { title: string; items: string[]; numbered?: boolean }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <ArrowRight className="h-3 w-3" /> {title}
      </h4>
      {numbered ? (
        <ol className="list-decimal space-y-1 pl-4 text-sm">
          {items.map((it, i) => <li key={i}>{it}</li>)}
        </ol>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="mt-8 space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border/70 bg-card p-6">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="mt-3 h-6 w-3/4 rounded bg-muted" />
          <div className="mt-2 h-4 w-full rounded bg-muted" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
