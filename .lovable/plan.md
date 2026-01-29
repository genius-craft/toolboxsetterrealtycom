

# Plano: Acesso Admin a Projetos + WhatsApp + Melhorias

## Objetivo

Implementar três funcionalidades principais:
1. **Acesso Admin a Projetos** - Super admins podem visualizar projetos de todos os usuários
2. **Botão WhatsApp Flutuante** - CTA em todas as páginas para conversão de leads
3. **Atualização Legal** - Termos de Uso e Privacidade atualizados sobre acesso a dados

---

## Parte 1: Acesso Admin aos Projetos

### 1.1 Nova Página de Admin - Projetos

Criar página `/admin/projects` para super admins visualizarem todos os projetos:

```text
+------------------------------------------------------------------+
| 📊 Projetos dos Usuários                              [Exportar]  |
+------------------------------------------------------------------+
| Filtros: [Todos ▼] [Simulador] [Permuta] [H&BU] [Decisor]        |
| Buscar: [___________________________]                             |
+------------------------------------------------------------------+
| Usuário      | Projeto      | Tipo      | Data       | Ações     |
|--------------|--------------|-----------|------------|-----------|
| João Silva   | Loja Centro  | Simulador | 29/01/26   | 👁️        |
| Maria Costa  | Terreno SP   | Permuta   | 28/01/26   | 👁️        |
+------------------------------------------------------------------+
```

### 1.2 RLS Policy Atualizada

A RLS já existe para admins visualizarem projetos:
```sql
-- Já existe:
Policy Name: Admins can view all projects 
Using Expression: (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
```

### 1.3 Link na Sidebar de Admin

Adicionar item "Projetos" na seção Administração do AppSidebar.

---

## Parte 2: Botão WhatsApp Flutuante

### 2.1 Componente Reutilizável

Criar componente `WhatsAppButton` que aparece em todas as páginas:

```text
                                      +---------------------------+
                                      | 💬 Falar com especialista |
                                      +---------------------------+
                                                    ↓
                                              +--------+
                                              |   📱   |  ← Botão flutuante
                                              +--------+
                                                (canto inferior direito)
```

### 2.2 Comportamento

| Estado | Comportamento |
|--------|---------------|
| Desktop | Botão + tooltip "Falar sobre esses números com especialista" |
| Mobile | Botão compacto |
| Hover | Expande com texto completo |
| Click | Abre WhatsApp com mensagem pré-definida |

### 2.3 Número e Link

```typescript
const whatsappNumber = '5519971223648';
const message = 'Olá! Gostaria de falar com um especialista sobre minha análise imobiliária.';
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
```

### 2.4 Implementação

Adicionar o componente em:
- `AppLayout.tsx` (páginas com sidebar)
- `Index.tsx` (landing page)
- `PrivacyPolicy.tsx` e `TermsOfUse.tsx`

---

## Parte 3: Atualização dos Termos Legais

### 3.1 Política de Privacidade - Nova Seção

Adicionar seção "Acesso Administrativo":

```text
+----------------------------------+
| 🔐 Acesso Administrativo          |
+----------------------------------+
| Para garantir a qualidade dos    |
| serviços e oferecer suporte      |
| personalizado, nossos            |
| administradores podem acessar:   |
|                                  |
| • Projetos e simulações criados  |
| • Dados inseridos nas análises   |
| • Histórico de uso               |
|                                  |
| Este acesso é usado para:        |
| • Suporte técnico personalizado  |
| • Melhorias nos serviços         |
| • Consultoria especializada      |
+----------------------------------+
```

### 3.2 Termos de Uso - Atualização

Adicionar cláusula na seção "Uso Permitido":

```text
"Ao utilizar a plataforma, você consente que a equipe 
administrativa da Setter Toolbox poderá acessar seus 
projetos e análises salvos para fins de suporte, 
melhoria dos serviços e oferecimento de consultoria 
especializada."
```

---

