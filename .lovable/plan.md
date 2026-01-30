

# Plano: Vitrine de Simulações/Projetos

## Objetivo

Transformar a **Vitrine** para exibir **projetos das ferramentas** (Simulador, Permuta, Preço Teto, H&BU, Decisor) marcados para publicação pelo administrador, usando os mesmos visualizadores visuais existentes.

---

## Conceito

```text
ADMIN (/admin/projects)                  PÚBLICO (/vitrine)
+----------------------------+           +----------------------------+
|                            |           |                            |
|  Ver todos os projetos     |           |  Grid de cards             |
|  de todos os usuários      |           |  com projetos publicados   |
|                            |           |                            |
|  [x] Publicar na Vitrine   |  ----->   |  Click abre visualização   |
|      (toggle)              |           |  completa (read-only)      |
|                            |           |                            |
+----------------------------+           +----------------------------+
        (Gestão)                              (Somente leitura)
```

---

## Alterações no Banco de Dados

### 1. Adicionar campos à tabela `toolbox_projects`

```sql
ALTER TABLE toolbox_projects
ADD COLUMN show_in_vitrine BOOLEAN DEFAULT false,
ADD COLUMN vitrine_title TEXT,
ADD COLUMN vitrine_description TEXT;
```

- `show_in_vitrine`: Controle de publicação
- `vitrine_title`: Título customizado para a vitrine (opcional, usa `name` se vazio)
- `vitrine_description`: Descrição adicional para o card

### 2. Política RLS para acesso público

```sql
CREATE POLICY "Anyone can view vitrine projects"
ON toolbox_projects FOR SELECT
USING (show_in_vitrine = true);
```

---

## O que muda na Vitrine

### Página `/vitrine` - Listagem Pública

**Antes:** Cards de imóveis (tabela `properties`)
**Depois:** Cards de projetos (tabela `toolbox_projects`)

**Card de Projeto (estilo consistente):**
```text
+--------------------------------+
|  [ÍCONE] Simulador             |
|--------------------------------|
|  Edifício Comercial Centro     |
|  Análise de viabilidade...     |
|                                |
|  Cap Rate: 8.5%                |
|  TIR: 15.2%                    |
|  Veredicto: GO                 |
|                                |
|  [Ver Análise]                 |
+--------------------------------+
```

### Página `/vitrine/:id` - Detalhes do Projeto

Renderiza o **ProjectViewer** correspondente (Simulador, Permuta, H&BU, etc.) em modo somente leitura, mostrando todos os KPIs, gráficos e veredictos.

---

## Páginas a Modificar

### 1. `src/pages/Vitrine.tsx`

- Buscar da tabela `toolbox_projects` onde `show_in_vitrine = true`
- Renderizar cards com tipo, nome, métricas principais
- Manter filtros por tipo de ferramenta

### 2. `src/pages/VitrineDetail.tsx`

- Buscar projeto específico
- Usar `ProjectViewer` para renderizar (mesmo componente do admin)
- Remover botões de edição/exclusão
- Manter disclaimer legal

### 3. `src/pages/AdminProjects.tsx`

- Adicionar coluna "Vitrine" na tabela
- Toggle para publicar/despublicar projetos
- Possibilidade de editar título/descrição para vitrine

---

## Hooks a Modificar

### 1. `src/hooks/useVitrineProperties.ts` → `src/hooks/useVitrineProjects.ts`

Renomear e adaptar para buscar de `toolbox_projects`:

```typescript
export function useVitrineProjects(options: UseVitrineProjectsOptions = {}) {
  return useQuery({
    queryKey: ['vitrine-projects', options.projectType],
    queryFn: async () => {
      let query = supabase
        .from('toolbox_projects')
        .select('*')
        .eq('show_in_vitrine', true)
        .order('updated_at', { ascending: false });

      if (options.projectType && options.projectType !== 'all') {
        query = query.eq('project_type', options.projectType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
```

---

## Componentes a Modificar

### 1. `src/components/vitrine/PropertyCard.tsx` → `src/components/vitrine/ProjectCard.tsx`

Card adaptado para mostrar projetos com:
- Ícone e cor por tipo de ferramenta
- Nome do projeto
- Métricas principais (Cap Rate, TIR, Veredicto, etc.)
- Botão "Ver Análise"

### 2. `src/components/vitrine/PropertyFilters.tsx` → `src/components/vitrine/ProjectFilters.tsx`

Filtros por tipo de ferramenta:
- Todos
- Simulador
- Permuta
- H&BU
- Decisor
- Preço Teto

---

## Arquivos a Excluir

Os arquivos criados anteriormente para imóveis podem ser removidos ou adaptados:

| Arquivo | Ação |
|---------|------|
| `src/pages/AdminImoveis.tsx` | **EXCLUIR** (usar AdminProjects) |
| `src/hooks/useVitrineProperties.ts` | **SUBSTITUIR** por `useVitrineProjects.ts` |
| `src/hooks/useAdminProperties.ts` | **MANTER** (pode ser útil para o cadastro de imóveis real no futuro) |
| `src/components/vitrine/PropertyCard.tsx` | **RENOMEAR** para `ProjectCard.tsx` |
| `src/components/vitrine/PropertyFilters.tsx` | **ADAPTAR** para filtrar por tipo de ferramenta |
| `src/components/vitrine/PropertyForm.tsx` | **EXCLUIR** (não precisa de formulário) |

---

## Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| Migration SQL | Adicionar `show_in_vitrine` em `toolbox_projects` + RLS |
| `src/hooks/useVitrineProjects.ts` | **CRIAR** (substituindo useVitrineProperties) |
| `src/components/vitrine/ProjectCard.tsx` | **CRIAR** (card de projeto) |
| `src/components/vitrine/ProjectFilters.tsx` | **CRIAR** (filtros por ferramenta) |
| `src/pages/Vitrine.tsx` | **MODIFICAR** (buscar projetos) |
| `src/pages/VitrineDetail.tsx` | **MODIFICAR** (usar ProjectViewer) |
| `src/pages/AdminProjects.tsx` | **MODIFICAR** (adicionar toggle vitrine) |
| `src/pages/AdminImoveis.tsx` | **EXCLUIR** |
| Arquivos `Property*.tsx` antigos | **EXCLUIR** ou renomear |

---

## Segurança e Permissões

| Ação | Quem pode |
|------|-----------|
| Ver projetos na vitrine | Qualquer pessoa |
| Ver detalhes do projeto | Qualquer pessoa |
| Publicar projeto na vitrine | Apenas admin |
| Editar projeto | Apenas dono do projeto |

**Nota:** Projetos publicados são de leitura pública, mas o admin pode escolher quais publicar.

---

## Ordem de Implementação

1. Migração do banco (campo `show_in_vitrine` em `toolbox_projects` + RLS)
2. Hook `useVitrineProjects.ts` para buscar projetos públicos
3. Componente `ProjectCard.tsx` para renderizar cards
4. Atualizar `AdminProjects.tsx` com toggle de publicação
5. Atualizar `Vitrine.tsx` para listar projetos
6. Atualizar `VitrineDetail.tsx` para usar ProjectViewer
7. Limpar arquivos antigos de `properties`

