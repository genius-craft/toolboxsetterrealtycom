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
const AttachedDocSchema = z.object({
  filename: z.string().min(1).max(255),
  content: z.string().min(1).max(30_000),
  pageCount: z.number().int().nonnegative().optional(),
});
// NOTA: anexos agora são SEMPRE projetos do próprio sistema (Setter Toolbox),
// nunca PDFs externos. O frontend serializa inputs+results e envia em `content`.
const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  attachedDocuments: z.array(AttachedDocSchema).max(2).optional(),
});

const BASE_KNOWLEDGE = `
═══════════════════════════════════════════════════════════════════
SETTER TOOLBOX — MANUAL OFICIAL DAS CALCULADORAS
═══════════════════════════════════════════════════════════════════

VISÃO GERAL DA PLATAFORMA
Setter Toolbox é uma suíte de análise imobiliária da Setter Realty para
corretores, analistas e investidores. Reúne 5 calculadoras independentes,
todas com salvamento de projetos, histórico de versões (até 20 snapshots),
comparação lado a lado, exportação em PDF e publicação opcional na Vitrine.

Princípios numéricos da plataforma:
- O Cap Rate exibido como KPI principal é SEMPRE MENSAL (NOI mensal ÷ valor do imóvel).
- Receita Efetiva = Receita Bruta × (1 − vacância%).
- A Taxa de Administração incide SEMPRE sobre a Receita Efetiva, nunca sobre a bruta.
- NOI = Receita Efetiva − OPEX (IPTU + condomínio + manutenção + seguro + adm).
- Cap Rate Anual = (NOI mensal × 12) ÷ Valor do imóvel.

═══════════════════════════════════════════════════════════════════
1) SIMULADOR DE INCORPORAÇÃO  →  rota /simulador
═══════════════════════════════════════════════════════════════════

PARA QUE SERVE
Avaliar a viabilidade financeira de um imóvel ou empreendimento que será
adquirido (e eventualmente reformado/construído) para gerar renda recorrente
de aluguel. Suporta MÚLTIPLOS INQUILINOS / unidades em um mesmo ativo
(multi-tenant: ex. um galpão dividido em 3 lojas).

QUANDO USAR
- Comprar um imóvel comercial pronto para alugar.
- Comprar terreno + construir + alugar (incorporação completa).
- Avaliar reforma de imóvel existente para mudança de uso.
- Comparar diferentes premissas de aluguel/CAPEX para um mesmo ativo.

EXEMPLO PRÁTICO
"Vou comprar um galpão por R$ 2.000.000, gastar R$ 800/m² em retrofit em
600 m², e alugar para 2 inquilinos: um a R$ 12.000 e outro a R$ 8.000.
Vale a pena?"

PRINCIPAIS CAMPOS E COMO PREENCHER

• Valor de Aquisição (R$): preço pago pelo imóvel/terreno (sem ITBI ou custos
  de cartório — esses entram como CAPEX).

• CAPEX por m² (R$/m²): custo de construção/reforma. A plataforma calcula
  Total CAPEX = (R$/m²) × (área construída ou área de retrofit).
  - Shell only (estrutura): ~R$ 1.500–2.500/m²
  - Turnkey comercial completo: ~R$ 3.500–5.500/m²
  - Reforma leve: ~R$ 800–1.500/m²

• Unidades (Tenants): adicione quantas quiser. Para cada uma:
  - Nome da unidade (ex: "Loja 1", "Sala 201").
  - Aluguel mensal (R$).
  - Reajuste anual (%): IGPM histórico ~6% a.a.; IPCA ~4,5% a.a.
  - Vacância individual (%): % do ano em que a unidade fica desocupada.

• Taxa de Administração (%): geralmente 8–10% da receita EFETIVA.

• OPEX (Despesas Operacionais mensais):
  - IPTU (mensal): pegar o anual e dividir por 12.
  - Condomínio (se houver).
  - Manutenção: regra prática 0,5–1% do valor do imóvel ÷ 12.
  - Seguro: ~0,15% do valor ÷ 12.

• Horizonte de análise (anos): padrão 10. Usado para projetar fluxos.

KPIs DE SAÍDA (o que olhar)
- Cap Rate Mensal: o número mais importante. Mercado brasileiro:
  · Excelente: > 0,75% a.m. (≈ 9% a.a.)
  · Bom: 0,55–0,75% a.m. (≈ 6,8–9% a.a.)
  · Aceitável: 0,40–0,55% a.m. (≈ 5–6,8% a.a.)
  · Fraco: < 0,40% a.m.
- NOI Anual: renda líquida real depois de OPEX.
- GAV (Gross Asset Value): valor do imóvel pelo NOI capitalizado a um Cap alvo.
- Payback: anos para recuperar o investimento total (aquisição + CAPEX).
- Heatmap de Sensibilidade: mostra como o Cap Rate varia se aluguel ou
  vacância mudarem (5×5).

DICAS DE PREENCHIMENTO
- Se for galpão único, crie 1 unidade só com o aluguel total.
- Para reforma sem CAPEX significativo, deixe R$/m² em 0.
- Vacância realista para BR é 5–15% no comercial; 0–5% no residencial padrão.

═══════════════════════════════════════════════════════════════════
2) PERMUTA  →  rota /permuta
═══════════════════════════════════════════════════════════════════

PARA QUE SERVE
Decidir entre VENDER AGORA o terreno/imóvel por dinheiro à vista versus
fazer PARCERIA com um incorporador, recebendo unidades futuras (permuta
financeira ou física).

QUANDO USAR
- Você é proprietário de um terreno e recebeu duas propostas:
  (a) compra direta por R$ X agora;
  (b) participação de Y% nas unidades quando o empreendimento ficar pronto.
- Quer comparar o VPL das duas opções considerando prazo, risco e
  custo de oportunidade.

EXEMPLO PRÁTICO
"Tenho um terreno valendo R$ 3 mi à vista. O incorporador oferece 25% das
unidades futuras (VGV estimado R$ 24 mi, entrega em 36 meses). Qual é melhor?"

PRINCIPAIS CAMPOS

• Cenário "Vender Agora":
  - Valor da oferta à vista (R$).
  - Custos de venda (corretagem ~6%, IR sobre ganho ~15%).

• Cenário "Parceria":
  - VGV estimado do empreendimento (R$).
  - Percentual do permutante (%): sua fatia das unidades.
  - Prazo até entrega (meses): tempo para receber as unidades.
  - Risco de execução (%): probabilidade subjetiva de o projeto NÃO entregar.
  - Taxa de desconto (% a.a.): custo de oportunidade, geralmente Selic + prêmio.
    · Conservador: 12–14% a.a.
    · Moderado: 14–18% a.a.
    · Agressivo (alto risco): 18–25% a.a.

KPI DE SAÍDA
- Score 0–100: quanto maior, mais vantajosa a Parceria; quanto menor,
  melhor Vender Agora. 50 = empate.
- VPL líquido de cada cenário, lado a lado.
- Recomendação textual com justificativa.

DICAS
- Se o incorporador é desconhecido/pequeno, eleve o risco de execução para
  20–35%.
- Lembre que 25% de VGV ≠ 25% de lucro: o VGV é receita bruta de venda
  das unidades, não líquido para o permutante.

═══════════════════════════════════════════════════════════════════
3) HIGHEST & BEST USE (H&BU)  →  rota /highest-best-use
═══════════════════════════════════════════════════════════════════

PARA QUE SERVE
Determinar o MELHOR USO ECONÔMICO de um terreno ou imóvel comparando três
cenários alternativos de uso/desenvolvimento simultaneamente.

QUANDO USAR
- Você tem um terreno e está em dúvida entre construir prédio residencial,
  comercial ou misto.
- Quer demonstrar tecnicamente para um cliente qual opção rende mais.
- Avaliar reposicionamento de um imóvel existente.

OS TRÊS CENÁRIOS QUE A FERRAMENTA COMPARA
1. RESIDENCIAL (venda) — construir e vender as unidades. Foco em VGV e margem.
2. COMERCIAL (locação) — construir para alugar. Foco em Cap Rate e NOI.
3. HÍBRIDO/MISTO — combinação dos dois (ex: térreo comercial + andares
   residenciais).

PRINCIPAIS CAMPOS POR CENÁRIO

• Área construída (m²): VGC potencial respeitando coeficiente de aproveitamento.
• Custo de construção (R$/m²): varia por padrão construtivo.
• Preço de venda por m² (residencial) ou aluguel por m² (comercial).
• Prazo até estabilização (meses).
• Custos de incorporação (alvará, projetos, ~3–5% do VGV).

KPIs DE SAÍDA
- VPL de cada cenário.
- TIR (IRR) de cada cenário.
- Cap Rate (apenas para o cenário comercial/híbrido).
- Score comparativo 0–100.
- Recomendação automática: "Melhor uso é X porque…".

DICAS
- Use dados de mercado da região (preço de m² real, não desejado).
- Se o terreno tem restrições de zoneamento, ajuste a área construída
  permitida.
- Cenário Híbrido é vencedor quando a região tem boa demanda nos dois
  segmentos.

═══════════════════════════════════════════════════════════════════
4) DECISOR GO/NO-GO  →  rota /decisor
═══════════════════════════════════════════════════════════════════

PARA QUE SERVE
Validar OBJETIVAMENTE se uma oferta de compra deve ser feita (GO) ou não
(NO-GO), comparando o "Preço Pedido" pelo vendedor contra um "Strike Price"
máximo derivado do Cap Rate alvo do investidor.

QUANDO USAR
- Vendedor pede R$ X por um imóvel; você quer saber se faz sentido pagar.
- Precisa de uma resposta binária rápida (sim/não) com justificativa numérica.
- Negociação ativa: descobrir quanto pode contraproposta sem destruir a TIR.

EXEMPLO PRÁTICO
"Vendedor quer R$ 1,8 mi por uma sala que rende R$ 9.500/mês. Meu Cap Rate
alvo é 0,55% a.m. Vale a pena fazer a oferta?"
→ Strike = (9.500 − OPEX) ÷ 0,0055
→ Se strike ≥ 1.800.000 → GO; senão NO-GO.

PRINCIPAIS CAMPOS
• Preço Pedido pelo vendedor (R$).
• Receita bruta mensal esperada (R$).
• Vacância prevista (%).
• OPEX detalhado (IPTU, condomínio, manutenção, seguro, taxa adm %).
• Cap Rate alvo MENSAL (%): seu mínimo aceitável (ex: 0,55%).
• Margem de segurança (%): folga sobre o strike (ex: 5% = só compra se
  preço ≤ 95% do strike).

KPI DE SAÍDA
- Veredito grande e colorido: GO (verde) ou NO-GO (vermelho).
- Strike Price calculado.
- Diferença entre Preço Pedido e Strike (em R$ e %).
- Faixa de negociação sugerida.

DICAS
- Não baixe o Cap alvo só para "fechar conta" — destrói disciplina de portfólio.
- Use margem de segurança 3–7% para deixar espaço para imprevistos.

═══════════════════════════════════════════════════════════════════
5) PREÇO TETO  →  rota /preco-teto
═══════════════════════════════════════════════════════════════════

PARA QUE SERVE
Calcular o PREÇO MÁXIMO que se pode pagar por um imóvel para atingir
um Cap Rate alvo, partindo da renda líquida (NOI).
Fórmula central: Preço Teto = NOI Anual ÷ Cap Rate Alvo Anual.

QUANDO USAR
- Antes de fazer ronda de prospecção: estabelecer teto para não negociar
  no escuro.
- Avaliar lances em leilão: valor máximo a dar.

PRINCIPAIS CAMPOS
• Receita bruta mensal (R$).
• Vacância (%).
• OPEX detalhado.
• Cap Rate alvo (mensal ou anual).

SAÍDA
- Preço Teto em R$ (grande e destacado).
- Preço Teto por m² (se área foi informada).
- Comparação com Preço de Mercado (se informado).

═══════════════════════════════════════════════════════════════════
RECURSOS DA PLATAFORMA (todos os tools)
═══════════════════════════════════════════════════════════════════

- SALVAR PROJETO: cada calculadora tem botão "Salvar". O projeto aparece
  no Dashboard e pode ser reaberto a qualquer momento.
- HISTÓRICO DE VERSÕES: até 20 snapshots automáticos por projeto. Acesse
  pelo ícone de relógio no cabeçalho.
- COMPARAR: rota /comparar coloca dois projetos lado a lado.
- VITRINE: marque "Mostrar na vitrine" para publicar em /vitrine (pública).
- PDF: cada calculadora exporta relatório executivo (Setter Realty branding).
- OBSERVAÇÕES: campo livre de até 500 chars que entra no PDF.
- GOOGLE MAPS: cole o link do Maps no projeto; aparece no PDF como hyperlink.
- WHATSAPP: botão flutuante fala direto com especialista (+55 19 97122-3648).

GLOSSÁRIO RÁPIDO
- NOI (Net Operating Income) = Receita Efetiva − OPEX.
- OPEX = despesas operacionais recorrentes do imóvel.
- CAPEX = investimento em construção/reforma (custo único).
- Cap Rate = NOI ÷ Valor do imóvel. Métrica de "yield" imobiliário.
- VGV = Valor Geral de Vendas (receita bruta de um lançamento).
- VGC = Valor Geral de Construção (área × R$/m²).
- VPL/NPV = Valor Presente Líquido dos fluxos descontados.
- TIR/IRR = Taxa Interna de Retorno (TIR que zera o VPL).
- GAV = Gross Asset Value (valor do imóvel pelo NOI capitalizado).
- Strike Price = preço máximo a pagar para atingir o Cap alvo.

DISCLAIMER OBRIGATÓRIO
Todas as ferramentas têm caráter EXCLUSIVAMENTE EDUCACIONAL. Não constituem
oferta, recomendação de investimento, conselho jurídico ou tributário.
A Setter Realty recomenda consultar especialista (botão WhatsApp) antes de
qualquer decisão.
`;

