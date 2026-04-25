## Resumo

Dois pontos: (1) **auditar a postura de segurança** do projeto agora (RLS, secrets, edge functions expostas) e corrigir o que aparecer; (2) **proteger o saldo** das chaves de IA contra abuso, já que `tool-chat` é chamada autenticada e pode ser explorada por usuários aprovados (ou um token vazado) para consumir crédito do OpenRouter / Lovable AI.

Não vou rotacionar nenhuma chave por padrão — só se a auditoria mostrar exposição real, ou se você pedir.

---

## Parte 1 — Auditoria de segurança (somente leitura primeiro)

Rodo nesta ordem, sem mudar nada, e te entrego um relatório:

1. **Linter do banco** (`supabase--linter`) — pega RLS desabilitado, policies "true", funções sem `search_path`, etc.
2. **Scanner de segurança** (`security--run_security_scan`) — análise mais ampla (exposição de dados, secrets em código, endpoints abertos).
3. **Revisão manual das RLS** das tabelas sensíveis: `profiles`, `toolbox_projects`, `project_versions`, `tool_config`, `tool_knowledge_documents`, `user_roles`. Já validei mentalmente que `toolbox_projects` está correta (`user_id = auth.uid()` ou `show_in_vitrine = true`), mas confirmo no relatório.
4. **Edge functions expostas**: hoje temos `create-user` (com `verify_jwt = false` mas valida super_admin no código — OK), `tool-chat`, `tool-ingest-document`. Confirmo que nenhuma vaza chaves no response e que validam JWT.
5. **Secrets no frontend**: confirmo que só `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (anon, pública por design) aparecem no bundle.

**Saída:** uma lista numerada "OK / atenção / crítico" com o que cada item significa e o que recomendo fazer. Você decide o que aplicar.

---

## Parte 2 — Proteger o saldo das chaves de IA

Hoje a `tool-chat` está aberta para qualquer usuário autenticado. Sem limite, um usuário (ou alguém com um token vazado) pode disparar centenas de chamadas e queimar seu crédito do OpenRouter.

> Observação: o backend do Lovable não tem primitivo oficial de rate limit — vou implementar um controle ad-hoc (tabela própria + checagem no início da função). É a mesma abordagem que a `create-user` já usa em memória, mas persistente para sobreviver a restarts e funcionar entre instâncias.

### Mudanças propostas

**a) Bloquear usuários não aprovados**
Hoje `tool-chat` valida JWT mas não checa `profiles.approved`. Adiciono um SELECT em `profiles` no início — se `approved = false`, retorna 403. Fecha a porta para contas pendentes consumirem IA.

**b) Rate limit persistente por usuário**
Nova tabela `tool_chat_usage` (user_id, window_start, request_count) com RLS só pra service role. Limites default (configuráveis via `tool_config`):
- **30 mensagens / hora** por usuário comum
- **120 mensagens / hora** para admin/super_admin
- Resposta 429 com mensagem amigável quando estourar.

**c) Limite de tamanho do contexto**
Já existe `messages: max 20` e `attachedDocuments: max 2` com 30k chars cada. Adiciono também um teto agregado de **~50k chars** no payload total enviado à IA — evita abuso de prompt gigante.

**d) Painel admin**
Em `/admin/tool-knowledge`, adiciono um pequeno card "Uso da TOOL" mostrando:
- Total de mensagens nas últimas 24h.
- Top 5 usuários por consumo.
- Inputs para ajustar os limites por hora (grava em `tool_config`).

**e) Logs estruturados**
`tool-chat` passa a logar `user_id`, `provider usado`, `model`, `tokens_estimados` (length aproximada). Facilita ver no painel de logs se alguém está abusando.

### O que NÃO vou fazer agora (a menos que você peça)
- Rotacionar `OPENROUTER_API_KEY` (precisa ser feito por você no painel do OpenRouter; depois eu atualizo a secret aqui).
- Rotacionar `LOVABLE_API_KEY` (1-clique meu, mas só faz sentido se a auditoria mostrar exposição).
- Adicionar CAPTCHA / WAF — desnecessário enquanto o acesso for autenticado + aprovado + rate-limited.

---

## Diagrama do fluxo protegido da TOOL

```text
Usuário → POST /tool-chat
   ↓
[1] valida JWT (já existe)
   ↓
[2] checa profiles.approved = true       ← NOVO
   ↓
[3] checa rate limit (tool_chat_usage)   ← NOVO
   ↓
[4] valida payload (já existe + teto agregado)  ← REFORÇADO
   ↓
[5] RAG + system_prompt + chamada IA (já existe)
   ↓
[6] log estruturado (user_id, provider, tamanho) ← NOVO
   ↓
resposta streaming
```

---

## Detalhes técnicos (parte 2)

- **Migração**: cria `public.tool_chat_usage (user_id uuid, window_start timestamptz, request_count int, primary key (user_id, window_start))` + RLS apenas service role + índice `(user_id, window_start desc)`.
- **Migração**: insere defaults em `tool_config`: `chat_rate_limit_user = 30`, `chat_rate_limit_admin = 120`, `chat_payload_max_chars = 50000`.
- **Editado**: `supabase/functions/tool-chat/index.ts` — adiciona checagem `approved`, rate limit (UPSERT atômico no janelamento de 1h), validação de payload total, logs estruturados.
- **Editado**: `src/pages/AdminToolKnowledge.tsx` — adiciona card "Uso da TOOL" com query agregada e inputs para os limites.
- **Criado**: `src/components/admin/ToolUsageCard.tsx` — componente do card.
- **Não mexe** em: `client.ts`, `types.ts`, `config.toml` (project-level), nem em código existente da `create-user`.

---

## Como prefere prosseguir?

1. **Só auditar primeiro** (rodo linter + scan + revisão manual e te entrego o relatório, sem mudar nada).
2. **Auditoria + rate limiting de uma vez** (faço tudo desta plano em sequência).
3. **Só rate limiting** (pula auditoria; você confia no estado atual).

Recomendo a **opção 2** — é o melhor custo-benefício e fecha os dois pontos numa tacada só.