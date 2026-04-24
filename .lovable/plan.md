## Visão geral

Criar o assistente **TOOL** — um chat flutuante que responde dúvidas sobre o Setter Toolbox usando:

1. **Provedor primário:** OpenRouter (`google/gemma-2-9b-it:free`)
2. **Fallback automático:** Lovable AI (`google/gemini-3-flash-preview`) quando o OpenRouter retornar 402, 429 ou erro de rede.
3. **Base de conhecimento (RAG simples):** admins fazem upload de documentos (PDF, DOCX, TXT, MD) que são processados, divididos em pedaços (chunks) e injetados no contexto da TOOL como "conhecimento adicional" — para que a TOOL responda sobre o manual e qualquer outro material que o admin queira ensinar a ela.

## Como vai funcionar

```text
Admin faz upload de doc na página /admin/tool-knowledge
        ↓
Edge function "tool-ingest-document":
  - extrai texto (pdfjs / mammoth / texto puro)
  - quebra em chunks (~800 tokens cada, 100 overlap)
  - salva em tool_knowledge_chunks
        ↓
Usuário comum clica no botão flutuante "TOOL" e pergunta algo
        ↓
Edge function "tool-chat":
  - busca chunks mais relevantes (busca por palavras-chave, sem embeddings nesta v1)
  - monta system prompt = identidade da TOOL + manual base + chunks recuperados
  - tenta OpenRouter primeiro (streaming SSE)
  - se 402/429/erro → fallback Lovable AI (streaming SSE)
  - retransmite stream para o cliente
        ↓
Resposta aparece token-a-token no chat, com markdown
```

## RAG: por que busca por palavras-chave (e não embeddings) na v1

Embeddings exigem extensão `pgvector`, geração de vetores a cada upload e a cada pergunta — mais infra, mais custo. Para o volume esperado (manual + alguns docs do admin, dezenas/centenas de chunks), uma **busca full-text em PostgreSQL** (`to_tsvector` + `ts_rank` em português) entrega resultado bom o suficiente, é instantânea e sem custo de API. Se mais tarde a base crescer e a qualidade cair, migramos para embeddings — ficaria como segunda iteração.

## O que será construído

### 1. Banco de dados (migração)

**Tabela `tool_knowledge_documents`** — metadado de cada arquivo enviado:
- `id uuid pk`
- `title text` (nome exibido)
- `original_filename text`
- `file_type text` (pdf, docx, txt, md)
- `storage_path text` (ponteiro para o bucket)
- `chunk_count int`
- `enabled boolean default true` (admin pode desativar sem deletar)
- `uploaded_by uuid`, `created_at`, `updated_at`

**Tabela `tool_knowledge_chunks`** — pedaços de texto consultáveis:
- `id uuid pk`
- `document_id uuid → tool_knowledge_documents`
- `chunk_index int`
- `content text`
- `content_tsv tsvector` (GENERATED, idioma português) + índice GIN
- `created_at`

**RLS:**
- Apenas admin/super_admin leem/escrevem `tool_knowledge_documents` e `tool_knowledge_chunks` via API.
- A edge function `tool-chat` consulta os chunks usando o **service role key** (bypassa RLS) — usuários comuns nunca tocam essas tabelas diretamente.

**Bucket de Storage:** `tool-knowledge` (privado). RLS permite upload/leitura apenas para admins; a edge function de ingestão lê via service role.

### 2. Edge functions

**`tool-ingest-document`** (chamada pelo painel admin após upload)
- Input: `{ documentId }`
- Baixa o arquivo do bucket
- Extrai texto:
  - `.txt` / `.md` → texto direto
  - `.pdf` → `pdfjs-dist` (Deno-compatível via esm.sh)
  - `.docx` → `mammoth` (esm.sh)
- Quebra em chunks (~800 chars, 100 de overlap, respeitando parágrafos)
- Insere em `tool_knowledge_chunks` em batch
- Atualiza `chunk_count` no documento
- Validação Zod no input

