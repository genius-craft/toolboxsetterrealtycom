
# Plano: Ajustes na Vitrine e Gestão de Administradores

## Resumo das Solicitações

1. **WhatsApp sobrepondo botões** - Ajustar z-index e posição
2. **Botão para publicar na Vitrine** - Já existe em `/admin/projects` (explicação)
3. **Atribuir role de Administrador** - Adicionar gestão de roles na edição de usuários
4. **Bloquear Vitrine para não-logados** - Cards com blur e cadeado

---

## 1. WhatsApp Sobrepondo Botões

### Problema
O botão do WhatsApp está com `fixed bottom-6 right-6 z-50`, o que pode sobrepor elementos interativos em algumas páginas.

### Solução
Ajustar o z-index para ficar abaixo de modais e dialogs, e adicionar um padding-bottom em containers que possam ter botões na parte inferior.

**Arquivo:** `src/components/WhatsAppButton.tsx`
```tsx
// Mudar de z-50 para z-40
className="fixed bottom-6 right-6 z-40 group"
```

---

## 2. Botão para Publicar na Vitrine

### Onde está?
O toggle para publicar projetos na Vitrine **já existe** e está localizado em:

**Caminho:** Menu Lateral → Administração → Projetos → Coluna "Vitrine"

Na tabela de projetos (`/admin/projects`), cada linha tem um **Switch** na coluna "Vitrine" que permite ativar/desativar a publicação. Quando ativado, o ícone muda de 🔒 para 🌐.

Você já está logado como super_admin (thiago.montemor@gmail.com), então deve ter acesso a essa área.

---

## 3. Atribuir Role de Administrador na Edição de Usuários

### Problema Atual
A edição de usuários em `/admin/users` permite editar Nome, Telefone e Categoria (Corretor, Investidor, etc.), mas não permite atribuir roles de admin.

### Solução
Adicionar uma seção na edição de usuários para atribuir/remover roles de admin.

### Alterações

**Arquivo:** `src/pages/AdminUsers.tsx`

1. Adicionar select para atribuir role (apenas para super_admin)
2. Buscar roles atuais do usuário ao abrir modal de edição
3. Permitir atribuir: `user` (padrão), `admin`, `super_admin`

**Novo campo no modal de edição:**
```text
+--------------------------------+
| Editar Usuário                 |
|--------------------------------|
| Nome: [________________]       |
| Telefone: [_____________]      |
| Categoria: [Corretor ▼]        |
|                                |
| Perfil de Acesso: [Admin ▼]    |  <-- NOVO
| - Usuário                      |
| - Administrador                |
| - Super Administrador          |
+--------------------------------+
```

### Segurança
- Apenas `super_admin` pode alterar roles
- Um admin não pode se remover como admin (self-protection)
- Verificar role do usuário logado antes de mostrar a opção

---

## 4. Vitrine com Blur para Não-Logados

### Problema
Usuários não cadastrados podem ver os detalhes completos das simulações na Vitrine.

### Solução
Usar o componente `SoftLockOverlay` existente para bloquear o conteúdo da Vitrine para usuários não autenticados.

### Comportamento
- **Usuário logado:** Vê todos os cards normalmente
- **Usuário não logado:** Vê os cards com blur + cadeado + "Faça login gratuito para acessar"

### Alterações

**Arquivo:** `src/pages/Vitrine.tsx`

Envolver o grid de cards com `SoftLockOverlay`:

```tsx
import { SoftLockOverlay } from '@/components/tools/SoftLockOverlay';

// No grid de projetos:
<SoftLockOverlay featureName="as análises da vitrine">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {projects?.map((project) => (
      <ProjectCard key={project.id} project={project} />
    ))}
  </div>
</SoftLockOverlay>
```

**Arquivo:** `src/pages/VitrineDetail.tsx`

Bloquear a página de detalhes também:

```tsx
<SoftLockOverlay featureName="os detalhes desta análise">
  <ProjectViewer ... />
</SoftLockOverlay>
```

---

## Resumo de Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `src/components/WhatsAppButton.tsx` | Ajustar z-index de z-50 para z-40 |
| `src/pages/AdminUsers.tsx` | Adicionar gestão de roles (admin/super_admin) |
| `src/pages/Vitrine.tsx` | Envolver cards com SoftLockOverlay |
| `src/pages/VitrineDetail.tsx` | Envolver detalhes com SoftLockOverlay |

---

## Detalhes Técnicos

### Gestão de Roles

A tabela `user_roles` já existe com a estrutura:
```sql
user_id UUID
role app_role (admin | super_admin | user | hunter)
```

Para atribuir/remover roles:
```typescript
// Adicionar role
await supabase.from('user_roles').insert({ 
  user_id, 
  role: 'admin' 
});

// Remover role
await supabase.from('user_roles').delete()
  .eq('user_id', user_id)
  .eq('role', 'admin');
```

### Verificação de Super Admin
O hook `useAdminRole` já retorna `isSuperAdmin`, que será usado para mostrar/esconder a opção de gestão de roles.

---

## Ordem de Implementação

1. Ajustar z-index do WhatsApp
2. Adicionar SoftLockOverlay na Vitrine
3. Implementar gestão de roles em AdminUsers
