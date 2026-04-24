import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { ToolMessage } from "./ToolMessage";
import { toast } from "sonner";

interface ToolAssistantPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Como uso o Simulador?",
  "O que é Cap Rate?",
  "Quando uso a Permuta?",
  "Diferença entre as 5 calculadoras",
];

const INITIAL_MESSAGE: Msg = {
  role: "assistant",
  content:
    "Olá! Eu sou a **TOOL**, sua assistente do Setter Toolbox.\n\nPosso te ajudar com qualquer dúvida sobre as calculadoras, fórmulas e fluxos da plataforma. Como posso ajudar?",
};

export function ToolAssistantPanel({ open, onOpenChange }: ToolAssistantPanelProps) {
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const history = messages.filter((m) => m !== INITIAL_MESSAGE || messages.length === 1);
    // Remove a mensagem inicial do payload se houver outras (não precisa enviar saudação)
    const payloadMessages = messages[0] === INITIAL_MESSAGE
      ? [...messages.slice(1), userMsg]
      : [...messages, userMsg];

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tool-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        let errMsg = "Erro ao conversar com a TOOL.";
        try {
          const j = await resp.json();
          if (j?.error) errMsg = j.error;
        } catch { /* ignore */ }
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      const usedProvider = resp.headers.get("x-ai-provider");
      if (usedProvider) setProvider(usedProvider);

      // Stream SSE
      if (!resp.body) {
        toast.error("Sem resposta da TOOL.");
        setLoading(false);
        return;
      }

      // Cria mensagem do assistente vazia
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch {
            // partial JSON — devolve pro buffer
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // flush final
      if (buffer.trim()) {
        for (const raw of buffer.split("\n")) {
          if (!raw.startsWith("data: ")) continue;
          const j = raw.slice(6).trim();
          if (j === "[DONE]") continue;
          try {
            const p = JSON.parse(j);
            const d = p.choices?.[0]?.delta?.content;
            if (d) {
              assistantText += d;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch { /* ignore */ }
        }
      }

      if (!assistantText) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Não consegui gerar uma resposta agora. Tente reformular.",
          };
          return copy;
        });
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("TOOL chat erro:", e);
        toast.error("Falha de conexão com a TOOL.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-accent-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 text-left">
              <SheetTitle className="text-base flex items-center gap-2">
                TOOL
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  Beta
                </Badge>
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                Assistente do Setter Toolbox
              </p>
            </div>
          </div>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((m, i) => (
            <ToolMessage
              key={i}
              role={m.role}
              content={m.content}
              isStreaming={loading && i === messages.length - 1 && m.role === "assistant"}
            />
          ))}

          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-9">
              <Loader2 className="h-3 w-3 animate-spin" />
              TOOL está pensando…
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground px-1">Sugestões:</p>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-sm px-3 py-2 rounded-lg border border-border hover:border-accent/40 hover:bg-accent/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3 space-y-2">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte algo sobre o Setter Toolbox…"
              rows={1}
              className="resize-none min-h-[40px] max-h-32 text-sm"
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {provider === "lovable"
              ? "Modo backup ativo • Lovable AI"
              : provider === "openrouter"
              ? "Powered by OpenRouter (Gemma)"
              : "TOOL pode cometer erros — confira informações importantes"}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
