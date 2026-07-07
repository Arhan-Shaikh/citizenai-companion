import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_STAGES = [
  "Understanding your request…",
  "Searching relevant government guidance…",
  "Personalizing recommendations…",
  "Structuring your response…",
];

/**
 * Rotating AI progress indicator. Cycles through meaningful stages
 * instead of a generic spinner. Keeps last stage visible if the task
 * takes longer than the total sequence.
 */
export function ProgressiveLoader({
  stages = DEFAULT_STAGES,
  intervalMs = 1400,
  className,
  variant = "card",
}: {
  stages?: string[];
  intervalMs?: number;
  className?: string;
  variant?: "card" | "inline";
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => Math.min(i + 1, stages.length - 1));
    }, intervalMs);
    return () => clearInterval(t);
  }, [stages.length, intervalMs]);

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)} role="status" aria-live="polite">
        <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-primary" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="shimmer-text"
          >
            {stages[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-6",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4 animate-pulse" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="shimmer-text truncate text-sm font-medium"
            >
              {stages[idx]}
            </motion.p>
          </AnimatePresence>
          <div className="mt-3 flex gap-1">
            {stages.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full bg-muted transition-colors",
                  i <= idx && "bg-primary/70",
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Working on your request. Please wait.</span>
    </div>
  );
}

export const LOADING_STAGES = {
  schemes: [
    "Understanding your profile…",
    "Scanning central and state schemes…",
    "Checking eligibility rules…",
    "Ranking best matches for you…",
  ],
  complaints: [
    "Reading your issue…",
    "Identifying the responsible department…",
    "Drafting a professional complaint…",
    "Adding evidence and impact details…",
  ],
  documents: [
    "Looking up official requirements…",
    "Compiling fees and timelines…",
    "Collecting common mistakes to avoid…",
    "Finalizing your step-by-step guide…",
  ],
  assistant: [
    "Understanding your question…",
    "Consulting government guidance…",
    "Structuring a clear answer…",
    "Preparing next best actions…",
  ],
  translating: [
    "Reading original text…",
    "Preserving meaning and tone…",
    "Translating for you…",
  ],
};
