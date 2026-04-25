// tool-autofill — Recebe descrição em linguagem natural e devolve JSON
// estruturado para popular os campos de uma calculadora.
//
// POST /functions/v1/tool-autofill
// body: { tool: "simulador" | "permuta" | "hbu" | "decisor" | "preco_teto", description: string }
// resposta: { fields: <objeto com campos da calculadora> }

import { z } from "https://esm.sh/zod@3.23.8";
import {
  callLovableAI,
  checkAndIncrementRateLimit,
  corsHeaders,
  jsonResponse,
  validateAuthAndApproved,
  AIToolDef,
} from "../_shared/ai-helpers.ts";

const ToolEnum = z.enum(["simulador", "permuta", "hbu", "decisor", "preco_teto"]);

const BodySchema = z.object({
  tool: ToolEnum,
  description: z.string().min(20).max(8000),
});

type ToolName = z.infer<typeof ToolEnum>;

// ─── Schemas de saída por calculadora ─────────────────────────────────
// Os campos espelham os inputs reais usados nas páginas src/pages/<Tool>.tsx.
// Todos os campos são opcionais para permitir preenchimento parcial.

const SIMULADOR_TOOL: AIToolDef = {
  name: "fill_simulador",
  description: "Preenche os campos da calculadora Simulador de Viabilidade.",
  parameters: {
    type: "object",
    properties: {
      projectName: { type: "string", description: "Nome curto do projeto/imóvel." },
      purchasePrice: { type: "number", description: "Preço de compra em R$." },
      closingCosts: { type: "number", description: "Custos de fechamento em fração (0.05 = 5%)." },
      builtArea: { type: "number", description: "Área construída em m²." },
      costPerSqm: { type: "number", description: "Custo de construção/reforma por m² em R$." },
      hasTurnkey: { type: "boolean", description: "Tem turnkey? (custo fixo adicional)" },
      turnkeyCost: { type: "number", description: "Custo do turnkey em R$, se aplicável." },
      vacancyRate: { type: "number", description: "Vacância em fração (0.05 = 5%)." },
      propertyTax: { type: "number", description: "IPTU mensal em R$." },
      condoFee: { type: "number", description: "Condomínio mensal em R$." },
      managementFee: { type: "number", description: "Taxa de administração em fração (0.08 = 8%)." },
      holdingPeriod: { type: "integer", description: "Horizonte de análise em anos (1-30)." },
      exitCapRate: { type: "number", description: "Cap rate de saída em fração anual." },
      discountRate: { type: "number", description: "Taxa de desconto em fração anual." },
      rentalUnits: {
        type: "array",
        description: "Lista de unidades locáveis. Pode ter 1 ou várias.",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            monthlyRent: { type: "number", description: "Aluguel mensal em R$." },
          },
          required: ["name", "monthlyRent"],
        },
      },
    },
    additionalProperties: false,
  },
};

const PERMUTA_TOOL: AIToolDef = {
  name: "fill_permuta",
  description: "Preenche os campos da calculadora Permuta (Vender vs Permutar).",
  parameters: {
    type: "object",
    properties: {
      projectName: { type: "string" },
      cashOffer: { type: "number", description: "Valor à vista oferecido pela construtora em R$." },
      futureUnitsValue: { type: "number", description: "Valor total das unidades futuras em R$." },
      deliveryYears: { type: "number", description: "Prazo de entrega das unidades em anos." },
      discountRate: { type: "number", description: "Taxa de desconto anual em fração." },
      carryingCostsMonthly: { type: "number", description: "Custos de carregamento mensais (IPTU, condomínio, etc.) em R$." },
    },
    additionalProperties: false,
  },
};

const HBU_TOOL: AIToolDef = {
  name: "fill_hbu",
  description: "Preenche os campos da calculadora Highest & Best Use (Residencial vs Comercial vs Híbrido).",
  parameters: {
    type: "object",
    properties: {
      projectName: { type: "string" },
      landPrice: { type: "number", description: "Preço do terreno em R$." },
      buildableArea: { type: "number", description: "Área construível em m²." },
      constructionCostPerSqm: { type: "number", description: "Custo de construção por m² em R$." },
      residentialSalePrice: { type: "number", description: "Preço de venda residencial por m² em R$." },
      commercialMonthlyRent: { type: "number", description: "Aluguel comercial mensal por m² em R$." },
      commercialCapRate: { type: "number", description: "Cap rate comercial alvo em fração anual." },
      discountRate: { type: "number", description: "Taxa de desconto anual em fração." },
      holdingPeriod: { type: "integer", description: "Horizonte em anos." },
    },
    additionalProperties: false,
  },
};

