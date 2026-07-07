import { Globe } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LANGUAGES, type LangCode } from "@/lib/prompt-templates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export function LanguageSelect() {
  const { language, setLanguage } = useLanguage();
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
  return (
    <Select value={language} onValueChange={(v) => setLanguage(v as LangCode)}>
      <SelectTrigger
        className="h-10 min-h-11 w-auto max-w-[9.5rem] gap-1.5 border-border/70 pl-2 pr-2"
        aria-label="Choose language"
      >
        <Globe className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate text-sm font-medium">{current.native}</span>
      </SelectTrigger>
      <SelectContent align="end">
        {LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <span className="font-medium">{l.native}</span>
            <span className="ml-2 text-xs text-muted-foreground">{l.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
