// TOOL — assistente do Setter Toolbox
// Provedor primário: OpenRouter (google/gemma-2-9b-it:free)
// Fallback: Lovable AI Gateway (google/gemini-3-flash-preview)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "x-ai-provider",
};

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});
const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
});

const BASE_KNOWLEDGE = `
SETTER TOOLBOX — VISÃO GERAL
Plataforma de análises imobiliárias da Setter Realty. Cinco calculadoras + recursos de gestão (Dashboard, Vitrine, Versões, Comparação).

CALCULADORAS:

1) SIMULADOR DE INCORPORAÇÃO (/simulador)
   Para que serve: avaliar viabilidade financeira de um empreendimento ou aquisição com receita de aluguel. Suporta múltiplas unidades (multi-tenant).
   Inputs principais: preço de aquisição, CAPEX (m²), múltiplas unidades de aluguel, vacância, taxa de administração (sobre receita efetiva), IPTU, manutenção, seguro.
   Saídas: Cap Rate Mensal (foco da plataforma), NOI, GAV, payback. PDF executivo de uma página.

2) PERMUTA (/permuta)
   Para que serve: comparar "Vender Agora" (oferta à vista) vs "Parceria" (unidades futuras).
   Score 0–100 indica qual cenário é melhor considerando VPL futuro, risco e prazo.

3) HIGHEST & BEST USE (/highest-best-use)
   Para que serve: descobrir o melhor uso de um terreno/imóvel comparando 3 cenários: Residencial (venda), Comercial (locação), Híbrido.
   Compara IRR, VPL e Cap Rate dos três e recomenda o vencedor.

4) DECISOR GO/NO-GO (/decisor)
   Para que serve: validar se vale a pena fazer uma oferta. Compara o "Preço Pedido" contra um "Strike Price" derivado do Cap Rate alvo.
   Saída: GO (verde) se preço ≤ strike; NO-GO (vermelho) caso contrário; com margem de segurança.

5) PREÇO TETO (/preco-teto)
   Para que serve: calcular o preço máximo a pagar por um imóvel para atingir uma meta de Cap Rate.
   Fórmula: Preço Teto = NOI Anual / Cap Rate Alvo.

CONCEITOS-CHAVE:
- Cap Rate = NOI ÷ Valor do imóvel. A plataforma exibe SEMPRE o Cap Rate MENSAL (NOI mensal ÷ preço).
- NOI (Net Operating Income) = Receita Efetiva − Despesas Operacionais (IPTU, condomínio, manutenção, seguro, taxa adm).
- Receita Efetiva = Receita Bruta × (1 − vacância).
- Taxa de administração incide sobre a Receita Efetiva (não sobre a bruta).
- VPL/NPV: valor presente líquido dos fluxos futuros descontados a uma taxa.
- TIR/IRR: taxa interna de retorno do projeto.

RECURSOS DA PLATAFORMA:
- Salvar projeto: cada calculadora permite nomear e salvar; aparece no Dashboard.
- Histórico de versões: até 20 snapshots automáticos por projeto, acessível pelo botão de relógio.
- Comparar projetos: rota /comparar coloca dois projetos lado a lado.
- Vitrine: projetos marcados como "vitrine" aparecem na página pública /vitrine.
- Botão WhatsApp: fala direto com especialista (+55 19 97122-3648).
- PDF: cada ferramenta exporta relatório com identidade visual Setter (dourado #B8923C / preto).

DISCLAIMER: as ferramentas são educacionais. Não constituem oferta, recomendação de investimento, conselho jurídico ou tributário.
`;

