# Setter Toolbox — Repaginação Estratégica

## 1. Nova Landing Page (`/`)

Substitui o hero atual. Estrutura editorial:

- **Hero**: título + subtítulo da tese Setter + CTA único **"Saber sobre as oportunidades"** (abre modal/scroll até o form).
- **Seção "O que é a Setter Toolbox"**: 2 parágrafos curtos + ícones das 2 ferramentas públicas (Simulador, Decisor).
- **Seção "Nossa Tese"** (geral da Setter Realty): SPE, Compra de Imóvel, Land Bank, Sale & Leaseback — cada uma com card explicativo.
- **Formulário de captura** (em `<section id="cadastro">`):
  - Nome completo
  - E-mail
  - WhatsApp (com máscara)
  - Tipos de negócio buscados (multi-select: SPE, Compra de Imóvel, Land Bank, Sale & Leaseback)
  - Senha + confirmação
- Cards de stats com **opacidade ↑** (problema atual relatado) — fundo sólido em `bg-card` e texto em `text-foreground`.
- Footer com disclaimer CVM mantido.

## 2. Cadastro e Aprovação

- Cadastro chama `supabase.auth.signUp` + insere em `profiles` com `approved=false` e novos campos: `whatsapp`, `business_interests` (jsonb array).
- **Fluxo de aprovação manual mantido**: super_admin aprova em `/admin/users`.
- Trigger atual `notify_new_signup` já dispara sino. Vamos adicionar e-mail (ver §6).

## 3. Paleta + Tema (preto & laranja, com toggle)

