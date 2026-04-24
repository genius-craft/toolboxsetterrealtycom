import ReactMarkdown from "react-markdown";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ToolMessage({ role, content, isStreaming }: ToolMessageProps) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-2.5 animate-fade-up", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "h-7 w-7 shrink-0 rounded-full flex items-center justify-center",
          isUser
            ? "bg-muted text-muted-foreground"
            : "bg-gradient-to-br from-accent to-accent/60 text-accent-foreground shadow-sm",
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      </div>
      <div
        className={cn(
          "rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm",
        )}
      >
        {isUser ? (
          content
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-2">
            <ReactMarkdown>{content || (isStreaming ? "…" : "")}</ReactMarkdown>
            {isStreaming && content && (
              <span className="inline-block w-1.5 h-3.5 bg-current animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
