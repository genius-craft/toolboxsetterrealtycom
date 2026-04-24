## Objetivo

Adicionar os 7 modelos abaixo como opções **recomendadas** explícitas no seletor de IA da TOOL (admin → `/admin/tool-knowledge`), para que possam ser escolhidos diretamente sem depender de aparecerem na lista filtrada do OpenRouter:

- `google/gemma-4-31b-it`
- `google/gemini-3.1-flash-lite-preview`
- `anthropic/claude-3-haiku`
- `deepseek/deepseek-v4-flash`
- `x-ai/grok-4.1-fast`
- `openai/gpt-4.1-nano`
- `xiaomi/mimo-v2.5`

Hoje a lista esconde tudo que não é "free" — então mesmo se o OpenRouter listar esses modelos, eles não aparecem. Vamos garantir que apareçam **independente de serem pagos ou não**.

---

## Mudanças

### 1. `src/components/tool-assistant/ToolModelSelector.tsx`

**a) Expandir a lista `RECOMMENDED_FREE` → renomear para `RECOMMENDED_MODELS`** com duas categorias:

- **Free (atuais)** — Gemma 3 27B/12B/4B/3n.
- **Premium / experimentais (novos)** — os 7 modelos pedidos, cada um com label amigável e hint curto explicando o trade-off (velocidade, custo, força de raciocínio).

**b) Sempre mostrar os recomendados**, mesmo se não estiverem na lista do OpenRouter (hoje filtra por `freeModels.some(...)`). Vou trocar para mostrar todos os recomendados; se o ID não vier na lista do OpenRouter, marca um Badge "não confirmado" mas ainda permite selecionar (o backend tenta e cai no fallback Lovable AI se der erro).

**c) Reorganizar o `<SelectContent>` em três grupos:**
1. Recomendados — Free
2. Recomendados — Premium / Experimentais
3. Outros modelos free (lista filtrada do OpenRouter, como já é hoje)

**d) Mostrar Badge de pricing** (ex: `free`, `pago`) ao lado de cada recomendado, calculado a partir do `pricing` do OpenRouter quando disponível.

### 2. `supabase/functions/tool-chat/index.ts`

- Nenhuma mudança obrigatória de lógica — a chamada ao OpenRouter já é dinâmica via `model` lido de `tool_config`.
- Garantir apenas que o tratamento de erro 402/429/5xx continua caindo para Lovable AI (já existe). Isso protege contra modelos pagos que falhem por falta de créditos no OpenRouter.

### 3. (Opcional) Pequeno aviso visual no card

- Linha discreta abaixo do select: "Modelos premium podem exigir créditos no OpenRouter. Se falharem, a TOOL automaticamente usa o Lovable AI como fallback."

---

## Detalhes técnicos

```ts
const RECOMMENDED_MODELS: { id: string; label: string; hint: string; tier: "free" | "premium" }[] = [
  // Free (mantidos)
  { id: "google/gemma-3-27b-it:free", label: "Gemma 3 27B (free)", hint: "Padrão. Mais capaz da família Gemma free.", tier: "free" },
  { id: "google/gemma-3-12b-it:free", label: "Gemma 3 12B (free)", hint: "Mais rápido, qualidade ainda boa.", tier: "free" },
  { id: "google/gemma-3-4b-it:free", label: "Gemma 3 4B (free)", hint: "Bem rápido, respostas mais simples.", tier: "free" },
  { id: "google/gemma-3n-e4b-it:free", label: "Gemma 3n E4B (free)", hint: "Variante eficiente da família 3n.", tier: "free" },
  // Premium / experimentais (novos)
  { id: "google/gemma-4-31b-it", label: "Gemma 4 31B", hint: "Próxima geração Gemma, raciocínio mais forte.", tier: "premium" },
  { id: "google/gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite (preview)", hint: "Rápido e barato, bom para respostas curtas.", tier: "premium" },
  { id: "anthropic/claude-3-haiku", label: "Claude 3 Haiku", hint: "Anthropic — leve, conciso, ótimo custo-benefício.", tier: "premium" },
  { id: "deepseek/deepseek-v4-flash", label: "DeepSeek V4 Flash", hint: "Bom em raciocínio técnico, rápido.", tier: "premium" },
  { id: "x-ai/grok-4.1-fast", label: "Grok 4.1 Fast", hint: "xAI — respostas diretas, baixa latência.", tier: "premium" },
  { id: "openai/gpt-4.1-nano", label: "GPT-4.1 Nano", hint: "OpenAI — barato e ágil, ideal para Q&A simples.", tier: "premium" },
  { id: "xiaomi/mimo-v2.5", label: "MiMo v2.5", hint: "Xiaomi — multilíngue, experimental.", tier: "premium" },
];
```

Render dos grupos (pseudo):

```tsx
<SelectGroup>
  <SelectLabel>Recomendados — Free</SelectLabel>
  {recommendedFree.map(...)}
</SelectGroup>
<SelectGroup>
  <SelectLabel>Recomendados — Premium</SelectLabel>
  {recommendedPremium.map(r => (
    <SelectItem value={r.id}>
      {r.label} <Badge>{availableInOR ? "ok" : "não confirmado"}</Badge>
    </SelectItem>
  ))}
</SelectGroup>
<SelectGroup>
  <SelectLabel>Outros modelos free</SelectLabel>
  {otherFree.map(...)}
</SelectGroup>
```

---

## Fora do escopo

- Não vou validar antecipadamente no OpenRouter se cada ID realmente existe — o admin pode salvar, e se o modelo não for reconhecido o backend já cai no Lovable AI via tratamento de erro.
- Não vou alterar o fallback (continua `google/gemini-3-flash-preview`).
- Não vou mexer no RAG, ingestão de documentos nem chat panel.