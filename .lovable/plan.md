
# Plano — 5 Recursos de IA na Plataforma

Vamos integrar IA dentro do fluxo das 5 calculadoras + vitrine + comparador. Tudo sob demanda (botão), usando **Lovable AI Gateway** (sem nova API key) com `google/gemini-3-flash-preview` (rápido e barato).

---

## 1. Auto-preenchimento por descrição (todas as 5 calculadoras)

**Onde:** botão "✨ Preencher com IA" no topo de cada página: `Simulador`, `Permuta`, `HighestBestUse`, `Decisor`, `PrecoTeto`.

**Fluxo:**
1. Usuário clica → abre modal com `Textarea` ("Cole o anúncio, descreva o imóvel ou cenário…").
2. Frontend chama edge function `tool-autofill` enviando `{ tool: 'simulador', description: '...' }`.
3. Edge function usa **tool calling** (structured output) com schema específico de cada calculadora → retorna JSON tipado com os campos.
4. Frontend faz merge no estado da calculadora e mostra toast "Campos preenchidos. Revise antes de calcular."

**Schemas:** um por ferramenta, mapeando exatamente os inputs já existentes em cada `pages/<Tool>.tsx` (ex.: `purchasePrice`, `renovationCost`, `units[].monthlyRent`, etc.).

---

## 2. Análise crítica dos resultados (todas as 5)

**Onde:** card "Parecer da IA" logo abaixo dos KPIs, no painel direito (`ToolLayout` rightPanel).

**Fluxo:**
1. Após calcular, aparece botão "Gerar análise IA" (sob demanda).
2. Frontend envia `inputs + results + tool` para edge function `tool-analyze`.
3. IA retorna texto markdown estruturado: **Pontos fortes**, **Riscos**, **Recomendações** (3-5 bullets cada).
4. Render com `react-markdown` (já usado no `ToolMessage.tsx`).
5. Cache local em `useState` — não regera a menos que usuário clique de novo ou mude inputs.

---

## 4. Gerador de copy da vitrine

**Onde:** dialog/sheet de publicação na vitrine (onde hoje setam `vitrine_title` e `vitrine_description` em `toolbox_projects`).

**Fluxo:**
1. Botão "✨ Gerar com IA" ao lado dos campos de título/descrição.
2. Envia `name + project_type + results principais` para edge function `tool-vitrine-copy`.
3. IA retorna `{ title: string (max 80 chars), description: string (max 240 chars) }` via structured output.
4. Preenche os campos; usuário pode editar antes de salvar.

---

## 5. Resumo executivo no PDF (todas as 5)

**Onde:** opção "Incluir resumo executivo IA" no diálogo de exportação PDF (ou checkbox).

**Fluxo:**
1. Antes de gerar o PDF, se marcado, chama edge function `tool-pdf-summary` com `inputs + results + tool`.
2. IA retorna parágrafo único profissional (~120 palavras) em PT-BR formal, tom de relatório de consultoria.
3. `pdfExport.ts` ganha nova `PDFSection` tipo `'executive-summary'` que renderiza o texto em destaque na primeira página, abaixo do título e antes dos KPIs.

---

## 6. Comparador inteligente de projetos

**Onde:** página `/compare` (`src/pages/CompareProjects.tsx`), acima da tabela.

**Fluxo:**
1. Botão "Gerar parecer comparativo IA".
2. Envia array de projetos (nome, inputs principais, métricas-chave) para edge function `tool-compare`.
3. IA retorna análise em markdown: **Vencedor recomendado**, **Justificativa**, **Trade-offs de cada opção**.
4. Render acima da tabela com `react-markdown`.

---

## Detalhes técnicos

**Edge functions novas (5):**
- `supabase/functions/tool-autofill/index.ts`
- `supabase/functions/tool-analyze/index.ts`
- `supabase/functions/tool-vitrine-copy/index.ts`
- `supabase/functions/tool-pdf-summary/index.ts`
- `supabase/functions/tool-compare/index.ts`

Cada função segue o mesmo padrão do `tool-chat/index.ts` já existente:
- CORS + validação Zod do payload
- Auth: validar JWT, exigir `profiles.approved = true`
- Rate limiting compartilhado via tabela `tool_chat_usage` (mesma que já criamos) — todas as chamadas IA contam no mesmo bucket
- Limite de payload (50k chars)
- Chamada ao **Lovable AI Gateway** (`https://ai.gateway.lovable.dev/v1/chat/completions`) com `LOVABLE_API_KEY`
- Tratamento de 429 (rate limit) e 402 (créditos esgotados) → toast amigável no frontend
- Para #1, #4, #5: **tool calling** com schema JSON estrito para garantir output parseável

**Frontend — componentes novos:**
- `src/components/ai/AutoFillButton.tsx` — botão + modal genérico, recebe `tool` e `onFill(data)`
- `src/components/ai/AIAnalysisCard.tsx` — card "Parecer da IA" reutilizável com loading/error states
- `src/components/ai/AIVitrineCopyButton.tsx` — botão pequeno ao lado dos inputs da vitrine
- `src/components/ai/AICompareInsight.tsx` — bloco markdown no topo do comparador

**Frontend — alterações:**
- 5 páginas de calculadora: adicionar `<AutoFillButton>` no topo + `<AIAnalysisCard>` no painel direito
- Diálogo da vitrine (precisa localizar — provável em `Dashboard.tsx` ou componente próprio): adicionar botão de copy
- Diálogo/lógica de export PDF: checkbox + chamada à função
- `src/lib/pdfExport.ts`: novo `PDFSection` tipo `'executive-summary'`
- `src/pages/CompareProjects.tsx`: bloco de insight no topo

**Modelo padrão:** `google/gemini-3-flash-preview` (rápido, ~3x mais barato que pro). Para #6 (comparador), avaliar usar `google/gemini-2.5-pro` se quiser análise mais nuançada — fica configurável.

**UX comum a todos os botões:**
- Loading com spinner + texto "Gerando…"
- Botão fica disabled durante geração
- Erros 429/402 → toast claro ("Limite de uso atingido, tente em alguns minutos" / "Créditos da plataforma esgotados, contate o admin")
- Animação `animate-fade-up` ao revelar resultado (consistente com o resto do app)

**Sem mudanças de schema** — não precisa de migration. Reaproveita `tool_chat_usage` para rate limiting.

---

## Ordem de entrega sugerida

Posso fazer tudo numa tacada só, mas se preferir em ondas:
1. **Onda 1 (maior impacto):** #1 Auto-preenchimento + #2 Análise crítica nas 5 calculadoras
2. **Onda 2:** #4 Copy da vitrine + #5 Resumo PDF
3. **Onda 3:** #6 Comparador inteligente

Aprove o plano e eu implemento. Se quiser entregar em ondas, me diga; caso contrário faço tudo de uma vez.
