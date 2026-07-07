import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose-sba text-sm leading-relaxed text-foreground",
        "[&_h1]:mt-5 [&_h1]:mb-3 [&_h1]:text-lg [&_h1]:font-semibold",
        "[&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2:first-child]:mt-0",
        "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold",
        "[&_p]:my-2.5 [&_p]:leading-relaxed",
        "[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul>li]:my-1.5",
        "[&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol>li]:my-1.5",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary/80",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs",
        "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...rest }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
