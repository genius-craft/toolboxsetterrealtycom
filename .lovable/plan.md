

# Plano: Adicionar Link de Gestão de Usuários no Menu Lateral

## Situação Atual

A página de gestão de usuários já existe em `/admin/users`, mas não aparece no menu lateral. Você precisa acessá-la manualmente pela URL.

## Objetivo

Adicionar um link "Gestão de Usuários" no menu lateral, visível apenas para administradores.

---

## Alterações Necessárias

### Arquivo: `src/components/layout/AppSidebar.tsx`

1. **Importar ícone `Users`** do lucide-react
2. **Verificar se o usuário é admin** usando a função `has_role` do Supabase
3. **Adicionar seção "Administração"** no menu, visível apenas para admins

```typescript
// Adicionar ao navItems (apenas para admins)
const adminItems = [
  { title: 'Gestão de Usuários', url: '/admin/users', icon: Users },
];
```

### Estrutura Visual do Menu

```text
+---------------------------+
| Setter Toolbox            |
+---------------------------+
| FERRAMENTAS               |
|   Dashboard               |
|   Simulador               |
|   Permuta                 |
|   H&BU                    |
|   Decisor                 |
+---------------------------+
| ADMINISTRAÇÃO (só admin)  |
|   Gestão de Usuários      |
+---------------------------+
| [Usuário]                 |
+---------------------------+
```

---

## Implementação

### 1. Criar hook para verificar role

Adicionar verificação de role do usuário logado:

```typescript
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  const checkAdminRole = async () => {
    if (user) {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin']);
      
      setIsAdmin(data && data.length > 0);
    }
  };
  checkAdminRole();
}, [user]);
```

### 2. Renderizar seção de administração

```typescript
{isAdmin && (
  <SidebarGroup>
    <SidebarGroupLabel>
      {!isCollapsed && 'Administração'}
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Gestão de Usuários">
            <Link to="/admin/users">
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
)}
```

---

## Resultado Esperado

| Usuário | Menu |
|---------|------|
| Usuário comum | Vê apenas "Ferramentas" |
| Admin/Super Admin | Vê "Ferramentas" + "Administração" com link para gestão de usuários |

---

## Acesso Imediato

Enquanto isso, você pode acessar a página agora pela URL direta:
**`/admin/users`**

