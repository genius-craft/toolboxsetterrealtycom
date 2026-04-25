import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AutoFillTool = "simulador" | "permuta" | "hbu" | "decisor" | "preco_teto";

interface AutoFillButtonProps {
  tool: AutoFillTool;
  /**
   * Recebe os campos extraídos pela IA. O componente da calculadora é responsável
   * por aplicar cada chave nos respectivos setters de estado (ignorando chaves
   * que não reconhece).
   */
  onFill: (fields: Record<string, unknown>) => void;
  className?: string;
}

const PLACEHOLDERS: Record<AutoFillTool, string> = {
  simulador:
    "Ex.: Sala comercial em Pinheiros de 80m², R$ 1,8 mi, aluguel atual R$ 9.500/mês, IPTU R$ 280/mês, condomínio R$ 850/mês, vacância esperada 6%, taxa de adm 8%.",
  permuta:
    "Ex.: Construtora oferece R$ 1,2 mi à vista pelo terreno OU 4 unidades futuras avaliadas em R$ 1,8 mi com entrega em 3 anos. IPTU R$ 400/mês.",
  hbu:
    "Ex.: Terreno de 600m² no centro custa R$ 1,5 mi, área construível 1.200 m², custo de obra R$ 3.500/m². Venda residencial R$ 8.000/m² ou aluguel comercial R$ 60/m²/mês com cap rate 8%.",
  decisor:
    "Ex.: Vendedor pede R$ 1,8 mi por sala comercial. Receita bruta R$ 9.500/mês, IPTU R$ 280/mês, condomínio R$ 850/mês, manutenção R$ 200/mês. Cap rate alvo 0,55% a.m., margem segurança 5%.",
  preco_teto:
    "Ex.: Imóvel com receita bruta R$ 12.000/mês, vacância 8%, IPTU R$ 350/mês, condomínio R$ 900/mês, adm 7%. Quero cap rate alvo de 0,6% a.m. Área 120m². Mercado pede R$ 2,3 mi.",
};

export function AutoFillButton({ tool, onFill, className }: AutoFillButtonProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const text = description.trim();
    if (text.length < 20) {
      toast.error("Descreva o cenário com pelo menos 20 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tool-autofill", {
        body: { tool, description: text },
      });

      if (error) {
        // Tenta extrair mensagem amigável do contexto do erro
        const ctx = (error as { context?: { error?: string } }).context;
        const msg = ctx?.error || error.message || "Falha ao chamar a IA.";
        toast.error(msg);
        return;
      }

      const fields = (data as { fields?: Record<string, unknown> })?.fields ?? {};
      const count = Object.keys(fields).length;

      if (count === 0) {
        toast.warning("A IA não conseguiu extrair campos. Tente uma descrição mais detalhada.");
        return;
      }

      onFill(fields);
      toast.success(`${count} campo${count > 1 ? "s" : ""} preenchido${count > 1 ? "s" : ""}. Revise antes de calcular.`);
      setOpen(false);
      setDescription("");
    } catch (e) {
      console.error(e);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
      >
        <Sparkles className="h-4 w-4" />
        Preencher com IA
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Preencher com IA
            </DialogTitle>
            <DialogDescription>
              Cole um anúncio, briefing ou descrição em linguagem natural. A IA
              vai extrair os números e preencher os campos da calculadora. Você
              sempre revisa antes de calcular.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={PLACEHOLDERS[tool]}
            rows={8}
            maxLength={8000}
            disabled={loading}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground -mt-2">
            {description.length}/8000 caracteres
          </p>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading || description.trim().length < 20}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extraindo…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Preencher campos
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
