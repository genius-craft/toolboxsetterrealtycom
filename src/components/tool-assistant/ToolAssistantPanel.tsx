import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Paperclip, FileText, X } from "lucide-react";
import { ToolMessage } from "./ToolMessage";
import { toast } from "sonner";

interface ToolAssistantPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Attachment {
  filename: string;
  text: string;
  pageCount: number;
  truncated?: boolean;
}

type Msg = {
  role: "user" | "assistant";
  content: string;
  attachments?: { filename: string; pageCount: number }[];
};

const SUGGESTIONS = [
  "Como uso o Simulador?",
  "O que é Cap Rate?",
  "Quando uso a Permuta?",
  "Diferença entre as 5 calculadoras",
];

const INITIAL_MESSAGE: Msg = {
  role: "assistant",
  content:
    "Olá! Eu sou a **TOOL**, sua assistente do Setter Toolbox.\n\nPosso te ajudar com qualquer dúvida sobre as calculadoras, fórmulas e fluxos da plataforma.\n\n💡 **Dica:** clique no ícone de clipe para anexar um PDF (ex.: relatório gerado pelas ferramentas) e eu analiso para você.";
};

const MAX_ATTACHMENTS = 2;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function ToolAssistantPanel({ open, onOpenChange }: ToolAssistantPanelProps) {
  const [messages, setMessages] = useState<Msg[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [extracting, setExtracting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleAttachClick = () => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.error(`Máximo de ${MAX_ATTACHMENTS} PDFs por conversa.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = ""; // permite reanexar mesmo arquivo
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Apenas arquivos PDF são aceitos.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("PDF muito grande (máx 10 MB).");
      return;
    }

    setExtracting(true);
    const toastId = toast.loading(`Lendo ${file.name}…`);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tool-extract-pdf`;
      const fd = new FormData();
      fd.append("file", file);

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: fd,
      });

      const data = await resp.json();

      if (!resp.ok) {
        toast.error(data?.error || "Falha ao ler o PDF.", { id: toastId });
        return;
      }

      setAttachments((prev) => [
        ...prev,
        {
          filename: data.filename,
          text: data.text,
          pageCount: data.pageCount || 0,
          truncated: !!data.truncated,
        },
      ]);

      toast.success(
        data.truncated
          ? `${data.filename} anexado (texto longo — apenas o início será analisado).`
          : `${data.filename} anexado e pronto para análise.`,
        { id: toastId },
      );
    } catch (err) {
      console.error("Erro extract PDF:", err);
      toast.error("Não consegui processar o PDF.", { id: toastId });
    } finally {
      setExtracting(false);
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    const hasAttachments = attachments.length > 0;

    if ((!trimmed && !hasAttachments) || loading) return;

    // Se só tem anexo sem texto, usa um prompt padrão de análise
    const userText = trimmed || "Analise o(s) PDF(s) que anexei.";

    const userMsg: Msg = {
      role: "user",
      content: userText,
      attachments: hasAttachments
        ? attachments.map((a) => ({ filename: a.filename, pageCount: a.pageCount }))
        : undefined,
    };

    const payloadMessages = messages[0] === INITIAL_MESSAGE
      ? [...messages.slice(1), { role: userMsg.role, content: userMsg.content }]
      : [...messages.map((m) => ({ role: m.role, content: m.content })), { role: userMsg.role, content: userMsg.content }];

    const attachedDocuments = hasAttachments
      ? attachments.map((a) => ({
          filename: a.filename,
          content: a.text,
          pageCount: a.pageCount,
        }))
      : undefined;

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]); // anexos são consumidos por essa mensagem
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
        body: JSON.stringify({
          messages: payloadMessages,
          ...(attachedDocuments ? { attachedDocuments } : {}),
        }),
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

      if (!resp.body) {
        toast.error("Sem resposta da TOOL.");
        setLoading(false);
        return;
      }

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
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

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

  const canSend = !loading && !extracting && (input.trim().length > 0 || attachments.length > 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-accent-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 text-left">
              <SheetTitle className="text-base flex items-center gap-2">
                TOOL
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Beta</Badge>
              </SheetTitle>
              <p className="text-xs text-muted-foreground">Assistente do Setter Toolbox</p>
            </div>
          </div>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className="space-y-1.5">
              {m.attachments && m.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {m.attachments.map((a, ai) => (
                    <Badge key={ai} variant="outline" className="gap-1 text-[10px] font-normal">
                      <FileText className="h-3 w-3" />
                      {a.filename}
                      {a.pageCount > 0 && <span className="text-muted-foreground">· {a.pageCount}p</span>}
                    </Badge>
                  ))}
                </div>
              )}
              <ToolMessage
                role={m.role}
                content={m.content}
                isStreaming={loading && i === messages.length - 1 && m.role === "assistant"}
              />
            </div>
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
                <button
                  onClick={handleAttachClick}
                  className="text-left text-sm px-3 py-2 rounded-lg border border-dashed border-accent/40 hover:border-accent hover:bg-accent/5 transition-colors flex items-center gap-2"
                >
                  <Paperclip className="h-3.5 w-3.5 text-accent" />
                  Analisar PDF da minha simulação
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3 space-y-2">
          {/* Chips de anexos */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {attachments.map((a, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="gap-1.5 pl-2 pr-1 py-1 text-xs font-normal"
                >
                  <FileText className="h-3 w-3 text-accent shrink-0" />
                  <span className="truncate max-w-[140px]">{a.filename}</span>
                  {a.pageCount > 0 && (
                    <span className="text-muted-foreground">· {a.pageCount}p</span>
                  )}
                  <button
                    onClick={() => removeAttachment(i)}
                    className="ml-0.5 rounded hover:bg-background/80 p-0.5"
                    aria-label={`Remover ${a.filename}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileSelected}
          />

          <div className="flex gap-2 items-end">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleAttachClick}
              disabled={loading || extracting || attachments.length >= MAX_ATTACHMENTS}
              className="shrink-0"
              title="Anexar PDF para análise"
            >
              {extracting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                attachments.length > 0
                  ? "Pergunte algo sobre o(s) PDF(s) ou envie em branco para análise…"
                  : "Pergunte algo sobre o Setter Toolbox…"
              }
              rows={1}
              className="resize-none min-h-[40px] max-h-32 text-sm"
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={() => send(input)}
              disabled={!canSend}
              className="shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            {provider === "lovable"
              ? "Modo backup ativo • Lovable AI"
              : provider === "openrouter"
              ? "Powered by OpenRouter"
              : "TOOL pode cometer erros — confira informações importantes"}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
