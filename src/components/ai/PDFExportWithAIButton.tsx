import { useState } from "react";
import { Sparkles, Loader2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchAIPDFSummary, AIPDFSummaryTool } from "@/lib/aiPdfSummary";
import { toast } from "sonner";

interface PDFExportWithAIButtonProps {
  tool: AIPDFSummaryTool;
  projectName?: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  /** Função que gera o PDF. Recebe um aiSummary opcional. */
  onExport: (aiSummary?: string) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

/**
 * Botão dropdown para exportar PDF com opção de incluir resumo executivo
 * gerado pela IA. Mostra "Gerar PDF" e "Gerar PDF + Resumo IA".
 */
export function PDFExportWithAIButton({
  tool,
  projectName,
  inputs,
  results,
  onExport,
  disabled,
  className,
}: PDFExportWithAIButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSimple = async () => {
    setLoading(true);
    try {
      await onExport(undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleWithAI = async () => {
    setLoading(true);
    try {
      const summary = await fetchAIPDFSummary({ tool, projectName, inputs, results });
      await onExport(summary);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar resumo IA.");
      // Fallback: ainda gera o PDF sem resumo
      try {
        await onExport(undefined);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || loading} className={className}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          {loading ? "Gerando..." : "PDF"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSimple}>
          <FileDown className="h-4 w-4 mr-2" />
          PDF padrão
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWithAI}>
          <Sparkles className="h-4 w-4 mr-2 text-accent" />
          PDF + Resumo IA
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
