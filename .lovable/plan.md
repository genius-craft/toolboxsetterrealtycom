# Vitrine de Investidores — `/investidores`

Transforma a Toolbox numa landing page premium voltada à captação de investidores qualificados, mantendo as ferramentas como acesso secundário. Foco em conversão de leads, com gating psicológico (blur) nos números sensíveis e compliance com LGPD/CVM.

## 1. Banco de dados (Lovable Cloud)

Duas tabelas novas em `public`:

**`deals`** (catálogo de ativos)
- `status`, `titulo`, `imagem_url`, `descricao`
- `investimento_total`, `cap_rate`, `noi_anual`, `receita_mensal`, `opex` (todos `text` para preservar formatação "R$ 6.740.000")
- `localizacao`, `tipo_ativo`, `inquilino_perfil` (extras úteis para filtros futuros)
- `ativo boolean default true`, `ordem int default 0` (controla ordem no grid)
- timestamps padrão

**`leads_investidores`** (CRM mínimo)
- `nome`, `email`, `whatsapp`, `perfil_alocacao`
- `projeto_interesse` (nome do deal clicado), `deal_id` (fk lógica)
- `consentimento_lgpd boolean` + `consentimento_at timestamptz` (prova de consentimento)
- `ip_hash`, `user_agent` (auditoria leve, sem PII bruta)
- `status text default 'novo'` (novo / contatado / qualificado / descartado) para o admin

**RLS**
- `deals`: leitura pública apenas onde `ativo = true`; escrita restrita a `admin`/`super_admin` via `has_role()`.
- `leads_investidores`: `INSERT` público (qualquer um cria um lead); `SELECT/UPDATE` apenas admin/super_admin. Nenhum `DELETE` (retenção controlada).

**Seed**: 1 registro do Strip Mall Araçatuba conforme prompt.

## 2. Rotas e navegação

Adicionar em `src/App.tsx`:
- `/investidores` — pública, sem sidebar, sem ToolNavbar (layout próprio limpo).
- `/investidores/admin` — protegida por `RequireAuth` + checagem `admin`/`super_admin` (padrão já usado em `/admin/*`).

A home `/` continua sendo a entrada da Toolbox para usuários logados. A nova rota é independente — link discreto no rodapé da Toolbox ("Investidores") e CTA principal vinda do marketing externo apontará direto para `/investidores`.

## 3. Página pública `/investidores`

Layout vertical único, sem menu:

```text
┌────────────────────────────────────────────┐
│  Logo Setter           [Sou investidor ▸]  │  ← header mínimo
├────────────────────────────────────────────┤
│  HERO                                      │
│  "Ativos Imobiliários Corporativos         │
│   Estruturados para Geração de Renda"      │
│  Sub: contratos longos, varejo/saúde/serv. │
│  Aviso: "Acesso restrito a investidores    │
│  qualificados e Family Offices"            │
├────────────────────────────────────────────┤
│  GRID DE DEALS (cards)                     │
│  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │ img  │  │ img  │  │ img  │              │
│  │status│  │status│  │status│              │
│  │Título│  │Título│  │Título│              │
│  │CapR✓ │  │CapR✓ │  │CapR✓ │  ← sempre   │
│  │Inv🔒 │  │Inv🔒 │  │Inv🔒 │  ← blur-md  │
│  │Rec🔒 │  │Rec🔒 │  │Rec🔒 │              │
│  │[Desbloquear dados]                      │
│  └──────┘                                  │
├────────────────────────────────────────────┤
│  Faixa de credibilidade (números Setter)   │
│  Rodapé: LGPD, CVM disclaimer, contato     │
└────────────────────────────────────────────┘
```

**Gating (blur)**
- Estado global `unlocked` em React Context + `sessionStorage` (some ao fechar aba — força nova qualificação por sessão, evita lead duplicado contínuo).
- Campos borrados: `investimento_total`, `receita_mensal`, `noi_anual`, `opex`. Visível sempre: `status`, `titulo`, `cap_rate`, `descricao`.
- Classes: wrapper `relative` + conteúdo `blur-md select-none pointer-events-none` + ícone `Lock` cinza sobreposto.
- Botão por card: "Desbloquear dados e falar com especialista".

## 4. Modal de qualificação

Disparado pelo botão do card. Componente único `LeadQualificationDialog`:

Campos:
- Nome completo (text, obrigatório, 2–120 chars)
- E-mail corporativo (zod `.email()`, regex bloqueia gmail/hotmail/yahoo? — **decisão necessária**, ver perguntas abaixo)
- WhatsApp (mask `+55 (DD) 9XXXX-XXXX`, validação E.164)
- Perfil de alocação (radio):
  - Adquirir ativo integralmente (Liquidez ≥ R$ 6,5MM)
  - Co-investment / Sociedade em SPE
  - Sou corretor representando cliente final
- Checkbox LGPD obrigatório: "Autorizo a Setter a tratar meus dados para contato comercial conforme a Política de Privacidade."
- Aviso CVM curto dentro do modal.

