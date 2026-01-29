

# Plano: Adicionar Campos de Telefone e Categoria no Cadastro

## Objetivo

Atualizar o formulário de cadastro para coletar:
1. **Nome** (já existe)
2. **Telefone** (novo campo)
3. **E-mail** (já existe)
4. **Categoria** (novo campo com opções: Corretor, Investidor, Proprietário, Rede de Varejo)

---

## Alterações Necessárias

### 1. Migração do Banco de Dados

Adicionar coluna `category` na tabela `profiles`:

```sql
ALTER TABLE public.profiles 
ADD COLUMN category text;
```

### 2. Atualizar Formulário de Cadastro (`AuthModal.tsx`)

Adicionar os novos campos ao formulário:

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Nome | Input texto | Sim |
| Telefone | Input telefone | Sim |
| E-mail | Input email | Sim |
| Categoria | Select dropdown | Sim |
| Senha | Input senha | Sim |

**Opções de Categoria:**
- Corretor
- Investidor
- Proprietário
- Rede de Varejo

### 3. Atualizar AuthContext (`signUp`)

Passar os novos campos para a criação do perfil:

```typescript
signUp: (email, password, name, phone, category) => {
  // ... criar usuário
  await supabase.from('profiles').insert({
    user_id: data.user.id,
    name,
    phone,
    category,
  });
}
```

### 4. Atualizar Página de Admin (`AdminUsers.tsx`)

Exibir a categoria do usuário na tabela de gestão:

| Nome | Telefone | Categoria | Data de Cadastro | Ações |
|------|----------|-----------|------------------|-------|

---

## Visualização do Formulário

```text
+----------------------------------+
|          Criar Conta             |
+----------------------------------+
| Nome                             |
| [________________________]       |
|                                  |
| Telefone                         |
| [________________________]       |
|                                  |
| Email                            |
| [________________________]       |
|                                  |
| Categoria                        |
| [▼ Selecione sua categoria ]     |
|                                  |
| Senha                            |
| [________________________]  👁   |
|                                  |
| [ Criar Conta ]                  |
+----------------------------------+
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| **Migração SQL** | Adicionar coluna `category` |
| `src/contexts/AuthContext.tsx` | Atualizar interface e função `signUp` |
| `src/components/auth/AuthModal.tsx` | Adicionar campos de telefone e categoria |
| `src/pages/AdminUsers.tsx` | Exibir categoria na tabela |

---

## Detalhes Técnicos

### Interface `signUp` atualizada:

```typescript
signUp: (
  email: string, 
  password: string, 
  name?: string,
  phone?: string,
  category?: string
) => Promise<{ error: Error | null }>;
```

### Validação de campos:

- Nome: obrigatório, mínimo 2 caracteres
- Telefone: obrigatório, formato brasileiro
- E-mail: obrigatório, formato válido
- Categoria: obrigatório, deve selecionar uma opção
- Senha: obrigatório, mínimo 6 caracteres

### Categorias disponíveis:

```typescript
const categories = [
  { value: 'corretor', label: 'Corretor' },
  { value: 'investidor', label: 'Investidor' },
  { value: 'proprietario', label: 'Proprietário' },
  { value: 'rede_varejo', label: 'Rede de Varejo' },
];
```

---

## Resultado Esperado

| Antes | Depois |
|-------|--------|
| Cadastro com Nome, Email, Senha | Cadastro com Nome, Telefone, Email, Categoria, Senha |
| Admin vê: Nome, Telefone | Admin vê: Nome, Telefone, Categoria, Email |

