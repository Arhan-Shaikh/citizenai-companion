import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, Download, FileText, MessageSquare, Sparkles, Trash2, Upload, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clearAllData,
  exportAllData,
  saved,
  type SavedComplaint,
  type SavedDocument,
  type SavedNote,
  type SavedScheme,
} from "@/lib/local-store";

export const Route = createFileRoute("/my-space")({
  head: () => ({
    meta: [
      { title: "My Space — Smart Bharat AI" },
      {
        name: "description",
        content:
          "Your private civic space. Saved schemes, drafted complaints, document checklists — all stored in your browser.",
      },
      { property: "og:title", content: "My Space — Smart Bharat AI" },
      { property: "og:description", content: "Your private, on-device civic dashboard." },
    ],
  }),
  component: MySpacePage,
});

function MySpacePage() {
  const [schemes, setSchemes] = useState<SavedScheme[]>([]);
  const [complaints, setComplaints] = useState<SavedComplaint[]>([]);
  const [docs, setDocs] = useState<SavedDocument[]>([]);

  const refresh = () => {
    setSchemes(saved.schemes.load());
    setComplaints(saved.complaints.load());
    setDocs(saved.documents.load());
  };

  useEffect(refresh, []);

  const totalItems = schemes.length + complaints.length + docs.length;

  const exportJson = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smart-bharat-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  const clearAll = () => {
    if (!confirm("Delete all saved schemes, complaints, documents and the assistant thread? This cannot be undone.")) return;
    clearAllData();
    refresh();
    toast.success("All data cleared");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Your data</p>
          <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight sm:text-5xl">My Space</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Private, on-device. Nothing leaves your browser unless you export it.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={exportJson} disabled={totalItems === 0} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={totalItems === 0} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </Button>
        </div>
      </header>

      {totalItems === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          {schemes.length > 0 && (
            <Section title="Saved schemes" count={schemes.length} icon={Sparkles}>
              <div className="grid gap-3 md:grid-cols-2">
                {schemes.map((s) => (
                  <article key={s.scheme.name} className="rounded-2xl border border-border/70 bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.scheme.ministry}</p>
                    <h3 className="mt-1 truncate text-base font-semibold">{s.scheme.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.scheme.whyEligible}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.savedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          saved.schemes.remove(s.scheme.name);
                          refresh();
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${s.scheme.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </Section>
          )}

          {complaints.length > 0 && (
            <Section title="Saved complaints" count={complaints.length} icon={FileText}>
              <div className="space-y-3">
                {complaints.map((c) => (
                  <article key={c.savedAt} className="rounded-2xl border border-border/70 bg-card p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {c.complaint.category} · {c.complaint.priority}
                        </p>
                        <h3 className="mt-1 truncate text-base font-semibold">{c.complaint.subject}</h3>
                        <p className="mt-1 truncate text-sm text-muted-foreground">To: {c.complaint.department}</p>
                      </div>
                      <button
                        onClick={() => {
                          saved.complaints.remove(c.savedAt);
                          refresh();
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer text-primary">View complaint</summary>
                      <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">
                        {c.complaint.body}
                      </pre>
                    </details>
                  </article>
                ))}
              </div>
            </Section>
          )}

          {docs.length > 0 && (
            <Section title="Saved document guides" count={docs.length} icon={FileText}>
              <div className="grid gap-3 md:grid-cols-2">
                {docs.map((d) => (
                  <article key={d.documentType} className="rounded-2xl border border-border/70 bg-card p-4">
                    <h3 className="text-base font-semibold">{d.documentType}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.guide.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>⏱ {d.guide.timeline}</span>
                      <span>₹ {d.guide.fees}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(d.savedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          saved.documents.remove(d.documentType);
                          refresh();
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  icon: Icon,
  children,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl">
        <Icon className="h-5 w-5 text-primary" /> {title}
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 bg-secondary/30 p-10 text-center">
      <Bookmark className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 font-display text-2xl">Nothing saved yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Save schemes, draft complaints, and download document checklists. Everything stays private on your device.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild size="sm" className="gap-1.5">
          <Link to="/assistant">
            <MessageSquare className="h-3.5 w-3.5" /> Talk to assistant
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link to="/schemes">
            <Sparkles className="h-3.5 w-3.5" /> Find schemes
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link to="/documents">
            <Download className="h-3.5 w-3.5" /> Get doc guides
          </Link>
        </Button>
      </div>
    </div>
  );
}
