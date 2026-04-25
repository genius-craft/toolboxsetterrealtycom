// tool-compare — Gera parecer comparativo (markdown) entre 2-5 projetos do
// mesmo tipo, exibido na página /compare.
//
// POST /functions/v1/tool-compare
// body: { tool: string, projects: [{ name, inputs, results }] }
// resposta: { insight: string (markdown) }

import { z } from "https://esm.sh/zod@3.23.8";
import {
  callLovableAI,
  checkAndIncrementRateLimit,
  corsHeaders,
  jsonResponse,
  validateAuthAndApproved,
} from "../_shared/ai-helpers.ts";

const ProjectSchema = z.object({
  name: z.string().min(1).max(200),
  inputs: z.record(z.unknown()),
  results: z.record(z.unknown()),
});

const BodySchema = z.object({
  tool: z.enum(["simulador", "permuta", "hbu", "decisor", "preco_teto"]),
  projects: z.array(ProjectSchema).min(2).max(5),
});

const TOOL_LABELS: Record<string, string> = {
  simulador: "Simulador de Viabilidade",
  permuta: "Permuta",
  hbu: "Highest & Best Use",
  decisor: "Decisor Go/No-Go",
  preco_teto: "Preço Teto",
};

const SYSTEM_PROMPT = `Você é um analista sênior comparando 2-5 projetos imobiliários do
Setter Toolbox. Sua tarefa: produzir um PARECER COMPARATIVO em markdown.

ESTRUTURA OBRIGATÓRIA:
**Vencedor recomendado:** <nome do projeto> — em 1 frase, por quê.

**Justificativa quantitativa**
- 3 a 4 bullets citando os números que diferenciam o vencedor (Cap Rate,
  TIR, VPL, NOI, Payback, Strike, Score, etc.).

**Trade-offs de cada projeto**
- Para cada projeto, 1 bullet com o principal trade-off (ponto forte vs risco).

**Próximos passos**
- 1 a 2 ações concretas (ex: refinar premissa X no projeto Y, comparar com
  cenário alternativo, verificar vacância real do mercado).

REGRAS:
- Máximo 400 palavras totais.
- Português brasileiro, tom de relatório de consultoria.
- Use os números reais. NÃO invente.
- Se 2 projetos estão tecnicamente empatados, diga e justifique a escolha.
- NÃO inclua disclaimer no final.`;

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

    const { tool, projects } = parsed.data;
    const toolLabel = TOOL_LABELS[tool] ?? tool;

    const blocks = projects
      .map(
        (p, i) =>
          `═══ Projeto ${i + 1}: ${p.name} ═══
INPUTS:
${JSON.stringify(p.inputs, null, 2)}

RESULTADOS:
${JSON.stringify(p.results, null, 2)}`,
      )
      .join("\n\n");

    const userPrompt = `FERRAMENTA: ${toolLabel}
QUANTIDADE DE PROJETOS: ${projects.length}

${blocks}

Gere o parecer comparativo seguindo a estrutura.`;

    const result = await callLovableAI({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
    });

    if (!result.ok) return result.response;

    return jsonResponse({ insight: result.data.text ?? "" });
  } catch (e) {
    console.error("tool-compare erro:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Erro desconhecido" },
      500,
    );
  }
});