**`tool-chat`** (chamada pelo widget flutuante)
- Input: `{ messages: [{role, content}] }`
- Validação Zod: máx 20 mensagens, 4000 chars cada
- Pega a última pergunta do user, faz busca full-text:
  ```sql
  SELECT content FROM tool_knowledge_chunks c
  JOIN tool_knowledge_documents d ON d.id = c.document_id
  WHERE d.enabled = true
    AND c.content_tsv @@ plainto_tsquery('portuguese', $1)
  ORDER BY ts_rank(c.content_tsv, plainto_tsquery('portuguese', $1)) DESC
  LIMIT 6;
  ```
- Monta system prompt = identidade da TOOL + manual-base embutido + chunks recuperados (cap em ~6000 chars para não estourar contexto)
- Tenta OpenRouter primeiro com streaming; se status ∈ {402, 429, 500, 502, 503} ou throw → tenta Lovable AI
- Header de resposta `X-AI-Provider: openrouter | lovable` para o front mostrar discreto badge
- Surfacing de erro 402/429 do FALLBACK como JSON (depois que ambos falharam)

**Esqueleto da lógica de fallback:**
```typescript
async function callOpenRouter(messages) {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://toolbox.setterrealty.com",
      "X-Title": "Setter Toolbox - TOOL",
    },
    body: JSON.stringify({
      model: "google/gemma-2-9b-it:free",
      messages, stream: true,
    }),
  });
}

async function callLovable(messages) {
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages, stream: true,
    }),
  });
}

// Tenta primário, faz fallback em 402/429/erro
let provider = "openrouter";
let resp;
try {
  resp = await callOpenRouter(allMessages);
  if (!resp.ok && [402, 429, 500, 502, 503].includes(resp.status)) {
    throw new Error(`OpenRouter ${resp.status}`);
  }
} catch {
  provider = "lovable";
  resp = await callLovable(allMessages);
}
```

### 3. UI — Widget flutuante "TOOL"

**`src/components/tool-assistant/ToolAssistantButton.tsx`**
- Botão flutuante circular dourado (gradiente da marca), 56px, posicionado em `bottom-6 right-6 z-50`.
- Texto "TOOL" + ícone `Sparkles`.
- Posicionado para não conflitar com o WhatsApp (`bottom-24 z-40` segundo memória).
- Não aparece em `/auth` e `/pending-approval`.

**`src/components/tool-assistant/ToolAssistantPanel.tsx`**
- `Sheet` lateral (mobile: bottom, desktop: right, ~420px de largura).
- Header com avatar da TOOL + nome + badge sutil "online".
- Lista de mensagens renderizadas com `react-markdown` (instalar se não houver).
- Mensagem inicial da TOOL apresentando-se: "Olá! Sou a TOOL, sua assistente do Setter Toolbox. Posso te ajudar com qualquer dúvida sobre as calculadoras, fórmulas e fluxos da plataforma."
- 4 sugestões clicáveis: "Como uso o Simulador?", "O que é Cap Rate?", "Como funciona a Permuta?", "Diferença entre as 5 calculadoras".
- Input com `Enter` para enviar, `Shift+Enter` para nova linha. Botão enviar ícone `Send`.
- Indicador "TOOL está pensando..." durante streaming.
- Badge mínimo no rodapé: "Powered by OpenRouter" ou "Modo backup ativo" (quando cair no fallback).

**Streaming no front** — segue o padrão SSE line-by-line já documentado (parser tolerante a chunks parciais, flush final, tratamento de `[DONE]`).

### 4. UI — Painel admin de conhecimento

**`src/pages/admin/ToolKnowledge.tsx`** — rota `/admin/tool-knowledge` (apenas super_admin)
- Cabeçalho explicando: "Documentos enviados aqui viram a base de conhecimento da TOOL. Ela usará esse conteúdo para responder as perguntas dos usuários."
- Botão **"Enviar documento"** → modal com:
  - Input título
  - File picker (`.pdf`, `.docx`, `.txt`, `.md`, máx 10MB)
  - Ao confirmar: upload no bucket → insert em `tool_knowledge_documents` → invoke `tool-ingest-document` → toast de sucesso/erro
- Lista (tabela) de documentos: título, tipo, chunks, status (ativo/inativo), data, ações:
  - Toggle ativar/desativar (sem reprocessar)
  - Botão excluir (remove arquivo do bucket + linha + chunks em cascade)