- Substituir Navy por **Preto profundo** (#0A0A0A / hsl 0 0% 4%) e accent **Laranja Setter** (#E85D1F / hsl 16 80% 51%).
- Implementar **dark/light toggle** com `next-themes` (já que stack é Vite, usar context próprio leve + classe `dark` no `html`).
- Tokens `--background`, `--foreground`, `--accent`, `--sidebar-*` redefinidos para ambos os modos em `index.css`.
- Toggle no header (header do AppLayout e no header da landing).
- "Setter" branco/preto adaptativo; "Toolbox" sempre laranja.

## 4. Gating das Ferramentas (Ecossistema Setter)

- Novo campo `profiles.ecosystem_member boolean default false`.
- Admin promove via checkbox em `/admin/users`.
- Ferramentas **públicas a aprovados**: Simulador, Decisor, Dashboard, Fale com o TOOL.
- **Restritas a ecossistema**: H&BU, Permuta, Preço Teto, Comparar Projetos.
- Sidebar oculta os itens restritos quando `!ecosystem_member`.
- Rotas guardam com componente `<EcosystemGate>` que redireciona para `/dashboard` com toast explicativo se não-membro.
- **Parecer de IA** (`AIAnalysisCard`, `AICompareInsight`): só renderiza se `isAdmin` (via `useUserRole`).

## 5. Fluxo de Compartilhamento (3 estados)

Substituir o booleano único `show_in_vitrine` por um enum.

- Novo campo: `toolbox_projects.share_state` enum (`'private'`, `'shared_with_setter'`, `'published'`) default `'private'`.
- Migração popula: `show_in_vitrine=true` → `'published'`, resto → `'private'`.
- UI no card do projeto e na tela de cada calculadora: dropdown "Visibilidade" com as 3 opções + descrição clara de cada uma.
- **RLS atualizada**:
  - `private`: só o dono (e admins).
  - `shared_with_setter`: dono + admins/super_admin (não aparece na Vitrine pública).
  - `published`: público na Vitrine + dono + admins.
- **Vitrine pública** mostra **contato da Setter** (WhatsApp/email vindos de `tool_config.branding`), **nunca** do autor.
- **Painel admin** ganha aba "Estudos Compartilhados" (`shared_with_setter`) listando: nome do projeto, autor, contato do autor (WhatsApp/e-mail), tipo, data, ação "Publicar na Vitrine" / "Devolver para privado".
- Trigger `notify_vitrine_published` adaptado: dispara para `shared_with_setter` ("Novo estudo compartilhado por X") e para `published` (mantém atual).

## 6. E-mails (via Resend connector)

Conectar Resend pelo connector (não API key manual). E-mails disparados por edge functions:

- `email-welcome` — após signup (boas-vindas + aviso "aguardando aprovação").
- `email-approved` — quando super_admin aprova (link para `/dashboard`).
- `email-shared-with-setter` — notifica equipe Setter (`team@setterrealty.com`, configurável em `tool_config`) quando usuário compartilha estudo. Inclui contato do autor.
- `email-published` — confirma ao autor que estudo foi publicado.

Templates HTML simples e brandados (preto + laranja). Disparo via triggers de DB chamando edge function ou via cliente após ação.

## 7. Notificações no Sino

Mantém `admin_notifications`. Novos tipos:
- `shared_with_setter` (novo) — link `/admin/shared-studies`.
- Já existentes: `new_signup`, `new_project`, `vitrine_published`, `lgpd_request`.

Bell continua só para super_admin (Thiago).

## 8. Visibilidade do "Fale com o TOOL"

Botão flutuante já existe. Garantir:
- Visível para **todos os aprovados** (não só ecossistema).
- Oculto na landing pública (`/`).

## 9. Cards da Landing (correção de visibilidade)

Problema atual: cards de stats com fundo translúcido somem no hero escuro. Trocar para:
- `bg-card` sólido + `border border-accent/20` + `shadow-elegant`.
- Texto principal `text-foreground`, label `text-muted-foreground`.

---

## Detalhes técnicos

**Migrações:**
```sql
ALTER TABLE profiles ADD COLUMN whatsapp text;
ALTER TABLE profiles ADD COLUMN business_interests jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN ecosystem_member boolean NOT NULL DEFAULT false;

CREATE TYPE share_state AS ENUM ('private','shared_with_setter','published');
ALTER TABLE toolbox_projects ADD COLUMN share_state share_state NOT NULL DEFAULT 'private';
UPDATE toolbox_projects SET share_state='published' WHERE show_in_vitrine=true;
-- mantém show_in_vitrine por compatibilidade até refactor completo

-- RLS nova para shared_with_setter:
CREATE POLICY "Admins view shared studies" ON toolbox_projects
  FOR SELECT USING (
    share_state IN ('shared_with_setter','published')
    AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'))
  );
```

**Estrutura de arquivos novos/alterados:**
- `src/pages/Landing.tsx` (novo, substitui Index ou nova rota)
- `src/components/landing/{Hero,Thesis,CaptureForm,PublicTools}.tsx`
- `src/components/theme/ThemeProvider.tsx` + `ThemeToggle.tsx`
- `src/components/projects/ShareStateSelector.tsx`
- `src/pages/AdminSharedStudies.tsx`
- `src/components/auth/EcosystemGate.tsx`
- `supabase/functions/email-welcome|email-approved|email-shared-with-setter|email-published/`
- `src/index.css` — paleta dark/light preto/laranja
- `src/components/ai/AIAnalysisCard.tsx` + `AICompareInsight.tsx` — guard `isAdmin`
- `src/components/layout/AppSidebar.tsx` — gating por `ecosystem_member`
- `src/App.tsx` — `<ThemeProvider>` + nova landing
- `src/pages/AdminUsers.tsx` — toggle "Membro do Ecossistema"

**Secrets:** Conectar Resend via connector (sem add_secret manual).

**Ordem de execução:**
1. Migração DB (campos novos + enum + RLS) → aguardar aprovação.
2. ThemeProvider + paleta preto/laranja.
3. Nova Landing + form de captura.
4. EcosystemGate + sidebar gating + AI gating.
5. Share state UI + AdminSharedStudies.
6. Conectar Resend + 4 edge functions de e-mail.
7. Smoke test ponta a ponta.