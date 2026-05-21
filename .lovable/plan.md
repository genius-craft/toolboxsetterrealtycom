## Plano de implementação

Quatro frentes coordenadas. A frente de UI roda primeiro em modo "design directions" (você escolhe 1 entre 3 protótipos antes de qualquer implementação visual). As outras três frentes são funcionais e podem rodar em paralelo após o redesign aprovado.

---

### 1. Redesign de UI (3 direções)

Fluxo:
1. Capturo screenshots das telas-chave (Dashboard, uma Calculadora, /admin/users, Vitrine).
2. Faço 3 perguntas visuais rápidas (paleta, tipografia, layout) — mantendo a identidade Gold/Beige como base.
3. Gero **3 protótipos renderizados** com a mesma paleta/tipo/layout travados, variando composição, densidade, hierarquia e motion.
4. Você escolhe 1 → aplico no projeto inteiro (tokens em `index.css`, componentes shadcn, sidebar, cards, tabelas).

Escopo do redesign: tokens globais, sidebar, dashboard, cards de projeto, calculadoras (headers/inputs/resultados), área admin, vitrine. Sem mexer em lógica de cálculo nem em RLS.

---

### 2. LGPD — Exclusão de conta self-service

**Onde**: nova seção "Privacidade & LGPD" em `/perfil` (ou criar `/configuracoes/privacidade` se não existir).

**Fluxo de exclusão**:
- Botão vermelho "Excluir minha conta permanentemente"
- Modal de confirmação dupla: usuário digita o e-mail + senha atual
- Edge function `delete-user-account` (verify_jwt + re-auth com senha):
  - Apaga `toolbox_projects`, `project_versions`, `profiles`, `user_roles` do usuário
  - Chama `supabase.auth.admin.deleteUser(user.id)` via service role
  - Registra evento em nova tabela `lgpd_requests` (audit trail) → dispara notificação ao super_admin
- Após sucesso: signOut + redirect para `/auth` com toast de confirmação

**Bônus LGPD** (incluso):
- Botão "Exportar meus dados" (JSON com projetos + perfil)
- Página pública `/privacidade` com política resumida + contato DPO
- Banner LGPD já existente fica como está

---

### 3. Sino de notificações para super_admin (Thiago)

**Tabela nova**: `admin_notifications`
```
id, type, title, message, link, read, created_at, target_role
type ∈ ('new_signup','new_project','vitrine_published','lgpd_request')
```
RLS: leitura/update apenas para `super_admin`.

**Triggers no banco** (SECURITY DEFINER, inserts em `admin_notifications`):
- `on_profile_insert` → notificação "Novo cadastro pendente: {name}"
- `on_toolbox_project_insert` → "Novo projeto: {name} ({type})"
- `on_project_vitrine_update` (quando `show_in_vitrine` vira true) → "Publicado na Vitrine: {name}"
- `on_lgpd_request_insert` → "Solicitação LGPD: {email}"

**Frontend**:
- Componente `<NotificationBell />` no header global (apenas se `super_admin`)
- Badge com contador de não lidas
- Popover (shadcn) com lista das últimas 20, agrupadas por tipo, link direto para a entidade
- Botão "Marcar todas como lidas"
- **Realtime**: subscribe em `admin_notifications` via `supabase.channel()` para badge ao vivo
- Habilitar realtime na tabela via `ALTER PUBLICATION supabase_realtime ADD TABLE`

---

### 4. Área de Configurações do Super Admin

**Nova rota**: `/admin/configuracoes` (com sub-abas via tabs do shadcn). Item no menu lateral apenas para `super_admin`.

Reutiliza a tabela existente `tool_config` (key/value jsonb) — já tem RLS de admin.

**Abas**:

| Aba | Conteúdo |
|---|---|
| **Parâmetros Globais** | Defaults usados pelas calculadoras: vacancy %, IGPM/IPCA anuais, taxa admin %, IPTU médio, cap rate alvo. Form com validação Zod. |
| **IA** | Modelo padrão do TOOL Assistant (dropdown com os modelos Lovable AI), system prompt editável, rate-limit (req/min por usuário), toggle on/off por feature (autofill, compare, pdf-summary). |
| **Branding** | Upload logo (storage), cores primária/secundária (color pickers que escrevem em tokens runtime), texto do disclaimer CVM editável, texto LGPD do banner. |
| **E-mails** | Editor de templates (assuntos + corpo) para: boas-vindas, aprovação de conta, notificação LGPD. Preview lado-a-lado. |

Edge function `send-admin-email` (Lovable Emails) consome templates do `tool_config`.

---

### Banco — migrações necessárias

```sql
-- 1. Notificações
CREATE TABLE admin_notifications (...);
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super_admin_all" ON admin_notifications
  FOR ALL USING (has_role(auth.uid(),'super_admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;

-- 2. Triggers (4 funções SECURITY DEFINER + triggers)

-- 3. LGPD audit
CREATE TABLE lgpd_requests (
  id uuid PK, user_id, email, requested_at, completed_at, status text
);

-- 4. Seeds em tool_config para defaults das calculadoras + branding + AI + templates
```

---

### Edge functions novas
- `delete-user-account` — re-auth com senha → cascata de deletes → notifica → auth.admin.deleteUser
- `export-user-data` — gera JSON com dados do usuário autenticado
- `send-admin-email` — wrapper para templates editáveis em `tool_config`

---

### Ordem de execução

1. **Redesign** (perguntas visuais → 3 direções → escolha → aplicação)
2. **Migrações de banco** (notifications, lgpd_requests, seeds)
3. **Sino + realtime** (alto valor, dependência baixa)
4. **Área de Configurações** (abas Parâmetros, IA, Branding, E-mails)
5. **LGPD** (página, edge functions, integração com sino)
6. Smoke test em cada calculadora + login/cadastro + fluxo de exclusão

---

### O que NÃO está incluído
- Marketing/newsletter (proibido pela política de e-mails Lovable)
- Recuperação após exclusão (LGPD = remoção definitiva, sem soft-delete de 30 dias)
- Histórico granular por evento além das 4 categorias acima

---

Aprovar o plano para começar pelo redesign?