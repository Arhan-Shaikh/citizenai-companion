import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { LANGUAGES, type LangCode } from "@/lib/prompt-templates";
import { prefs } from "@/lib/local-store";

type Ctx = { language: LangCode; setLanguage: (l: LangCode) => void };
const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const saved = prefs.language.load() as LangCode;
    if (LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
  }, []);

  const setLanguage = useCallback((l: LangCode) => {
    setLangState(l);
    prefs.language.save(l);
  }, []);

  return <LangCtx.Provider value={{ language, setLanguage }}>{children}</LangCtx.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