- Estado vazio amigável: "Nenhum documento ainda. A TOOL responderá apenas com o conhecimento base do Setter Toolbox."

**Link no menu admin** (na página `/admin` ou na sidebar admin existente): "Conhecimento da TOOL".

### 5. Integração global
- Renderizar `<ToolAssistantButton />` em `App.tsx` (mesmo nível do botão WhatsApp).
- Guard de rota: esconder em `/auth`, `/pending-approval`.

## Secret necessário

- **`OPENROUTER_API_KEY`** — obtida em https://openrouter.ai/keys (basta criar conta, é gratuita; `google/gemma-2-9b-it:free` não consome crédito). Será solicitada via `add_secret` no início. **Não prossigo até ser adicionada.**
- `LOVABLE_API_KEY` já existe.

## Identidade da TOOL (system prompt — resumo)

```
Você é TOOL, a assistente oficial do Setter Toolbox — plataforma de análises
imobiliárias da Setter Realty. Sua missão é ajudar corretores e analistas a
usar as calculadoras (Simulador, Permuta, H&BU, Decisor, Preço Teto), entender
conceitos financeiros (Cap Rate, NOI, GAV, IRR, NPV) e dominar os fluxos da
plataforma (salvar projeto, versões, comparação, vitrine, exportar PDF).

Regras:
- Responda em português brasileiro, claro e direto.
- Sempre cite a calculadora ou seção relevante quando fizer sentido.
- Se a pergunta exigir dado que não está no conhecimento, diga honestamente e
  sugira onde a pessoa pode descobrir (ex: "verifique o tooltip ao lado do campo X").
- Use markdown para listas e destaques. Evite respostas longas demais.
- Nunca dê conselho jurídico ou tributário definitivo — sempre lembre o
  disclaimer educacional do Setter Toolbox.

CONHECIMENTO BASE:
[manual resumido — Simulador, Permuta, H&BU, Decisor, Preço Teto, glossário]

CONHECIMENTO ADICIONAL (do admin):
[chunks recuperados via busca]
```

## Arquivos afetados

**Migrações SQL:**
- Nova tabela `tool_knowledge_documents` + RLS (admin only)
- Nova tabela `tool_knowledge_chunks` + RLS + índice GIN tsvector
- Novo bucket `tool-knowledge` (privado) + políticas Storage

**Edge functions:**
- `supabase/functions/tool-chat/index.ts` (novo)
- `supabase/functions/tool-ingest-document/index.ts` (novo)

**Front:**
- `src/components/tool-assistant/ToolAssistantButton.tsx` (novo)
- `src/components/tool-assistant/ToolAssistantPanel.tsx` (novo)
- `src/components/tool-assistant/ToolMessage.tsx` (novo, render markdown)
- `src/pages/admin/ToolKnowledge.tsx` (novo)
- `src/App.tsx` — montar botão global + rota admin
- (talvez) `src/components/admin/AdminNav.tsx` — link para a nova página
- `package.json` — adicionar `react-markdown` se ausente

## Fora do escopo (próximas iterações)

- Embeddings/pgvector (busca semântica)
- Histórico de conversas persistido por usuário
- Citações automáticas linkando para a página do manual
- Modo voz
- Limite de uso por usuário/dia
- Reindexação automática quando o admin edita um documento (na v1, deletar e reenviar)

## Passos da implementação

1. Solicitar `OPENROUTER_API_KEY` via `add_secret` e aguardar.
2. Criar migração SQL: tabelas + RLS + índice + bucket + políticas Storage.
3. Criar edge function `tool-ingest-document` (upload → chunks).
4. Criar edge function `tool-chat` (RAG + OpenRouter primário + Lovable fallback + streaming).
5. Criar componentes do widget TOOL (botão + painel + render).
6. Criar página admin `/admin/tool-knowledge` (upload, lista, toggle, excluir).
7. Montar botão global em `App.tsx` com guards de rota.
8. Adicionar link no menu admin.
9. Testar: upload de um PDF curto, pergunta básica, simulação de fallback (forçando erro no OpenRouter), pergunta sobre conteúdo do PDF enviado.