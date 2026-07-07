import type { ChatMessage } from "./chat.functions";
import type { ComplaintResult } from "./complaints.functions";
import type { DocumentGuide } from "./documents.functions";
import type { SchemeResult } from "./schemes.functions";

const KEYS = {
  thread: "sba.assistant.thread.v1",
  schemes: "sba.saved.schemes.v1",
  complaints: "sba.saved.complaints.v1",
  documents: "sba.saved.documents.v1",
  notes: "sba.saved.notes.v1",
  language: "sba.language.v1",
  theme: "sba.theme.v1",
  seed: "sba.assistant.seed.v1",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or serialization; ignore */
  }
}

export const thread = {
  load: (): ChatMessage[] => read<ChatMessage[]>(KEYS.thread, []),
  save: (msgs: ChatMessage[]) => write(KEYS.thread, msgs.slice(-40)),
  clear: () => write(KEYS.thread, []),
};

export type SavedScheme = { savedAt: number; scheme: SchemeResult["schemes"][number] };
export type SavedComplaint = {
  savedAt: number;
  complaint: ComplaintResult;
  originalDescription: string;
};
export type SavedDocument = { savedAt: number; documentType: string; guide: DocumentGuide };
export type SavedNote = { savedAt: number; question: string; answer: string };

export const saved = {
  schemes: {
    load: () => read<SavedScheme[]>(KEYS.schemes, []),
    add: (scheme: SchemeResult["schemes"][number]) => {
      const list = read<SavedScheme[]>(KEYS.schemes, []);
      if (list.some((s) => s.scheme.name === scheme.name)) return;
      write(KEYS.schemes, [{ savedAt: Date.now(), scheme }, ...list].slice(0, 50));
    },
    remove: (name: string) => {
      write(
        KEYS.schemes,
        read<SavedScheme[]>(KEYS.schemes, []).filter((s) => s.scheme.name !== name),
      );
    },
  },
  complaints: {
    load: () => read<SavedComplaint[]>(KEYS.complaints, []),
    add: (complaint: ComplaintResult, originalDescription: string) => {
      const list = read<SavedComplaint[]>(KEYS.complaints, []);
      write(
        KEYS.complaints,
        [{ savedAt: Date.now(), complaint, originalDescription }, ...list].slice(0, 50),
      );
    },
    remove: (savedAt: number) => {
      write(
        KEYS.complaints,
        read<SavedComplaint[]>(KEYS.complaints, []).filter((c) => c.savedAt !== savedAt),
      );
    },
  },
  documents: {
    load: () => read<SavedDocument[]>(KEYS.documents, []),
    add: (documentType: string, guide: DocumentGuide) => {
      const list = read<SavedDocument[]>(KEYS.documents, []);
      const filtered = list.filter((d) => d.documentType !== documentType);
      write(
        KEYS.documents,
        [{ savedAt: Date.now(), documentType, guide }, ...filtered].slice(0, 50),
      );
    },
    remove: (documentType: string) => {
      write(
        KEYS.documents,
        read<SavedDocument[]>(KEYS.documents, []).filter((d) => d.documentType !== documentType),
      );
    },
  },
  notes: {
    load: () => read<SavedNote[]>(KEYS.notes, []),
    add: (question: string, answer: string) => {
      const list = read<SavedNote[]>(KEYS.notes, []);
      write(KEYS.notes, [{ savedAt: Date.now(), question, answer }, ...list].slice(0, 50));
    },
    remove: (savedAt: number) => {
      write(
        KEYS.notes,
        read<SavedNote[]>(KEYS.notes, []).filter((n) => n.savedAt !== savedAt),
      );
    },
  },
};

export const prefs = {
  language: {
    load: (): string => read<string>(KEYS.language, "en"),
    save: (code: string) => write(KEYS.language, code),
  },
  theme: {
    load: (): "light" | "dark" => read<"light" | "dark">(KEYS.theme, "light"),
    save: (theme: "light" | "dark") => write(KEYS.theme, theme),
  },
};

/** Seed the assistant with a pre-filled user question when navigating from another feature. */
export const assistantSeed = {
  set: (question: string) => write(KEYS.seed, question),
  consume: (): string | null => {
    const v = read<string | null>(KEYS.seed, null);
    if (v) write(KEYS.seed, null);
    return v;
  },
};

export function clearAllData() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
}

export function exportAllData(): string {
  return JSON.stringify(
    {
      thread: thread.load(),
      schemes: saved.schemes.load(),
      complaints: saved.complaints.load(),
      documents: saved.documents.load(),
      notes: saved.notes.load(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}
