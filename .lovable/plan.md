
# Plano: Sistema de Aprovação de Usuários

## Objetivo

Implementar um sistema onde:
1. Usuários podem se **cadastrar** normalmente
2. Só conseguem fazer **login** após serem **aprovados por um admin da Setter**
3. Admins podem ver e aprovar usuários pendentes

---

## Arquitetura da Solução

```text
+-------------------+     +-------------------+     +-------------------+
|   Usuário tenta   |     |  Verifica status  |     |     Acesso        |
|     fazer login   | --> |   de aprovação    | --> |    concedido      |
+-------------------+     +-------------------+     +-------------------+
                                  |
                                  v (se não aprovado)
                          +-------------------+
                          |  Bloqueia login   |
                          |  com mensagem     |
                          +-------------------+
```

---

## Alterações Necessárias

### 1. Migração do Banco de Dados

Adicionar coluna `approved` na tabela `profiles`:

```sql
-- Adicionar coluna de aprovação
ALTER TABLE public.profiles 
ADD COLUMN approved boolean NOT NULL DEFAULT false;

-- Adicionar coluna de data de aprovação
ALTER TABLE public.profiles 
ADD COLUMN approved_at timestamp with time zone;

-- Adicionar coluna de quem aprovou
ALTER TABLE public.profiles 
ADD COLUMN approved_by uuid;
```

### 2. Atualizar AuthContext (`src/contexts/AuthContext.tsx`)

Modificar a função `signIn` para verificar se o usuário está aprovado:

```typescript
const signIn = async (email: string, password: string) => {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { error: error as Error | null };
  }
  
  // Verificar se usuário está aprovado
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('approved')
      .eq('user_id', data.user.id)
      .single();
    
    if (!profile?.approved) {
      // Fazer logout e retornar erro
      await supabase.auth.signOut();
      return { 
        error: new Error('Sua conta ainda não foi aprovada. Aguarde a aprovação da Setter.') 
      };
    }
  }
  
  return { error: null };
};
```

### 3. Atualizar Mensagem de Cadastro (`src/components/auth/AuthModal.tsx`)

Modificar a mensagem de sucesso no cadastro:

**Antes:**
```typescript
toast({
  title: 'Conta criada!',
  description: 'Verifique seu email para confirmar o cadastro.',
});
```

**Depois:**
```typescript
toast({
  title: 'Cadastro enviado!',
  description: 'Sua conta será analisada pela Setter. Você receberá acesso após aprovação.',
});
```

### 4. Criar Página de Administração de Usuários (Opcional)

Nova página `/admin/users` para admins aprovarem usuários:

| Funcionalidade | Descrição |
|----------------|-----------|
| Listar usuários pendentes | Tabela com nome, email, data de cadastro |
| Aprovar usuário | Botão para aprovar |
| Rejeitar usuário | Botão para excluir cadastro |

---

## Fluxo do Usuário

### Cadastro:
1. Usuário preenche formulário de cadastro
2. Conta é criada com `approved = false`
3. Mensagem: "Sua conta será analisada pela Setter"

### Tentativa de Login (não aprovado):
1. Usuário tenta fazer login
2. Sistema verifica `approved = false`
3. Mensagem: "Sua conta ainda não foi aprovada"
4. Login é bloqueado

### Tentativa de Login (aprovado):
1. Usuário tenta fazer login
2. Sistema verifica `approved = true`
3. Acesso liberado normalmente

---

## Fluxo do Admin

1. Admin acessa painel de usuários
2. Vê lista de usuários pendentes
3. Clica em "Aprovar"
4. Sistema atualiza `approved = true` e `approved_at = now()`
5. Usuário pode fazer login

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| **Migração SQL** | Adicionar colunas `approved`, `approved_at`, `approved_by` |
| `src/contexts/AuthContext.tsx` | Verificar aprovação no login |
| `src/components/auth/AuthModal.tsx` | Atualizar mensagem de cadastro |
| `src/pages/AdminUsers.tsx` (novo) | Página para gerenciar aprovações |
| `src/App.tsx` | Adicionar rota `/admin/users` |

---

## Segurança

- A verificação de aprovação é feita **no servidor** (Supabase)
- Mesmo que o usuário tente manipular o frontend, ele será deslogado se não estiver aprovado
- Apenas admins podem alterar o status de aprovação (via RLS)

---

## Política RLS para Aprovação

```sql
-- Apenas admins podem atualizar o campo approved
CREATE POLICY "Admins can approve users" ON public.profiles
FOR UPDATE USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
);
```

---

## Resultado Esperado

| Cenário | Comportamento |
|---------|---------------|
| Novo cadastro | Conta criada, aguardando aprovação |
| Login sem aprovação | Bloqueado com mensagem clara |
| Login com aprovação | Acesso normal ao sistema |
| Admin aprova usuário | Usuário pode fazer login |
