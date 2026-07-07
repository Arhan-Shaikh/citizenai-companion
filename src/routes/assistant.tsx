import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  Loader2, Mic, MicOff, Send, Sparkles, Trash2, Volume2, Copy, User,
  Languages, FileText, Landmark, MessageSquarePlus, Bookmark,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/markdown";
import { ProgressiveLoader, LOADING_STAGES } from "@/components/progressive-loader";
import { useLanguage } from "@/components/language-provider";
import { askAssistant, type ChatMessage } from "@/lib/chat.functions";
import { translateText } from "@/lib/complaints.functions";
import { thread as threadStore, assistantSeed, saved } from "@/lib/local-store";
import { LANGUAGES } from "@/lib/prompt-templates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Civic Companion — Smart Bharat AI" },
      {
        name: "description",
        content:
          "Ask any question about Government of India services. Structured answers with steps, documents, and next best actions in 9 Indian languages.",
      },
      { property: "og:title", content: "AI Civic Companion — Smart Bharat AI" },
      {
        property: "og:description",
        content: "Your virtual government officer, 24/7. Powered by Google Gemini.",
      },
    ],
  }),
  component: AssistantPage,
});

const SUGGESTIONS = [
  "How do I apply for a passport in India?",
  "What documents do I need for a PAN card?",
  "Schemes available for small farmers",
  "How to file an RTI application?",
  "Explain the PM-Kisan scheme in simple words",
  "Steps to get an Aadhaar update appointment",
];

function AssistantPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRef = useRef<{ recorder: MediaRecorder; stream: MediaStream; chunks: Blob[] } | null>(null);
  const composerRef = useRef<HTMLFormElement>(null);
  const [kbInset, setKbInset] = useState(0);
  const [composerH, setComposerH] = useState(160);

  // Track mobile keyboard via visualViewport (iOS Safari & Chrome Android)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKbInset(inset);
      if (document.activeElement === textareaRef.current) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        });
      }
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // Measure composer height so scroll area padding matches
  useEffect(() => {
    if (!composerRef.current) return;
    const el = composerRef.current;
    const measure = () => setComposerH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);


  // Load thread + seed on mount
  useEffect(() => {
    setMessages(threadStore.load());
    const seed = assistantSeed.consume();
    if (seed) {
      setInput(seed);
      requestAnimationFrame(() => textareaRef.current?.focus());
    } else {
      textareaRef.current?.focus();
    }
  }, []);

  // Persist
  useEffect(() => {
    threadStore.save(messages);
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const nextMsgs: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMsgs);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await askAssistant({ data: { messages: nextMsgs, language } });
      setMessages([...nextMsgs, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Assistant unavailable", { description: msg });
      setMessages(nextMsgs);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const speak = (idx: number, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Speech not supported in this browser");
      return;
    }
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*_`>]/g, "").replace(/\[[^\]]+\]\([^)]+\)/g, "");
    const u = new SpeechSynthesisUtterance(clean);
    const langMap: Record<string, string> = {
      en: "en-IN", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN", gu: "gu-IN",
      bn: "bn-IN", te: "te-IN", kn: "kn-IN", pa: "pa-IN",
    };
    u.lang = langMap[language] ?? "en-IN";
    u.rate = 1.0;
    u.onend = () => setSpeakingIdx(null);
    u.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(u);
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (blob.size < 1024) {
          toast.error("Recording too short");
          return;
        }
        const ext = recorder.mimeType?.includes("mp4") ? "mp4" : "webm";
        const fd = new FormData();
        fd.append("file", blob, `recording.${ext}`);
        toast.loading("Transcribing…", { id: "stt" });
        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          if (!res.ok) throw new Error(await res.text());
          const { text } = (await res.json()) as { text: string };
          toast.success("Transcribed", { id: "stt" });
          setInput((prev) => (prev ? prev + " " + text : text));
          textareaRef.current?.focus();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Transcription failed";
          toast.error("Could not transcribe", { id: "stt", description: msg });
        }
      };
      recorder.start();
      mediaRef.current = { recorder, stream, chunks };
      setListening(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopListening = () => {
    mediaRef.current?.recorder.stop();
    setListening(false);
  };

  const clear = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([]);
    threadStore.clear();
    toast.success("Conversation cleared");
  };

  const activeLang = LANGUAGES.find((l) => l.code === language);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-4xl flex-col px-4 pt-6 sm:px-6">

      <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" width={40} height={40} className="h-10 w-10 shrink-0" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl leading-tight tracking-tight sm:text-3xl">
              AI Civic Companion
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Responding in <span className="font-medium text-foreground">{activeLang?.native}</span> · Powered by Gemini
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          disabled={messages.length === 0}
          className="min-h-11 gap-1.5"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/50 p-4 sm:p-6"
        style={{ paddingBottom: composerH + 16, scrollPaddingBottom: composerH + 16 }}
        aria-live="polite"
        aria-label="Conversation"
      >

        {messages.length === 0 && !busy && <EmptyState onPick={(t) => send(t)} />}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" && (
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10">
                  <img src={logo} alt="" width={20} height={20} className="h-5 w-5" />
                </span>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/70 bg-background",
                )}
              >
                {m.role === "assistant" ? (
                  <>
                    <Markdown>{m.content}</Markdown>
                    <MessageActions
                      idx={i}
                      content={m.content}
                      lastUserQuestion={messages[i - 1]?.role === "user" ? messages[i - 1].content : ""}
                      speaking={speakingIdx === i}
                      translating={translatingIdx === i}
                      onSpeak={() => speak(i, m.content)}
                      onCopy={() => {
                        navigator.clipboard.writeText(m.content);
                        toast.success("Copied to clipboard");
                      }}
                      onTranslate={async (target) => {
                        setTranslatingIdx(i);
                        try {
                          const { text } = await translateText({
                            data: { text: m.content, targetLanguage: target },
                          });
                          setMessages((prev) => {
                            const next = [...prev];
                            next[i] = { role: "assistant", content: text };
                            return next;
                          });
                          toast.success(`Translated to ${target}`);
                        } catch (err) {
                          toast.error("Translation didn't go through", {
                            description: err instanceof Error ? err.message : "Try again in a moment.",
                          });
                        } finally {
                          setTranslatingIdx(null);
                        }
                      }}
                      onSave={() => {
                        const q = messages[i - 1]?.role === "user" ? messages[i - 1].content : "Assistant reply";
                        saved.notes.add(q, m.content);
                        toast.success("Saved to Citizen Hub", {
                          description: "Find it in My Space.",
                        });
                      }}
                      onFollowUp={() => {
                        textareaRef.current?.focus();
                        setInput("Can you explain that in simpler words?");
                      }}
                      onDeptGuidance={() => {
                        const q = messages[i - 1]?.role === "user" ? messages[i - 1].content : m.content.slice(0, 200);
                        assistantSeed.set(q);
                        navigate({ to: "/complaints" });
                      }}
                      onDocChecklist={() => {
                        const q = messages[i - 1]?.role === "user" ? messages[i - 1].content : "";
                        assistantSeed.set(q);
                        navigate({ to: "/documents" });
                      }}
                      currentLang={language}
                    />
                  </>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                )}
              </div>
              {m.role === "user" && (
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary">
                  <User className="h-4 w-4" />
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {busy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10">
              <img src={logo} alt="" width={20} height={20} className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <ProgressiveLoader stages={LOADING_STAGES.assistant} />
            </div>
          </motion.div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-0 mt-4 pb-4"
      >
        <div className="rounded-2xl border border-border/70 bg-card p-2 shadow-lift">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={listening ? "Listening… tap the mic again to stop." : "Ask about any government service…"}
            rows={2}
            className="min-h-[64px] resize-none border-0 bg-transparent px-3 py-2 text-sm shadow-none focus-visible:ring-0"
            disabled={busy}
            aria-label="Message"
          />
          <div className="flex items-center justify-between px-2 pb-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("min-h-11 min-w-11", listening && "text-destructive")}
              onClick={() => (listening ? stopListening() : startListening())}
              aria-label={listening ? "Stop recording" : "Start voice input"}
              disabled={busy}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || busy}
              className="h-10 min-w-24 gap-1.5 rounded-lg"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Never share Aadhaar numbers, OTPs, or passwords. This is guidance, not an official government service.
        </p>
      </form>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-4 font-display text-2xl">How can I help you today?</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Ask about any government service, scheme, or document. Try a suggestion below.
      </p>
      <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageActions({
  content,
  speaking,
  translating,
  onSpeak,
  onCopy,
  onTranslate,
  onSave,
  onFollowUp,
  onDeptGuidance,
  onDocChecklist,
  currentLang,
}: {
  idx: number;
  content: string;
  lastUserQuestion: string;
  speaking: boolean;
  translating: boolean;
  onSpeak: () => void;
  onCopy: () => void;
  onTranslate: (target: string) => void;
  onSave: () => void;
  onFollowUp: () => void;
  onDeptGuidance: () => void;
  onDocChecklist: () => void;
  currentLang: string;
}) {
  void content;
  const translateTarget = currentLang === "en" ? "Hindi" : "English";
  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      <div className="mb-2 flex flex-wrap gap-1">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onSpeak} aria-label={speaking ? "Stop speaking" : "Speak aloud"}>
          <Volume2 className={cn("h-3.5 w-3.5", speaking && "text-primary")} /> {speaking ? "Stop" : "Speak"}
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onCopy} aria-label="Copy answer">
          <Copy className="h-3.5 w-3.5" /> Copy
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onSave} aria-label="Save to Citizen Hub">
          <Bookmark className="h-3.5 w-3.5" /> Save
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="mr-1 self-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Next step
        </span>
        <ActionChip
          icon={Languages}
          label={translating ? "Translating…" : `Translate to ${translateTarget}`}
          onClick={() => onTranslate(translateTarget)}
          disabled={translating}
        />
        <ActionChip icon={FileText} label="Document checklist" onClick={onDocChecklist} />
        <ActionChip icon={Landmark} label="Find department" onClick={onDeptGuidance} />
        <ActionChip icon={MessageSquarePlus} label="Ask a follow-up" onClick={onFollowUp} />
      </div>
    </div>
  );
}

function ActionChip({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="h-3 w-3 text-primary" aria-hidden />
      {label}
    </button>
  );
}
