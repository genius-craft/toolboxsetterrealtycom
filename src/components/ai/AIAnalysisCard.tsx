import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import type { AutoFillTool } from "./AutoFillButton";

interface AIAnalysisCardProps {
  tool: AutoFillTool;
  projectName?: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  /** Quando os inputs mudam relevantemente, o pai pode passar uma chave nova
   *  para invalidar a análise armazenada. */
  resetKey?: string | number;
}

export function AIAnalysisCard({
  tool,
  projectName,
  inputs,
  results,
  resetKey,
}: AIAnalysisCardProps) {
  const { isAdmin } = useUserRole();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  if (!isAdmin) return null;


  // Limpa análise quando inputs/resultados mudam significativamente
  useEffect(() => {
    setAnalysis(null);
  }, [resetKey]);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tool-analyze", {
        body: { tool, projectName, inputs, results },
      });

      if (error) {
        const ctx = (error as { context?: { error?: string } }).context;
        const msg = ctx?.error || error.message || "Falha ao gerar análise.";
        toast.error(msg);
        return;
      }

      const text = (data as { analysis?: string })?.analysis;
      if (!text) {
        toast.warning("A IA não retornou análise. Tente novamente.");
        return;
      }
      setAnalysis(text);
    } catch (e) {
      console.error(e);
      toast.error("Erro inesperado ao gerar análise.");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis && !loading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="font-medium text-sm">Parecer da IA</p>
              <p className="text-xs text-muted-foreground">
                Receba uma análise crítica dos pontos fortes, riscos e recomendações.
              </p>
            </div>
          </div>
          <Button onClick={generate} size="sm" variant="outline" className="shrink-0">
            <Sparkles className="h-4 w-4" />
            Gerar análise
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5 bg-gradient-to-br from-accent/5 to-transparent border-accent/20 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </div>
          <p className="font-medium text-sm">Parecer da IA</p>
        </div>
        {analysis && !loading && (
          <Button
            onClick={generate}
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refazer
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analisando seus números…
        </div>
      )}

      {analysis && (
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-sm prose-strong:text-foreground">
          <ReactMarkdown>{analysis}</ReactMarkdown>
          <p className="text-[10px] text-muted-foreground mt-3 not-prose italic">
            Análise gerada por IA — caráter educacional. Consulte um especialista antes de decidir.
          </p>
        </div>
      )}
    </Card>
  );
}
