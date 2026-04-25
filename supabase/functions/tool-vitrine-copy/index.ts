// tool-vitrine-copy — Gera título e descrição comerciais para a vitrine
// pública a partir do projeto.
//
// POST /functions/v1/tool-vitrine-copy
// body: { tool: string, projectName: string, inputs: object, results: object }
// resposta: { title: string, description: string }

import { z } from "https://esm.sh/zod@3.23.8";
import {
  callLovableAI,
  checkAndIncrementRateLimit,
  corsHeaders,
  jsonResponse,
  validateAuthAndApproved,
  AIToolDef,
} from "../_shared/ai-helpers.ts";

const BodySchema = z.object({
  tool: z.enum(["simulador", "permuta", "hbu", "decisor", "preco_teto"]),
  projectName: z.string().min(1).max(200),
  inputs: z.record(z.unknown()),
  results: z.record(z.unknown()),
});

const COPY_TOOL: AIToolDef = {
  name: "vitrine_copy",
  description: "Gera título e descrição para um card da vitrine pública.",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Título atrativo de até 80 caracteres. Sem ponto final. Sem aspas.",
      },
      description: {
        type: "string",
        description: "Descrição comercial de até 240 caracteres, em 1-2 frases. Destacar o KPI principal e o tipo de oportunidade.",
      },
    },
    required: ["title", "description"],
    additionalProperties: false,
  },
};

const TOOL_LABELS: Record<string, string> = {
  simulador: "Simulador de Viabilidade",
  permuta: "Permuta",
  hbu: "Highest & Best Use",
  decisor: "Decisor Go/No-Go",
  preco_teto: "Preço Teto",
};

const SYSTEM_PROMPT = `Você é um copywriter imobiliário da Setter Realty escrevendo para
investidores qualificados que navegam a "Vitrine de Simulações" do Setter Toolbox.

Recebe os dados de um projeto e gera:
1. TÍTULO (até 80 chars): atrativo, específico, com o número-chave quando possível.
   Exemplos bons: "Sala comercial premium · Cap 0,72% a.m." ou
   "Permuta vence venda em R$ 1,8M (VPL)".
2. DESCRIÇÃO (até 240 chars): 1-2 frases destacando o tipo de oportunidade,
   um KPI relevante e o que torna o caso interessante.

REGRAS:
- Português brasileiro, tom profissional mas direto.
- SEM emojis. SEM hashtags. SEM "!".
- SEM aspas no início ou fim. SEM ponto no fim do título.
- NUNCA invente dados — só use o que está nos inputs/resultados.
- Use percentuais e R$ formatados (ex: "R$ 1,8M", "0,68% a.m.").
- Chame OBRIGATORIAMENTE a tool vitrine_copy.`;

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
NOME DO PROJETO: ${projectName}

INPUTS:
${JSON.stringify(inputs, null, 2)}

RESULTADOS:
${JSON.stringify(results, null, 2)}

Gere o copy chamando a tool vitrine_copy.`;

    const result = await callLovableAI({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      tool: COPY_TOOL,
    });

    if (!result.ok) return result.response;

    const args = result.data.toolArgs ?? {};
    const title = String(args.title ?? "").slice(0, 80).replace(/^["'`]|["'`]$/g, "").trim();
    const description = String(args.description ?? "").slice(0, 240).replace(/^["'`]|["'`]$/g, "").trim();

    return jsonResponse({ title, description });
  } catch (e) {
    console.error("tool-vitrine-copy erro:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Erro desconhecido" },
      500,
    );
  }
});
