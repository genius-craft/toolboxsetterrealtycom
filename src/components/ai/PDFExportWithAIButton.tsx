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

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "gold";

type ButtonSize = "default" | "sm" | "lg" | "icon";

interface PDFExportWithAIButtonProps {
  tool: AIPDFSummaryTool;
  projectName?: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  /** Função que gera o PDF. Recebe um aiSummary opcional. */
  onExport: (aiSummary?: string) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Texto a exibir; default "PDF". */
  label?: string;
  /** Mostrar apenas ícone (sem texto). Útil em barras compactas. */
  iconOnly?: boolean;
}

/**
 * Botão dropdown para exportar PDF com opção de incluir resumo executivo
 * gerado pela IA. Mostra "PDF padrão" e "PDF + Resumo IA".
 */
export function PDFExportWithAIButton({
  tool,
  projectName,
  inputs,
  results,
  onExport,
  disabled,
  className,
  variant = "outline",
  size = "sm",
  label = "PDF",
  iconOnly = false,
}: PDFExportWithAIButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSimple = async () => {
    setLoading(true);
    try {
      await onExport(undefined);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF.");
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
      toast.error(
        e instanceof Error
          ? `${e.message} Gerando PDF sem resumo…`
          : "Falha ao gerar resumo IA. Gerando PDF sem resumo…",
      );
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
        <Button
          variant={variant}
          size={size}
          disabled={disabled || loading}
          className={className}
          type="button"
        >
          {loading ? (
            <Loader2 className={`h-4 w-4 animate-spin ${iconOnly ? "" : "mr-2"}`} />
          ) : (
            <FileDown className={`h-4 w-4 ${iconOnly ? "" : "mr-2"}`} />
          )}
          {!iconOnly && (loading ? "Gerando..." : label)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-popover">
        <DropdownMenuItem onClick={handleSimple} disabled={loading}>
          <FileDown className="h-4 w-4 mr-2" />
          PDF padrão
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWithAI} disabled={loading}>
          <Sparkles className="h-4 w-4 mr-2 text-accent" />
          PDF + Resumo IA
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
