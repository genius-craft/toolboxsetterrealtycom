// tool-analyze — Gera parecer crítico (markdown) sobre os resultados de uma
// calculadora. Sob demanda (botão "Gerar análise IA").
//
// POST /functions/v1/tool-analyze
// body: { tool: string, projectName?: string, inputs: object, results: object }
// resposta: { analysis: string (markdown) }

import { z } from "https://esm.sh/zod@3.23.8";
import {
  callLovableAI,
  checkAndIncrementRateLimit,
  corsHeaders,
  jsonResponse,
  validateAuthAndApproved,
} from "../_shared/ai-helpers.ts";

const BodySchema = z.object({
  tool: z.enum(["simulador", "permuta", "hbu", "decisor", "preco_teto"]),
  projectName: z.string().max(200).optional(),
  inputs: z.record(z.unknown()),
  results: z.record(z.unknown()),
});

const TOOL_LABELS: Record<string, string> = {
  simulador: "Simulador de Viabilidade",
  permuta: "Permuta (Vender vs Permutar)",
  hbu: "Highest & Best Use",
  decisor: "Decisor Go/No-Go",
  preco_teto: "Preço Teto",
};

const SYSTEM_PROMPT = `Você é um analista sênior de investimentos imobiliários da Setter Realty.
Recebe os inputs e resultados de uma calculadora do Setter Toolbox e produz
um PARECER CRÍTICO objetivo, em português brasileiro, formato markdown.

ESTRUTURA OBRIGATÓRIA da resposta:
**Pontos fortes** (3-5 bullets curtos)
**Riscos / Pontos de atenção** (3-5 bullets curtos)
**Recomendações práticas** (3-5 bullets curtos, acionáveis)

REGRAS:
- Máximo 350 palavras no total.
- Use os números reais dos resultados (Cap Rate, NOI, TIR, VPL, Strike, etc.).
- Compare com referências de mercado brasileiro quando relevante:
  • Cap Rate residencial saudável: 0,5%–0,7% a.m. (6–8,5% a.a.)
  • Cap Rate comercial: 0,7%–1,0% a.m. (8,5%–12% a.a.)
  • TIR atrativa em RE: > 15% a.a.
  • Vacância realista: 5%–10% (residencial), 8%–15% (comercial)
- Sinalize premissas otimistas (ex: vacância < 5%, cap rate de saída < entrada, growth alto).
- NUNCA dê conselho jurídico/tributário. Se a tese for fraca, diga.
- NÃO inclua disclaimer no final — o frontend já mostra um.
- Tom: profissional, direto, sem jargão excessivo. Trate por "você".`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await validateAuthAndApproved(req);
    if (!auth.ok) return auth.response;

    const rl = await checkAndIncrementRateLimit(auth.ctx);
    if (!rl.ok) return rl.response;

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonResponse({ error: "Payload inválido.", details: parsed.error.flatten() }, 400);
    }

    const { tool, projectName, inputs, results } = parsed.data;
    const toolLabel = TOOL_LABELS[tool] ?? tool;

    const userPrompt = `FERRAMENTA: ${toolLabel}
PROJETO: ${projectName ?? "(sem nome)"}

INPUTS:
${JSON.stringify(inputs, null, 2)}

RESULTADOS:
${JSON.stringify(results, null, 2)}

Gere o parecer crítico seguindo a estrutura definida.`;

    const result = await callLovableAI({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    if (!result.ok) return result.response;

    return jsonResponse({ analysis: result.data.text ?? "" });
  } catch (e) {
    console.error("tool-analyze erro:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Erro desconhecido" },
      500,
    );
  }
});