## Parte 4: Arquivos a Modificar/Criar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/WhatsAppButton.tsx` | **Novo** - Componente do botão flutuante |
| `src/pages/AdminProjects.tsx` | **Novo** - Página de gestão de projetos |
| `src/App.tsx` | Adicionar rota `/admin/projects` |
| `src/components/layout/AppLayout.tsx` | Incluir WhatsAppButton |
| `src/components/layout/AppSidebar.tsx` | Adicionar link para admin/projects |
| `src/pages/Index.tsx` | Incluir WhatsAppButton |
| `src/pages/PrivacyPolicy.tsx` | Adicionar seção "Acesso Administrativo" |
| `src/pages/TermsOfUse.tsx` | Atualizar cláusulas sobre acesso a dados |

---

## Parte 5: 10 Sugestões de Melhorias

### Para Usuários (Geração de Leads e Autoridade)

| # | Feature | Descrição | Impacto |
|---|---------|-----------|---------|
| 1 | **Landing Page com Depoimentos** | Seção com cases de sucesso e depoimentos de clientes | Autoridade + Conversão |
| 2 | **Blog/Insights** | Área de conteúdo educacional sobre mercado imobiliário (já tem tabela `insights`) | SEO + Autoridade |
| 3 | **Compartilhar PDF via Email** | Enviar análise por email com formulário de captura do destinatário | Lead Generation |
| 4 | **Calculadora Gratuita Simplificada** | Versão básica sem login para captura de leads | Lead Generation |
| 5 | **Notificações Push/Email** | Lembretes sobre projetos e novidades da plataforma | Engajamento |

### Para Administradores

| # | Feature | Descrição | Impacto |
|---|---------|-----------|---------|
| 6 | **Dashboard de Métricas** | KPIs: usuários ativos, projetos criados, conversão | Analytics |
| 7 | **Exportar Projetos CSV** | Download de dados para análise offline | Operacional |
| 8 | **Log de Atividades** | Histórico de ações dos usuários na plataforma | Segurança + Suporte |
| 9 | **Segmentação de Leads** | Tags e scores para priorização de contatos | Vendas |
| 10 | **Integração CRM** | Webhook para enviar leads ao CRM (Pipedrive, HubSpot) | Automação |

---

## Detalhes Técnicos

### Componente WhatsAppButton

```typescript
// src/components/WhatsAppButton.tsx
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '5519971223648';
const DEFAULT_MESSAGE = 'Olá! Gostaria de falar com um especialista sobre minha análise imobiliária.';

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <div className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300">
        <MessageCircle className="h-6 w-6" />
        <span className="hidden sm:inline whitespace-nowrap">
          Falar com especialista
        </span>
      </div>
    </a>
  );
}
```

### Página AdminProjects

```typescript
// Estrutura principal
export default function AdminProjects() {
  const { data: allProjects, isLoading } = useAllProjects(); // Hook para buscar todos

  return (
    <div className="p-6">
      <h1>Projetos dos Usuários</h1>
      
      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        <Select /> {/* Tipo de projeto */}
        <Input placeholder="Buscar por usuário..." />
      </div>
      
      {/* Tabela */}
      <Table>
        {/* Colunas: Usuário, Projeto, Tipo, Data, Ações */}
      </Table>
    </div>
  );
}
```

### Hook useAllProjects (Admin)

```typescript
export function useAllProjects(projectType?: ProjectType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-projects', projectType],
    queryFn: async () => {
      // RLS já permite acesso para admins
      let query = supabase
        .from('toolbox_projects')
        .select(`
          *,
          profiles!toolbox_projects_user_id_fkey(name, phone, category)
        `)
        .order('updated_at', { ascending: false });

      if (projectType) {
        query = query.eq('project_type', projectType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
```

### Atualização do Sidebar

```typescript
// Em AppSidebar.tsx - seção admin
{isAdmin && (
  <SidebarGroup>
    <SidebarGroupLabel>Administração</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem>
        <Link to="/admin/users">Usuários</Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link to="/admin/projects">Projetos</Link> {/* NOVO */}
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
)}
```

---

## Resultado Esperado

| Funcionalidade | Resultado |
|----------------|-----------|
| Acesso Admin Projetos | Super admins veem todos os projetos salvos na plataforma |
| WhatsApp Flutuante | Botão verde em todas as páginas para contato direto |
| Termos Atualizados | Cláusulas claras sobre acesso administrativo aos dados |
| 10 Sugestões | Roadmap para evolução da plataforma |