function buildSystemPrompt(extraKnowledge: string): string {
  return `Você é TOOL, a assistente oficial do Setter Toolbox — plataforma de análises imobiliárias da Setter Realty.

Sua missão é ajudar corretores, analistas e investidores a usar as calculadoras (Simulador, Permuta, H&BU, Decisor, Preço Teto), entender conceitos financeiros e dominar os fluxos da plataforma.

REGRAS:
- Responda em português brasileiro, direta e amigável.
- Sempre cite a calculadora ou seção relevante quando fizer sentido.
- Use markdown para listas, negrito e títulos. Seja concisa — evite respostas longas demais.
- Se a pergunta exigir dado que não está no seu conhecimento, diga honestamente e oriente onde a pessoa pode descobrir (ex: tooltip do campo, link).
- Nunca dê conselho jurídico ou tributário definitivo. Sempre lembre o caráter educacional da ferramenta quando fizer recomendações.
- Se a pergunta for completamente fora do tema (ex: política, fofoca, código), redirecione gentilmente: "Sou especialista no Setter Toolbox — posso te ajudar com algo das calculadoras ou da plataforma?".

CONHECIMENTO BASE DA PLATAFORMA:
${BASE_KNOWLEDGE}

${extraKnowledge ? `CONHECIMENTO ADICIONAL (carregado pelo admin):\n${extraKnowledge}` : ""}`;
}

async function callOpenRouter(messages: any[]) {
  const key = Deno.env.get("OPENROUTER_API_KEY");
  if (!key) throw new Error("OPENROUTER_API_KEY missing");
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://toolbox.setterrealty.com",
      "X-Title": "Setter Toolbox - TOOL",
    },
    body: JSON.stringify({
      model: "google/gemma-2-9b-it:free",
      messages,
      stream: true,
    }),
  });
}

async function callLovable(messages: any[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      stream: true,
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Mensagens inválidas." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { messages } = parsed.data;

    // RAG simples: full-text search dos chunks usando service role (bypass RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    let extraKnowledge = "";
    if (lastUser) {
      const query = lastUser.content.slice(0, 500);
      const { data, error } = await admin.rpc("tool_search_chunks" as any, {
        q: query,
      }).then((r) => r, () => ({ data: null, error: null }));

      let chunks: { content: string }[] | null = null;
      if (data && Array.isArray(data)) {
        chunks = data as any;
      } else {
        // Fallback: query direta (sem RPC) usando websearch_to_tsquery
        const { data: rows } = await admin
          .from("tool_knowledge_chunks")
          .select("content, document_id, tool_knowledge_documents!inner(enabled)")
          .eq("tool_knowledge_documents.enabled", true)
          .textSearch("content_tsv", query, { type: "websearch", config: "portuguese" })
          .limit(6);
        chunks = (rows as any) || [];
      }

      if (chunks && chunks.length > 0) {
        extraKnowledge = chunks
          .map((c: any, i: number) => `[Trecho ${i + 1}]\n${c.content}`)
          .join("\n\n")
          .slice(0, 6000);
      }
    }

    const systemPrompt = buildSystemPrompt(extraKnowledge);
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Tenta OpenRouter primeiro
    let provider = "openrouter";
    let resp: Response | null = null;
    try {
      resp = await callOpenRouter(aiMessages);
      if (!resp.ok) {
        const status = resp.status;
        if ([402, 429, 500, 502, 503, 504].includes(status)) {
          console.log(`OpenRouter falhou com ${status}, caindo para Lovable AI`);
          throw new Error(`OpenRouter status ${status}`);
        }
        // Outro erro — surface
        const txt = await resp.text();
        console.error("OpenRouter erro não-recuperável:", status, txt);
        return new Response(
          JSON.stringify({ error: "Erro no provedor primário." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } catch (e) {
      console.log("Fallback para Lovable AI:", (e as Error).message);
      provider = "lovable";
      try {
        resp = await callLovable(aiMessages);
      } catch (e2) {
        return new Response(
          JSON.stringify({ error: "Ambos os provedores indisponíveis. Tente novamente em instantes." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (!resp.ok) {
        if (resp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Limite de uso temporariamente atingido. Tente novamente em instantes." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (resp.status === 402) {
          return new Response(
            JSON.stringify({ error: "Créditos esgotados no fallback. Avise o admin para recarregar." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        const txt = await resp.text();
        console.error("Lovable AI erro:", resp.status, txt);
        return new Response(
          JSON.stringify({ error: "Erro no provedor de fallback." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(resp!.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "x-ai-provider": provider,
      },
    });
  } catch (e) {
    console.error("tool-chat erro:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
