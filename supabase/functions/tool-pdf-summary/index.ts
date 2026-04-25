// tool-pdf-summary — Gera um resumo executivo curto (parágrafo único, ~120
// palavras) para ser inserido na primeira página do PDF.
//
// POST /functions/v1/tool-pdf-summary
// body: { tool: string, projectName?: string, inputs: object, results: object }
// resposta: { summary: string }

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
  permuta: "Permuta",
  hbu: "Highest & Best Use",
  decisor: "Decisor Go/No-Go",
  preco_teto: "Preço Teto",
};

const SYSTEM_PROMPT = `Você é consultor de investimentos imobiliários da Setter Realty escrevendo
o RESUMO EXECUTIVO (parágrafo único) que abre um relatório em PDF entregue
ao cliente final.

REGRAS RÍGIDAS:
- Exatamente 1 parágrafo (sem listas, sem títulos, sem bullets).
- 100 a 140 palavras.
- Português brasileiro formal, tom de consultoria executiva (não vendedor).
- Comece descrevendo a operação analisada e seu objetivo.
- Cite 2-3 KPIs-chave com números reais (Cap Rate, NOI, TIR, VPL, Strike, Veredito).
- Termine com uma recomendação prudente (1 frase) — sem garantir resultado.
- SEM emojis. SEM aspas. SEM markdown. Texto plano que será impresso.
- NUNCA invente valores — use apenas o que está nos inputs/resultados.`;

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
      return jsonResponse({ error: "Payload inválido." }, 400);
    }

    const { tool, projectName, inputs, results } = parsed.data;
    const toolLabel = TOOL_LABELS[tool] ?? tool;

    const userPrompt = `FERRAMENTA: ${toolLabel}
PROJETO: ${projectName ?? "(sem nome)"}

INPUTS:
${JSON.stringify(inputs, null, 2)}

RESULTADOS:
${JSON.stringify(results, null, 2)}

Escreva o resumo executivo seguindo as regras.`;

    const result = await callLovableAI({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    if (!result.ok) return result.response;

    // Limpa markdown leve caso a IA escape
    const summary = (result.data.text ?? "")
      .replace(/[*_`#>]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return jsonResponse({ summary });
  } catch (e) {
    console.error("tool-pdf-summary erro:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Erro desconhecido" },
      500,
    );
  }
});
