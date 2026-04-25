import { supabase } from "@/integrations/supabase/client";

export type AIPDFSummaryTool =
  | "simulador"
  | "permuta"
  | "hbu"
  | "decisor"
  | "preco_teto";

interface FetchAIPDFSummaryParams {
  tool: AIPDFSummaryTool;
  projectName?: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
}

/**
 * Chama a edge function `tool-pdf-summary` e devolve um resumo executivo
 * curto (markdown/texto) para incluir no PDF. Lança em caso de erro para que
 * a UI possa mostrar toast.
 */
export async function fetchAIPDFSummary({
  tool,
  projectName,
  inputs,
  results,
}: FetchAIPDFSummaryParams): Promise<string> {
  const { data, error } = await supabase.functions.invoke("tool-pdf-summary", {
    body: { tool, projectName, inputs, results },
  });

  if (error) {
    const ctx = (error as { context?: { error?: string } }).context;
    throw new Error(ctx?.error || error.message || "Falha ao gerar resumo IA.");
  }

  const summary = (data as { summary?: string })?.summary;
  if (!summary) {
    throw new Error("A IA não retornou resumo.");
  }
  return summary;
}
