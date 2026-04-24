import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ToolAssistantPanel } from "./ToolAssistantPanel";

const HIDDEN_ROUTES = ["/auth", "/pending-approval"];

export function ToolAssistantButton() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  if (HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r))) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir TOOL — assistente do Setter Toolbox"
        className="fixed bottom-6 right-6 z-40 group"
      >
        <div className="relative flex items-center gap-2 bg-gradient-to-br from-accent to-accent/70 hover:from-accent hover:to-accent text-accent-foreground px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
          <div className="relative">
            <Sparkles className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-background animate-pulse" />
          </div>
          <span className="hidden sm:inline whitespace-nowrap font-semibold tracking-wide text-sm">
            TOOL
          </span>
        </div>
      </button>

      <ToolAssistantPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
