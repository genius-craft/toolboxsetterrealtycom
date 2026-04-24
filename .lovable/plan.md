## Resumo

Substituir o upload de PDF externo na **TOOL** por um seletor de **projetos do próprio sistema**, com regras estritas de visibilidade. Adicionar uma área no **Admin → TOOL Knowledge** para editar o **System Prompt** da TOOL diretamente pelo painel.

---

## Parte 1 — Anexar projetos do sistema (em vez de PDFs externos)

### Regras de acesso (CRÍTICO)
O seletor mostra **apenas**:
- Projetos cujo `user_id` é igual ao usuário logado (`auth.uid()`), **OU**
- Projetos com `show_in_vitrine = true` (aprovados para a vitrine pública).

Nenhum usuário pode acessar projetos privados de outro usuário. Como as RLS de `toolbox_projects` já garantem isso (`Users can view own projects` + `Anyone can view vitrine projects`), basta a query `SELECT` respeitar o filtro — o banco bloqueia o resto.

### Mudanças na experiência

1. O ícone de clipe (📎) na TOOL **deixa de abrir o file picker do computador**.
2. No lugar dele, abre um **Dialog "Anexar projeto"** com duas abas:
   - **Meus projetos** — todos os projetos salvos pelo usuário logado.
   - **Vitrine** — projetos aprovados publicamente, com nome do autor e tipo.
3. Cada item mostra: ícone do tipo (Simulador / Permuta / H&BU / Decisor / Preço Teto), nome, data de atualização e botão **Anexar**.
4. Se o usuário estiver em uma rota com `?id=...`, esse projeto aparece em destaque no topo como **"Projeto atual"**.
5. Limite de **2 projetos por mensagem** (chips removíveis).
6. A sugestão "Analisar PDF da minha simulação" vira **"Analisar um dos meus projetos"**.
7. Resposta da IA continua começando obrigatoriamente com:
   > ⚠️ Minha análise não é passível de falhas — por favor, consulte um especialista antes de qualquer decisão.

### O que sai
- Botão de upload `.pdf` do computador.
- Edge Function `tool-extract-pdf` (não usada mais → será deletada).
- Validações de tamanho/extensão de arquivo no frontend.

### Detalhes técnicos
- **Editado:** `src/components/tool-assistant/ToolAssistantPanel.tsx` — remove input file e lógica de extração; troca tipo `Attachment` para `{ projectId, name, projectType, ownerLabel, summary }`.
- **Criado:** `src/components/tool-assistant/ProjectAttachmentPicker.tsx` — Dialog com Tabs "Meus projetos" / "Vitrine", busca, lista e botão de anexar.
- **Serialização local**: o componente serializa `inputs` + `results` do projeto em texto enxuto (chave: valor) e envia em `attachedDocuments` no mesmo formato já aceito pelo `tool-chat` (`filename` = `${name} (${tipo})`, `content` = texto serializado). Sem precisar de nova edge function.
- **Editado:** `supabase/functions/tool-chat/index.ts` — texto do bloco de instrução muda de "PDF anexado" para "projeto do sistema anexado", mantendo o disclaimer obrigatório.
- **Removido:** `supabase/functions/tool-extract-pdf/` (e desploy correspondente).

---

## Parte 2 — Editor de System Prompt no TOOL Knowledge

### Onde aparece
Dentro de `/admin/tool-knowledge`, adicionar uma nova seção (Card) **acima da lista de documentos**, chamada **"Prompt da TOOL"**, com:
- Um `Textarea` grande (estilo chat/editor) com o system prompt atual.
- Botões **Salvar**, **Restaurar padrão** e **Pré-visualizar** (abre a TOOL em modo teste para validar).
- Texto auxiliar: "Este é o prompt-base que define a personalidade e regras da TOOL. Cuidado ao editar — afeta todos os usuários."
- Contador de caracteres e badge mostrando última edição (`updated_at` + `updated_by`).

### Persistência
Usar a tabela existente `tool_config` (já tem RLS só para admin/super_admin):
- Chave: `system_prompt`
- Valor: `{ "content": "...texto markdown..." }`

### Mudança na edge function
- `tool-chat` passa a ler `tool_config` para a chave `system_prompt`. Se existir, usa o conteúdo como base do `buildSystemPrompt`. Se não existir, usa a constante hardcoded atual como fallback (default).
- O bloco de "instrução especial — análise de documento anexado" continua sendo **anexado dinamicamente** (não faz parte do prompt editável), assim o admin não consegue desligar o disclaimer obrigatório por engano.

### Detalhes técnicos
- **Editado:** `src/pages/AdminToolKnowledge.tsx` — adiciona seção "Prompt da TOOL" com textarea, hooks de load/save em `tool_config`, botões e estado de "modificado".
- **Editado:** `supabase/functions/tool-chat/index.ts` — `buildSystemPrompt` recebe um `customPrompt` opcional (vindo de `tool_config.system_prompt.content`); se ausente, usa a constante atual.

---

## Diagrama do fluxo de anexo

```text
Usuário clica 📎
   ↓
Dialog "Anexar projeto"
 ├─ [Aba] Meus projetos        → toolbox_projects WHERE user_id = me
 └─ [Aba] Vitrine              → toolbox_projects WHERE show_in_vitrine = true
   ↓
Clica Anexar → vira chip
   ↓
Envia mensagem
   ↓
tool-chat lê system_prompt do tool_config (ou fallback)
   + acrescenta bloco do projeto + disclaimer obrigatório
   ↓
TOOL responde começando com o disclaimer
```

## Arquivos afetados

- **Editado:** `src/components/tool-assistant/ToolAssistantPanel.tsx`
- **Criado:** `src/components/tool-assistant/ProjectAttachmentPicker.tsx`
- **Editado:** `src/pages/AdminToolKnowledge.tsx`
- **Editado:** `supabase/functions/tool-chat/index.ts`
- **Removido:** `supabase/functions/tool-extract-pdf/index.ts`
