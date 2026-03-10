

# Plano: Migrar do Supabase Externo para Lovable Cloud

## Contexto

O projeto Supabase externo (`bmvzdqqgafkdyrsounfa`) foi perdido. Todas as requests estao falhando. Vamos recriar toda a infraestrutura no Lovable Cloud.

## O que precisa ser recriado

### 1. Enum e Tabelas (via migrations)

**Enum:**
- `app_role` — valores: `admin`, `user`, `super_admin`, `hunter`

**Tabelas:**
- `profiles` — user_id, name, phone, category, avatar_url, approved, approved_at, approved_by
- `user_roles` — user_id, role (app_role enum), unique(user_id, role)
- `toolbox_projects` — user_id, project_type, name, inputs (JSONB), results (JSONB), show_in_vitrine, vitrine_title, vitrine_description
- `properties` — title + ~25 colunas (address, price, area, cap_rate, coordinates, etc.), show_in_vitrine
- `insight_authors` — name, avatar_url, role
- `insight_tags` — name, slug, color
- `insights` — title, content, author_name, media_url, published, tags

**Views:**
- `properties_public` — exclui address e created_by (dados sensíveis)
- `properties_authenticated` — exclui created_by

**Functions:**
- `has_role(_user_id, _role)` — SECURITY DEFINER para checar roles sem recursão RLS
- `update_updated_at_column()` — trigger function para updated_at automático

### 2. RLS Policies

- `profiles`: usuários veem/inserem próprio perfil; admins veem/atualizam todos
- `user_roles`: usuários veem próprios roles; admins gerenciam
- `toolbox_projects`: CRUD próprio + admins veem todos + público vê vitrine
- `properties`: público vê vitrine; admins CRUD completo
- `insights/tags/authors`: admins gerenciam; público lê publicados

### 3. Edge Function

- `create-user` — recriar com mesma lógica (validação, rate limit, super_admin check)

### 4. Atualizar Client

- Remover credenciais hardcoded de `src/integrations/supabase/client.ts`
- Apontar para o novo Lovable Cloud (credenciais automáticas)

## Sequência de Implementação

1. Conectar Lovable Cloud ao projeto
2. Criar migration consolidada com todo o schema (enum, tabelas, views, functions, RLS)
3. Recriar Edge Function `create-user`
4. Atualizar `supabase/config.toml`
5. Atualizar `client.ts` para usar credenciais do Lovable Cloud
6. Regenerar types

## Dados

Os dados do Supabase antigo foram perdidos. Será necessário recriar manualmente:
- Pelo menos 1 usuário super_admin (via Edge Function ou SQL direto)
- Quaisquer propriedades/projetos que existiam

## Risco

Baixo — é uma recriação limpa. O código da aplicação não muda, apenas o backend é substituído.

