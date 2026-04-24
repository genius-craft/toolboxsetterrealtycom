import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Cpu, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

interface OpenRouterModel {
  id: string;
  name: string;
  context_length?: number;
  pricing?: { prompt: string; completion: string };
}

const RECOMMENDED_FREE: { id: string; label: string; hint: string }[] = [
  { id: "google/gemma-3-27b-it:free", label: "Gemma 3 27B (free)", hint: "Padrão. Mais capaz da família Gemma free." },
  { id: "google/gemma-3-12b-it:free", label: "Gemma 3 12B (free)", hint: "Mais rápido, qualidade ainda boa." },
  { id: "google/gemma-3-4b-it:free", label: "Gemma 3 4B (free)", hint: "Bem rápido, respostas mais simples." },
  { id: "google/gemma-3n-e4b-it:free", label: "Gemma 3n E4B (free)", hint: "Variante eficiente da família 3n." },
];

function isFree(m: OpenRouterModel): boolean {
  if (m.id.endsWith(":free")) return true;
  const pp = parseFloat(m.pricing?.prompt || "0");
  const cp = parseFloat(m.pricing?.completion || "0");
  return pp === 0 && cp === 0;
}

export function ToolModelSelector() {
  const [currentModel, setCurrentModel] = useState<string>("google/gemma-3-27b-it:free");
  const [selected, setSelected] = useState<string>("google/gemma-3-27b-it:free");
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega config + lista de modelos
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: cfg }, modelsData] = await Promise.all([
        supabase.from("tool_config").select("value").eq("key", "openrouter_model").maybeSingle(),
        loadModels(),
      ]);
      if (cfg?.value && typeof cfg.value === "string") {
        setCurrentModel(cfg.value);
        setSelected(cfg.value);
      }
      setModels(modelsData);
      setLoading(false);
    })();
  }, []);

  async function loadModels(): Promise<OpenRouterModel[]> {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/models");
      if (!r.ok) throw new Error("OR list failed");
      const j = await r.json();
      return (j.data || []) as OpenRouterModel[];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  const refresh = async () => {
    setRefreshing(true);
    const fresh = await loadModels();
    setModels(fresh);
    setRefreshing(false);
    toast.success("Lista de modelos atualizada");
  };

  const save = async () => {
    if (selected === currentModel) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("tool_config")
      .upsert({ key: "openrouter_model", value: selected as any, updated_by: user?.id, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      setCurrentModel(selected);
      toast.success(`Modelo da TOOL atualizado para ${selected}`);
    }
  };

  // Modelos free do OpenRouter (excluindo nano de teste etc.) ordenados por nome
  const freeModels = models
    .filter(isFree)
    .sort((a, b) => a.id.localeCompare(b.id));

  // Marca os recomendados que estão disponíveis
  const recommendedAvailable = RECOMMENDED_FREE.filter(r => freeModels.some(m => m.id === r.id));
  const otherFree = freeModels.filter(m => !RECOMMENDED_FREE.some(r => r.id === m.id));

  const dirty = selected !== currentModel;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cpu className="h-5 w-5 text-accent" />
              Modelo de IA da TOOL
            </CardTitle>
            <CardDescription className="mt-1">
              Escolha o modelo do <strong>OpenRouter</strong> usado como provedor primário.
              Em caso de erro/limite, o sistema cai automaticamente para o Lovable AI.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
            Atualizar lista
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Em uso atualmente:</span>
                <Badge variant="secondary" className="font-mono text-[10px]">{currentModel}</Badge>
              </div>

              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  {recommendedAvailable.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Recomendados (free)</SelectLabel>
                      {recommendedAvailable.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          <div className="flex flex-col">
                            <span>{r.label}</span>
                            <span className="text-[10px] text-muted-foreground">{r.hint}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  {otherFree.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Outros modelos free</SelectLabel>
                      {otherFree.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          <span className="font-mono text-xs">{m.id}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  {freeModels.length === 0 && (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                      Não foi possível listar modelos do OpenRouter agora.
                    </div>
                  )}
                </SelectContent>
              </Select>

              {selected && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  ID selecionado: {selected}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {dirty
                  ? "Você tem alterações não salvas."
                  : "Tudo salvo. A próxima conversa já usa este modelo."}
              </p>
              <Button onClick={save} disabled={!dirty || saving} size="sm">
                {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                Salvar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
