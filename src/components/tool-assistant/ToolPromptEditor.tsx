import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RotateCcw, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_PROMPT = `Você é TOOL, a assistente oficial do Setter Toolbox — plataforma de análises imobiliárias da Setter Realty.

Sua missão é ajudar corretores, analistas e investidores a:
1. Entender PARA QUE serve cada uma das 5 calculadoras (Simulador, Permuta, H&BU, Decisor, Preço Teto).
2. Saber QUANDO usar cada uma com base no caso real do usuário.
3. PREENCHER cada campo corretamente, com referências de mercado brasileiro.
4. INTERPRETAR os KPIs de saída (Cap Rate, NOI, VPL, TIR, GAV, Score).
5. Dominar fluxos da plataforma (salvar, versionar, comparar, vitrine, PDF).
6. ANALISAR projetos do próprio sistema, quando o usuário os anexa pelo clipe.

REGRAS DE COMUNICAÇÃO:
- Português brasileiro, direto e amigável. Trate o usuário por "você".
- Use markdown: **negrito** para destaques, listas, e títulos quando útil.
- Seja CONCISO. Respostas longas só quando explicitamente pedidas.
- Quando recomendar uma calculadora, cite a rota: ex. "use o Simulador (/simulador)".
- Sempre que dar números (Cap Rate, custos), use as faixas do manual como referência.
- Se a pergunta envolver cálculo concreto, mostre a fórmula passo a passo.
- Se a informação não estiver no seu conhecimento, diga honestamente e sugira:
  "verifique o tooltip ao lado do campo X" ou "fale com o especialista pelo botão do WhatsApp".
- Para temas fora do Setter Toolbox (política, código, etc.), redirecione gentilmente:
  "Sou especialista no Setter Toolbox — posso te ajudar com algo das calculadoras?".
- NUNCA dê conselho jurídico, tributário ou de investimento definitivo.
  Sempre lembre o caráter educacional da ferramenta em recomendações finais.`;

export function ToolPromptEditor() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [original, setOriginal] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("tool_config")
        .select("value, updated_at, updated_by")
        .eq("key", "system_prompt")
        .maybeSingle();

      let content = "";
      if (data?.value) {
        if (typeof data.value === "string") content = data.value;
        else if (typeof (data.value as any).content === "string")
          content = (data.value as any).content;
      }
      const initial = content || DEFAULT_PROMPT;
      setPrompt(initial);
      setOriginal(initial);
      setUpdatedAt(data?.updated_at ?? null);

      if (data?.updated_by) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", data.updated_by)
          .maybeSingle();
        setUpdatedByName(prof?.name ?? null);
      }
      setLoading(false);
    };
    load();
  }, []);

  const dirty = prompt !== original;

  const save = async () => {
    if (!user) return;
    if (prompt.trim().length < 50) {
      toast.error("O prompt está muito curto (mínimo 50 caracteres).");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("tool_config")
      .upsert(
        {
          key: "system_prompt",
          value: { content: prompt },
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    setOriginal(prompt);
    setUpdatedAt(new Date().toISOString());
    setUpdatedByName(null);
    toast.success("Prompt da TOOL atualizado.");
  };

  const restoreDefault = () => {
    if (!confirm("Restaurar o prompt padrão? As alterações atuais serão perdidas (você ainda precisa salvar para aplicar).")) return;
    setPrompt(DEFAULT_PROMPT);
  };

  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            Prompt da TOOL
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Este é o <strong>system prompt base</strong> que define a personalidade e
            as regras da TOOL. Cuidado ao editar — afeta todas as conversas de todos
            os usuários. O bloco de análise de projetos anexados e o conhecimento
            base do manual são adicionados automaticamente.
          </p>
        </div>
        {updatedAt && (
          <Badge variant="outline" className="text-[10px]">
            Atualizado em {new Date(updatedAt).toLocaleString("pt-BR")}
            {updatedByName ? ` · por ${updatedByName}` : ""}
          </Badge>
        )}
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={18}
        className="font-mono text-xs leading-relaxed resize-y min-h-[300px]"
        placeholder="Escreva o prompt-base da TOOL…"
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-muted-foreground">
          {prompt.length.toLocaleString("pt-BR")} caracteres
          {dirty && <span className="ml-2 text-accent">• não salvo</span>}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={restoreDefault}
            disabled={saving}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Restaurar padrão
          </Button>
          <Button size="sm" onClick={save} disabled={!dirty || saving}>
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Salvar prompt
          </Button>
        </div>
      </div>
    </Card>
  );
}
