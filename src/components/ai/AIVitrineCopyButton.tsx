import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AutoFillTool } from "./AutoFillButton";

interface AIVitrineCopyButtonProps {
  tool: AutoFillTool;
  projectName: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  onResult: (copy: { title: string; description: string }) => void;
  size?: "sm" | "default";
}

export function AIVitrineCopyButton({
  tool,
  projectName,
  inputs,
  results,
  onResult,
  size = "sm",
}: AIVitrineCopyButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tool-vitrine-copy", {
        body: { tool, projectName, inputs, results },
      });

      if (error) {
        const ctx = (error as { context?: { error?: string } }).context;
        toast.error(ctx?.error || error.message || "Falha ao gerar copy.");
        return;
      }

      const copy = data as { title?: string; description?: string };
      if (!copy?.title && !copy?.description) {
        toast.warning("A IA não retornou copy.");
        return;
      }

      onResult({ title: copy.title ?? "", description: copy.description ?? "" });
      toast.success("Copy gerado. Revise antes de salvar.");
    } catch (e) {
      console.error(e);
      toast.error("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {loading ? "Gerando…" : "Gerar com IA"}
    </Button>
  );
}