function buildSystemPrompt(
  extraKnowledge: string,
  attachedDocuments?: { filename: string; content: string; pageCount?: number }[],
  customBasePrompt?: string,
): string {
  const hasAttachments = !!attachedDocuments && attachedDocuments.length > 0;

  const attachmentBlock = hasAttachments
    ? `

═══════════════════════════════════════════════════════════════════
INSTRUÇÃO ESPECIAL — ANÁLISE DE PROJETO DO SETTER TOOLBOX ANEXADO
═══════════════════════════════════════════════════════════════════
O usuário anexou ${attachedDocuments!.length} projeto(s) do próprio sistema (Setter Toolbox)
para análise. Os dados abaixo são uma serialização fiel de inputs + resultados.

A SUA RESPOSTA DEVE OBRIGATORIAMENTE COMEÇAR com a linha exata, em destaque:

> ⚠️ **Minha análise não é passível de falhas — por favor, consulte um especialista antes de qualquer decisão.**

Em seguida, faça uma análise objetiva:
1. Diga qual calculadora gerou o projeto (Simulador, Permuta, H&BU, Decisor ou Preço Teto) — está explícito no campo FERRAMENTA.
2. Liste os principais KPIs (Cap Rate, NOI, VPL, TIR, Score, GAV, Strike Price, Preço Teto, etc.) que aparecem em RESULTADOS.
3. Aponte pontos de atenção: Cap Rate fraco, vacância otimista, payback longo, OPEX subestimada, premissas agressivas, taxa de desconto incompatível com risco.
4. Sugira próximos passos concretos (ajustar X, comparar com outro projeto via /comparar, falar com especialista pelo WhatsApp).

Use markdown com listas e negritos para clareza. Seja conciso (máx ~400 palavras).

PROJETOS ANEXADOS:
${attachedDocuments!
  .map(
    (d, i) =>
      `═══ Projeto ${i + 1}: ${d.filename} ═══
${d.content}
═══ FIM DO PROJETO ${i + 1} ═══`,
  )
  .join("\n\n")}
`
    : "";

  const defaultBase = `Você é TOOL, a assistente oficial do Setter Toolbox — plataforma de análises imobiliárias da Setter Realty.

Sua missão é ajudar corretores, analistas e investidores a:
1. Entender PARA QUE serve cada uma das 5 calculadoras (Simulador, Permuta, H&BU, Decisor, Preço Teto).
2. Saber QUANDO usar cada uma com base no caso real do usuário.
3. PREENCHER cada campo corretamente, com referências de mercado brasileiro.
4. INTERPRETAR os KPIs de saída (Cap Rate, NOI, VPL, TIR, GAV, Score).
5. Dominar fluxos da plataforma (salvar, versionar, comparar, vitrine, PDF).
6. ANALISAR projetos do próprio sistema, quando o usuário os anexa pelo clipe.

REGRAS DE COMUNICAÇÃO:
- Português brasileiro, direto e amigável. Trate o usuário por "você".
- Use markdown: **negrito** para destaques, listas, e títulos quando útil.
- Seja CONCISO. Respostas longas só quando explicitamente pedidas.
- Quando recomendar uma calculadora, cite a rota: ex. "use o Simulador (/simulador)".
- Sempre que dar números (Cap Rate, custos), use as faixas do manual como referência.
- Se a pergunta envolver cálculo concreto, mostre a fórmula passo a passo.
- Se a informação não estiver no seu conhecimento, diga honestamente e sugira:
  "verifique o tooltip ao lado do campo X" ou "fale com o especialista pelo botão do WhatsApp".
- Para temas fora do Setter Toolbox (política, código, etc.), redirecione gentilmente:
  "Sou especialista no Setter Toolbox — posso te ajudar com algo das calculadoras?".
- NUNCA dê conselho jurídico, tributário ou de investimento definitivo.
  Sempre lembre o caráter educacional da ferramenta em recomendações finais.`;

  const base = customBasePrompt && customBasePrompt.trim().length > 0
    ? customBasePrompt
    : defaultBase;

  return `${base}

CONHECIMENTO BASE (manual oficial):
${BASE_KNOWLEDGE}

${extraKnowledge ? `═══════════════════════════════════════════════════════════════════
CONHECIMENTO ADICIONAL (documentos carregados pelo admin)
═══════════════════════════════════════════════════════════════════
${extraKnowledge}` : ""}${attachmentBlock}`;
}

async function callOpenRouter(messages: any[], model: string) {
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
      model,
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
    const { messages, attachedDocuments } = parsed.data;

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

    const systemPrompt = buildSystemPrompt(extraKnowledge, attachedDocuments);
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Lê o modelo OpenRouter selecionado pelo admin (com fallback hard-coded)
    let openRouterModel = "google/gemma-3-27b-it:free";
    try {
      const { data: cfg } = await admin
        .from("tool_config")
        .select("value")
        .eq("key", "openrouter_model")
        .maybeSingle();
      if (cfg?.value && typeof cfg.value === "string") {
        openRouterModel = cfg.value;
      }
    } catch (e) {
      console.warn("Não foi possível ler tool_config, usando modelo padrão:", e);
    }

    // Tenta OpenRouter primeiro
    let provider = "openrouter";
    let resp: Response | null = null;
    try {
      resp = await callOpenRouter(aiMessages, openRouterModel);
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