const DECISOR_TOOL: AIToolDef = {
  name: "fill_decisor",
  description: "Preenche os campos da calculadora Decisor Go/No-Go.",
  parameters: {
    type: "object",
    properties: {
      projectName: { type: "string" },
      askingPrice: { type: "number", description: "Preço pedido pelo vendedor em R$." },
      grossMonthlyRent: { type: "number", description: "Receita bruta mensal em R$." },
      vacancyRate: { type: "number", description: "Vacância em fração." },
      propertyTax: { type: "number", description: "IPTU mensal em R$." },
      condoFee: { type: "number", description: "Condomínio mensal em R$." },
      maintenance: { type: "number", description: "Manutenção mensal em R$." },
      insurance: { type: "number", description: "Seguro mensal em R$." },
      managementFee: { type: "number", description: "Taxa de administração em fração." },
      targetMonthlyCapRate: { type: "number", description: "Cap rate mensal alvo em fração (0.0055 = 0,55%)." },
      safetyMargin: { type: "number", description: "Margem de segurança em fração (0.05 = 5%)." },
    },
    additionalProperties: false,
  },
};

const PRECO_TETO_TOOL: AIToolDef = {
  name: "fill_preco_teto",
  description: "Preenche os campos da calculadora Preço Teto.",
  parameters: {
    type: "object",
    properties: {
      projectName: { type: "string" },
      grossMonthlyRent: { type: "number", description: "Receita bruta mensal em R$." },
      vacancyRate: { type: "number", description: "Vacância em fração." },
      propertyTax: { type: "number", description: "IPTU mensal em R$." },
      condoFee: { type: "number", description: "Condomínio mensal em R$." },
      maintenance: { type: "number", description: "Manutenção mensal em R$." },
      insurance: { type: "number", description: "Seguro mensal em R$." },
      managementFee: { type: "number", description: "Taxa de administração em fração." },
      targetCapRate: { type: "number", description: "Cap rate alvo em fração (anual ou mensal — informar contexto)." },
      capRateBasis: { type: "string", enum: ["monthly", "annual"], description: "Base do cap rate alvo." },
      area: { type: "number", description: "Área em m² (opcional)." },
      marketPrice: { type: "number", description: "Preço de mercado para comparação (opcional)." },
    },
    additionalProperties: false,
  },
};

const TOOL_MAP: Record<ToolName, AIToolDef> = {
  simulador: SIMULADOR_TOOL,
  permuta: PERMUTA_TOOL,
  hbu: HBU_TOOL,
  decisor: DECISOR_TOOL,
  preco_teto: PRECO_TETO_TOOL,
};

const SYSTEM_PROMPT = `Você é um extrator de dados imobiliários para o Setter Toolbox.
Sua tarefa: ler uma descrição em português (anúncio, briefing, conversa) e
extrair valores numéricos para preencher uma calculadora.

REGRAS RÍGIDAS:
- SEMPRE chame a tool fornecida com os campos que conseguir extrair.
- NUNCA invente valores. Se um campo não está claro no texto, OMITA-O.
- Converta percentuais em frações: "5%" → 0.05.
- Converta moeda em número puro em reais: "R$ 1,5 mi" → 1500000, "R$ 850 mil" → 850000, "R$ 9,5k/mês" → 9500.
- Cap rates: se o texto disser "0,55% a.m.", retorne 0.0055. Se disser "8% a.a.", retorne 0.08.
- Área: extrair em m² (números puros).
- Preserve nomes próprios (bairro, rua) no projectName quando relevante.
- Se a descrição menciona múltiplas unidades locáveis no Simulador, popule rentalUnits com 1 entrada por unidade.
- Em caso de ambiguidade entre 2 valores plausíveis, escolha o mais conservador (menor receita, maior custo).`;

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

    const { tool, description } = parsed.data;
    const toolDef = TOOL_MAP[tool];

    const result = await callLovableAI({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `CALCULADORA: ${tool}\n\nDESCRIÇÃO:\n${description}`,
      tool: toolDef,
    });

    if (!result.ok) return result.response;

    return jsonResponse({ fields: result.data.toolArgs ?? {} });
  } catch (e) {
    console.error("tool-autofill erro:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Erro desconhecido" },
      500,
    );
  }
});
