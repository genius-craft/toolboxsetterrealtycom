## Objetivo

Permitir que o usuário **anexe um PDF** (especialmente o relatório PDF gerado pelas ferramentas — Simulador, Permuta, H&BU, Decisor, Preço Teto) dentro do chat da TOOL para que ela analise o conteúdo. Toda análise deve começar **obrigatoriamente** com o disclaimer:

> *"⚠️ Minha análise não é passível de falhas — por favor, consulte um especialista antes de qualquer decisão."*

---

## Mudanças

### 1. Edge function nova: `supabase/functions/tool-extract-pdf/index.ts`
- Recebe um PDF via `multipart/form-data` (campo `file`).
- Valida: extensão `.pdf`, tamanho máx **10 MB**, somente usuários autenticados (verifica JWT manualmente).
- Extrai texto usando `unpdf` (mesma lib já usada em `tool-ingest-document`).
- Retorna JSON `{ filename, pageCount, text }` (texto truncado em ~25 000 caracteres para não estourar contexto do modelo).

### 2. Edge function `supabase/functions/tool-chat/index.ts`
- Aceitar no `BodySchema` um campo opcional `attachedDocuments: { filename, content }[]` (máx 2 docs, cada um até 25 000 chars).
- Quando vier anexo, montar um bloco extra no system prompt:
  ```
  ═══ DOCUMENTOS ANEXADOS PELO USUÁRIO ═══
  [Documento: relatorio_simulador.pdf]
  <texto extraído...>
  ```
- Adicionar regra no system prompt:
  - Se `attachedDocuments` estiver presente, a primeira linha da resposta **DEVE** ser o disclaimer literal acima.
  - Em seguida, fazer análise estruturada: identificar tipo de relatório (Simulador / Permuta / H&BU / Decisor / Preço Teto), KPIs principais, pontos de atenção, sugestões de ajuste.

### 3. Frontend `src/components/tool-assistant/ToolAssistantPanel.tsx`
- Adicionar botão **paperclip** ao lado do botão Send.
- Estado `attachments: { filename: string; text: string; pageCount: number }[]`.
- Ao clicar no clip → abre `<input type="file" accept=".pdf">`.
- Ao escolher arquivo:
  - Validação client: tamanho ≤ 10 MB, tipo `application/pdf`.
  - Mostra toast "Lendo PDF…" + spinner.
  - Faz `fetch` em `/functions/v1/tool-extract-pdf` com `FormData`.
  - Em sucesso, adiciona à lista de attachments com chip visual (filename + páginas + botão X para remover).
  - Em erro, toast com mensagem.
- Acima do textarea, mostrar chips dos PDFs anexados (com botão remover).
- No `send()`, incluir `attachedDocuments` no body se houver anexos. Após envio bem-sucedido, **limpar attachments** (anexos ficam ligados àquela mensagem específica do histórico — armazenar também na `Msg` para exibir ao usuário "Você anexou: X.pdf").
- Mostrar pequena badge na bolha do usuário quando ele anexou: "📎 relatorio_simulador.pdf".

### 4. Sugestão visual extra
- Quando o usuário tem anexo na composição, adicionar uma frase placeholder no textarea: "Pergunte algo sobre o(s) PDF(s) anexado(s)…".
- Adicionar uma sugestão pronta no painel inicial: **"Analisar PDF da minha simulação"** que apenas abre o seletor de arquivo.

---

## Detalhes técnicos

**Endpoint de extração** (resumo):
```ts
// tool-extract-pdf/index.ts
const form = await req.formData();
const file = form.get("file") as File;
if (file.size > 10 * 1024 * 1024) return 413;
const buf = await file.arrayBuffer();
const { extractText, getDocumentProxy } = await import("https://esm.sh/unpdf@0.12.1");
const pdf = await getDocumentProxy(new Uint8Array(buf));
const { text, totalPages } = await extractText(pdf, { mergePages: true });
const finalText = (Array.isArray(text) ? text.join("\n\n") : text).slice(0, 25_000);
return Response.json({ filename: file.name, pageCount: totalPages, text: finalText });
```

**Bloco no system prompt** (apenas quando há anexo):
```
INSTRUÇÃO ESPECIAL — ANÁLISE DE DOCUMENTO ANEXADO:
O usuário anexou 1+ PDF(s) abaixo. Sua resposta DEVE OBRIGATORIAMENTE começar
com a linha exata:

> ⚠️ **Minha análise não é passível de falhas — por favor, consulte um especialista antes de qualquer decisão.**

Em seguida, faça uma análise objetiva: identifique o tipo de relatório (se for
do Setter Toolbox: Simulador, Permuta, H&BU, Decisor, Preço Teto), liste os KPIs
principais que aparecem, aponte pontos de atenção (Cap Rate fraco, vacância
otimista, payback longo, etc.) e sugira próximos passos.

DOCUMENTOS ANEXADOS:
═══ relatorio_simulador.pdf (3 páginas) ═══
<texto extraído>
═══ FIM DO DOCUMENTO ═══
```

**Estrutura da Msg no frontend**:
```ts
type Attachment = { filename: string; pageCount: number };
type Msg = {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[]; // só visual; o texto vai no payload do backend
};
```

---

## Limitações e fora de escopo

- Apenas **PDF** nesta primeira versão (não DOCX/imagens).
- O texto extraído é **anexado a cada chamada** que tiver anexos — não persistimos no banco. Se o usuário fechar o chat, os anexos somem (comportamento esperado e mais barato).
- Máximo 2 PDFs simultâneos, 10 MB cada, 25 000 chars por PDF (≈ 50 páginas de texto puro).
- PDFs que sejam puramente imagem/scan **não funcionam** (não temos OCR no edge); a TOOL avisará "não consegui ler texto desse PDF".
- Não vou criar nenhuma tabela nova — fluxo 100% efêmero.