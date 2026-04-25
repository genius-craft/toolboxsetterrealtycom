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
      assetName: { type: "string", description: "Nome do ativo/projeto." },
      vendaOferta: { type: "number", description: "Oferta de venda à vista em R$." },
      valorImovelParceria: { type: "number", description: "Valor total do imóvel a ser construído na parceria, em R$." },
      percentualUnidades: { type: "number", description: "Percentual da permuta recebida em unidades (0-100)." },
      aprovacaoMeses: { type: "integer", description: "Meses para aprovação do projeto." },
      construcaoMeses: { type: "integer", description: "Meses para construção." },
      vendaMeses: { type: "integer", description: "Meses para venda das unidades recebidas." },
      taxaDesconto: { type: "number", description: "Taxa de desconto anual em PERCENTUAL (12 = 12%, NÃO 0.12)." },
      precoUnidade: { type: "number", description: "Preço médio por unidade em R$." },
      custoMensalUnidade: { type: "number", description: "Custo mensal de carrego por unidade em R$ (IPTU+condomínio)." },
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
      landArea: { type: "number", description: "Área do terreno em m²." },
      far: { type: "number", description: "Coeficiente de aproveitamento (FAR), ex: 2 = 2x a área do terreno." },
      occupancyRate: { type: "number", description: "Taxa de ocupação em fração (0.5 = 50%)." },
      location: { type: "string", enum: ["premium", "central", "periferia"], description: "Qualidade da localização." },
      zoning: { type: "string", enum: ["zm", "zc", "zr", "zeis"], description: "Zoneamento (zm=mista, zc=comercial, zr=residencial, zeis=especial)." },
      residencialPricePerSqm: { type: "number", description: "Preço de venda residencial por m² em R$." },
      residencialCostPerSqm: { type: "number", description: "Custo de construção residencial por m² em R$." },
      residencialAbsorptionMonths: { type: "integer", description: "Meses de absorção residencial." },
      comercialPricePerSqm: { type: "number", description: "Preço de venda/aluguel comercial por m² em R$." },
      comercialCostPerSqm: { type: "number", description: "Custo de construção comercial por m² em R$." },
      comercialAbsorptionMonths: { type: "integer", description: "Meses de absorção comercial." },
      discountRate: { type: "number", description: "Taxa de desconto anual em fração (0.15 = 15%)." },
      constructionMonths: { type: "integer", description: "Meses de construção." },
      landCostPremissa: { type: "number", description: "Custo de aquisição do terreno como % do VGV (0.15 = 15%)." },
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
      assetName: { type: "string", description: "Nome do ativo." },
      askingPrice: { type: "number", description: "Preço pedido pelo vendedor em R$." },
      monthlyRent: { type: "number", description: "Receita bruta mensal de aluguel em R$." },
      targetMonthlyCapRate: { type: "number", description: "Cap rate MENSAL alvo em fração (0.0055 = 0,55%)." },
      vacancyRate: { type: "number", description: "Vacância em fração (0.05 = 5%)." },
      condoFee: { type: "number", description: "Condomínio MENSAL em R$." },
      propertyTax: { type: "number", description: "IPTU ANUAL em R$." },
      managementFee: { type: "number", description: "Taxa de administração em fração (0.08 = 8%)." },
      locationQuality: { type: "integer", minimum: 1, maximum: 5, description: "Qualidade da localização (1-5)." },
      tenantRisk: { type: "integer", minimum: 1, maximum: 5, description: "Risco do inquilino, 1=baixo, 5=alto." },
      futureLiquidity: { type: "integer", minimum: 1, maximum: 5, description: "Liquidez futura (1-5)." },
      assetCondition: { type: "integer", minimum: 1, maximum: 5, description: "Condição do ativo (1-5)." },
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
      projectName: { type: "string", description: "Nome curto do projeto." },
      monthlyRent: { type: "number", description: "Aluguel mensal em R$." },
      rentGrowth: { type: "number", description: "Crescimento anual do aluguel em fração (0.04 = 4%)." },
      vacancyRate: { type: "number", description: "Vacância em fração." },
      closingCosts: { type: "number", description: "Custos de fechamento em fração (0.04 = 4%)." },
      constructionCost: { type: "number", description: "Custo de reforma/obra em R$." },
      propertyTax: { type: "number", description: "IPTU ANUAL em R$." },
      condoFee: { type: "number", description: "Condomínio ANUAL em R$." },
      managementFee: { type: "number", description: "Taxa de administração em fração (0.08 = 8%)." },
      targetCapRate: { type: "number", description: "Cap rate ANUAL alvo em fração (0.08 = 8%)." },
      targetIRR: { type: "number", description: "TIR alvo em fração anual (0.15 = 15%)." },
      holdingPeriod: { type: "integer", description: "Horizonte em anos." },
      exitCapRate: { type: "number", description: "Cap rate de saída anual em fração." },
      referencePrice: { type: "number", description: "Preço de mercado pedido (referência), em R$." },
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
