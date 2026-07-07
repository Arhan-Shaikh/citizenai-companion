import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, MessageSquare, FileText, Sparkles, Languages, Download } from "lucide-react";
import { assistantSeed } from "@/lib/local-store";

type ActionKind = "assistant" | "documents" | "schemes" | "complaints" | "translate" | "download";
export type NextAction = { label: string; kind: string; payload: string };

const iconFor: Record<ActionKind, React.ComponentType<{ className?: string }>> = {
  assistant: MessageSquare,
  documents: FileText,
  schemes: Sparkles,
  complaints: FileText,
  translate: Languages,
  download: Download,
};

export function NextBestAction({
  actions,
  onCustom,
  title = "What next?",
}: {
  actions: NextAction[];
  onCustom?: (action: NextAction) => void;
  title?: string;
}) {
  const navigate = useNavigate();
  if (!actions?.length) return null;

  const handle = (a: NextAction) => {
    if (onCustom) {
      onCustom(a);
      return;
    }
    switch (a.kind) {
      case "assistant":
        assistantSeed.set(a.payload);
        navigate({ to: "/assistant" });
        break;
      case "documents":
        assistantSeed.set(`Help me understand the ${a.payload} document — requirements and steps.`);
        navigate({ to: "/documents" });
        break;
      case "schemes":
        navigate({ to: "/schemes" });
        break;
      case "complaints":
        assistantSeed.set(a.payload);
        navigate({ to: "/complaints" });
        break;
      default:
        break;
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">AI-suggested next steps</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {actions.map((a, i) => {
          const Icon = iconFor[a.kind as ActionKind] ?? ArrowRight;
          return (
            <button
              key={`${a.kind}-${a.label}-${a.payload}`}
              onClick={() => handle(a)}
              className="group flex min-h-14 items-start gap-3 rounded-xl border border-border/70 bg-card p-3 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-medium leading-snug">{a.label}</span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  Continue <ArrowRight className="h-3 w-3" />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