Validação com `zod` + `react-hook-form`. Submit:
1. `INSERT` em `leads_investidores` (via supabase anon — RLS permite).
2. Atualiza contexto → `setUnlocked(true)` (todos cards descrasram).
3. Abre `https://wa.me/5519971223648?text=…` em nova aba com a mensagem do prompt, usando `encodeURIComponent` e os valores submetidos.
4. Toast "Acesso liberado. Em instantes nosso especialista falará com você." e fecha modal.

Tratamento de erro: se o `INSERT` falhar, mostra toast e **não** desbloqueia nem abre WhatsApp.

## 5. Painel `/investidores/admin`

Reaproveita o padrão visual de `AdminProjects.tsx`. Duas abas (`Tabs`):

**Aba "Ativos"**
- Tabela de `deals` com: imagem thumb, título, status, cap_rate, toggle `ativo`, ações.
- Botão "Adicionar novo ativo" → `DealFormDialog` com todos os campos (upload de imagem opcional via bucket `deal-images` público, ou colar URL).
- Editar inline via mesmo dialog.
- Toggle `ativo` faz `UPDATE` otimista e reflete imediatamente na pública.

**Aba "Leads"**
- Tabela de `leads_investidores` ordenada por `created_at desc`.
- Colunas: data, nome, email, whatsapp (clicável → wa.me), perfil, projeto de interesse, status.
- Filtro por status e busca por nome/email.
- Botão exportar CSV (client-side, padrão já usado em `AdminProjects`).
- Editar status do lead (select).

## 6. Compliance — LGPD & CVM

**LGPD**
- Checkbox de consentimento obrigatório no modal, gravando `consentimento_lgpd` + `consentimento_at`.
- Link visível para `/privacidade` (já existe) e menção a finalidade do tratamento.
- Reaproveita o fluxo `lgpd_requests` existente (exclusão/exportação) — investidor pode pedir remoção pelo mesmo canal.
- Nenhum dado sensível solicitado (sem CPF, sem renda comprovada — só qualificação declarada).
- `ip_hash` em vez de IP cru.

**CVM** (alinhado ao disclaimer já usado no projeto)
- Banner fixo no rodapé da `/investidores` com texto:
  > "As informações apresentadas têm caráter exclusivamente informativo e não constituem oferta pública de valores mobiliários nos termos da Resolução CVM 88/160. Rentabilidades passadas não garantem resultados futuros. Investimentos imobiliários envolvem riscos."
- Aviso "Acesso restrito a investidores qualificados e Family Offices" no hero (já no prompt).
- Termos como "Cap Rate", "NOI" mantidos — descrições não prometem rentabilidade garantida (reformular "12% ao ano" como "Cap Rate alvo: 12% a.a." para evitar oferta).
- Cards exibem badge "Fase de Estruturação" claramente — não é captação pública aberta.

## 7. Arquivos a criar/editar

Criar:
- `src/pages/Investidores.tsx` — landing pública
- `src/pages/InvestidoresAdmin.tsx` — painel
- `src/components/investidores/DealCard.tsx`
- `src/components/investidores/LeadQualificationDialog.tsx`
- `src/components/investidores/DealFormDialog.tsx`
- `src/components/investidores/LeadsTable.tsx`
- `src/contexts/InvestorUnlockContext.tsx`
- `src/lib/investidores/schemas.ts` (zod)

Editar:
- `src/App.tsx` — adicionar as 2 rotas
- `supabase/migrations/...` — tabelas + RLS + seed

## 8. Detalhes técnicos

- **Stack**: React + Tailwind + shadcn (Dialog, Form, Tabs, Table, Switch) — já no projeto.
- **Estilo**: paleta grafite escuro (`#0F1216` fundo) + branco + azul-marinho (`#1E3A5F`) para CTAs, contrastando com a paleta dourada da Toolbox para diferenciar contextos. Tipografia: Inter/sora já presentes; títulos em peso 600+ e tracking ajustado.
- **Imagens dos deals**: bucket público `deal-images` no Storage; admin sobe via `supabase.storage.from('deal-images').upload(...)`.
- **WhatsApp**: helper `buildWhatsappUrl(lead, deal)` com `encodeURIComponent` (segue regra de validação já no projeto).
- **Sem autenticação** na pública — apenas no admin (reusa `RequireAuth` + `useAuth`).
- **Realtime opcional**: `supabase.channel` em `deals` no admin para refletir mudanças entre abas (nice-to-have, não bloqueante).

## Perguntas para confirmar antes de implementar

1. **E-mail corporativo**: bloquear domínios pessoais (gmail, hotmail, yahoo, outlook) ou apenas avisar? Bloquear filtra leads de qualidade, mas exclui investidores PF legítimos.
2. **Persistência do desbloqueio**: por sessão (fecha aba = re-qualifica) ou por 30 dias via `localStorage`?
3. **Header da página pública**: incluir botão "Acessar Toolbox" (link para `/`) para investidores que também querem testar as ferramentas, ou manter 100% focado em conversão sem distrações?
4. **Upload de imagem do deal**: bucket no Storage (com Lovable Cloud) ou apenas URL externa colada manualmente pelo admin?
