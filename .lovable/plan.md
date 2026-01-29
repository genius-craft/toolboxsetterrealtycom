

# Plano: Gestão Completa de Usuários para Super Admin

## Objetivo

Adicionar funcionalidades para que o super admin possa:
1. **Editar** usuários aprovados (nome, telefone, categoria)
2. **Excluir** usuários aprovados
3. **Adicionar** novos usuários manualmente

---

## Alterações Necessárias

### Arquivo: `src/pages/AdminUsers.tsx`

#### 1. Botões de Ação na Tabela de Aprovados

Adicionar coluna "Ações" com botões de editar e excluir:

```text
| Nome | Telefone | Categoria | Data de Aprovação | Status | Ações      |
|------|----------|-----------|-------------------|--------|------------|
| João | (11)...  | Corretor  | 29/01/2026        | ✓      | ✏️ 🗑️      |
```

#### 2. Botão "Adicionar Usuário"

Botão no header da seção de usuários aprovados:

```text
+------------------------------------------------+
| ✓ Usuários Aprovados                  [+ Novo] |
+------------------------------------------------+
```

#### 3. Modal de Edição/Adição

Reutilizar estrutura do AuthModal com campos:
- Nome
- Telefone  
- Email (somente para novo usuário)
- Categoria (Select)
- Senha (somente para novo usuário)

#### 4. Dialog de Confirmação de Exclusão

Usar AlertDialog para confirmar exclusão:
```text
+----------------------------------+
| Excluir Usuário                  |
| Deseja realmente excluir João?   |
| Esta ação não pode ser desfeita. |
|                                  |
| [Cancelar]  [Excluir]            |
+----------------------------------+
```

---

## Estrutura Visual

### Tabela de Usuários Aprovados (Atualizada)

```text
+------------------------------------------------------------------+
| ✓ Usuários Aprovados                              [+ Adicionar]  |
+------------------------------------------------------------------+
| Nome      | Telefone       | Categoria  | Data     | Status | ⚙️ |
|-----------|----------------|------------|----------|--------|-----|
| João      | (11) 99999...  | Corretor   | 29/01/26 | ✓      | ✏️🗑️|
| Maria     | (11) 88888...  | Investidor | 28/01/26 | ✓      | ✏️🗑️|
+------------------------------------------------------------------+
```

### Modal de Edição

```text
+----------------------------------+
|        Editar Usuário            |
+----------------------------------+
| Nome                             |
| [João Silva_______________]      |
|                                  |
| Telefone                         |
| [(11) 99999-9999__________]      |
|                                  |
| Categoria                        |
| [▼ Corretor________________]     |
|                                  |
| [Cancelar]      [Salvar]         |
+----------------------------------+
```

### Modal de Adição

```text
+----------------------------------+
|       Adicionar Usuário          |
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
| [▼ Selecione______________]      |
|                                  |
| Senha                            |
| [________________________]  👁   |
|                                  |
| [Cancelar]      [Criar]          |
+----------------------------------+
```

---

## Detalhes Técnicos

### Novos Estados:

```typescript
const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);

// Form states
const [formName, setFormName] = useState('');
const [formPhone, setFormPhone] = useState('');
const [formEmail, setFormEmail] = useState('');
const [formCategory, setFormCategory] = useState('');
const [formPassword, setFormPassword] = useState('');
```

### Função de Edição:

```typescript
const handleEdit = async () => {
  if (!editingUser) return;
  setActionLoading(editingUser.id);
  
  const { error } = await supabase
    .from('profiles')
    .update({
      name: formName,
      phone: formPhone,
      category: formCategory,
    })
    .eq('id', editingUser.id);

  if (!error) {
    toast({ title: 'Usuário atualizado!' });
    fetchProfiles();
    setIsEditModalOpen(false);
  }
  setActionLoading(null);
};
```

### Função de Exclusão:

```typescript
const handleDelete = async (profile: UserProfile) => {
  setActionLoading(profile.id);
  
  // Deletar profile (cascade deve deletar auth.user se configurado)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profile.id);

  if (!error) {
    toast({ title: 'Usuário excluído!' });
    fetchProfiles();
  }
  setDeleteConfirmUser(null);
  setActionLoading(null);
};
```

### Função de Adição Manual:

```typescript
const handleAddUser = async () => {
  setActionLoading('new');
  
  // Criar usuário via Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email: formEmail,
    password: formPassword,
    email_confirm: true,
  });

  if (data?.user) {
    // Criar profile já aprovado
    await supabase.from('profiles').insert({
      user_id: data.user.id,
      name: formName,
      phone: formPhone,
      category: formCategory,
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user?.id,
    });
    
    toast({ title: 'Usuário criado com sucesso!' });
    fetchProfiles();
  }
  setIsAddModalOpen(false);
  setActionLoading(null);
};
```

### Componentes a Importar:

```typescript
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
```

---

## Edge Function para Criação de Usuário

Como `supabase.auth.admin.createUser()` requer `service_role_key`, será necessário criar uma edge function:

### Arquivo: `supabase/functions/create-user/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { email, password, name, phone, category, approved_by } = await req.json();
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Criar usuário
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError) return new Response(JSON.stringify({ error: userError.message }), { status: 400 });

  // Criar profile aprovado
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    user_id: userData.user.id,
    name,
    phone,
    category,
    approved: true,
    approved_at: new Date().toISOString(),
    approved_by,
  });

  return new Response(JSON.stringify({ success: true, user: userData.user }));
});
```

---

## Arquivos a Modificar/Criar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/AdminUsers.tsx` | Adicionar modals de edição/adição, botões de ação, dialogs de confirmação |
| `supabase/functions/create-user/index.ts` | Nova edge function para criar usuários com service_role |
| `supabase/config.toml` | Registrar nova edge function |

---

## Resultado Esperado

| Ação | Comportamento |
|------|---------------|
| Clique em ✏️ | Abre modal de edição com dados preenchidos |
| Clique em 🗑️ | Abre dialog de confirmação |
| Clique em "+ Adicionar" | Abre modal para criar novo usuário |
| Salvar edição | Atualiza profile no banco |
| Confirmar exclusão | Remove profile do banco |
| Criar usuário | Cria auth.user + profile já aprovado |

