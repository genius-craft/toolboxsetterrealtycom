# Plano: 5 Melhorias Selecionadas (1, 2, 4, 6, 10)

## Resumo
Implementar: Comparação de Projetos, Histórico de Versões, Dashboard de Métricas Agregadas, Duplicar Projeto e Tour Guiado de Onboarding.

---

## 1. Comparação Lado a Lado de Projetos

**Novo arquivo:** `src/pages/CompareProjects.tsx`
**Editado:** `src/pages/Dashboard.tsx`, `src/App.tsx`, `src/components/layout/AppSidebar.tsx`

- Modo "Comparar" no Dashboard: botão que ativa checkboxes nos cards de projeto (até 3 do mesmo tipo)
- Botão "Comparar selecionados" leva para `/comparar?ids=a,b,c`
- Página `/comparar` renderiza tabela lado a lado:
  - Colunas: nome de cada projeto
  - Linhas: KPIs específicos do tipo (TIR, VPL, Cap Rate, Payback, etc.)
  - Destaque visual (verde/vermelho) na melhor/pior métrica de cada linha
- Botão "Exportar comparação em PDF" usando `pdfExport.ts` existente

---

## 2. Histórico de Versões por Projeto

**Migration nova:** tabela `project_versions`
**Editado:** `src/hooks/useProjects.ts`, todas as 5 páginas de ferramentas, `src/components/tools/ProjectHeader.tsx`

### Schema
```sql
CREATE TABLE project_versions (
  id uuid PK,
  project_id uuid REFERENCES toolbox_projects(id) ON DELETE CASCADE,
  user_id uuid,
  version_number int,
  inputs jsonb,
  results jsonb,
  name text,
  created_at timestamptz DEFAULT now()
);
-- RLS: usuário só vê versões dos próprios projetos
```

- Antes de cada UPDATE em `toolbox_projects`, snapshot do estado atual é gravado em `project_versions` (lógica no `useUpdateProject`)
- Novo botão "Histórico" no `ProjectHeader` quando projeto está carregado
- Drawer/Sheet lateral lista versões (data, número, mudanças resumidas)
- Botão "Restaurar" carrega inputs daquela versão no formulário (sem salvar automático — usuário decide)
- Limite de 20 versões por projeto (mais antigas são apagadas)

---

## 4. Dashboard de Métricas Agregadas

**Editado:** `src/pages/Dashboard.tsx`

- Linha de cards resumo no topo (acima da lista atual):
  - **Total de análises**: contagem total
  - **Investimento total analisado**: soma de `inputs.totalInvestment` ou equivalente
  - **TIR média**: média ponderada quando aplicável
  - **Melhor projeto**: nome + métrica chave
- Mini gráfico (sparkline) de análises criadas por mês (últimos 6 meses) usando `recharts` já instalado
- Filtros por tipo continuam abaixo

---

## 6. Duplicar Projeto com Um Clique

**Editado:** `src/pages/Dashboard.tsx`, `src/hooks/useProjects.ts`

- Novo botão "Duplicar" (ícone Copy) ao lado de Ver/Excluir nos cards
- Hook `useDuplicateProject`: cria novo registro com `name = "Cópia de {nome}"` e mesmos `inputs`/`results`
- Após duplicar, redireciona para `/{ferramenta}?id={novoId}` com toast "Projeto duplicado"

---

## 10. Tour Guiado de Onboarding

**Novo arquivo:** `src/components/OnboardingTour.tsx`
**Editado:** `src/pages/Dashboard.tsx`

- Componente standalone (sem lib externa) com:
  - Overlay escuro semi-transparente
  - "Spotlight" (recorte) no elemento atual via `clip-path` ou `box-shadow` enorme
  - Tooltip ao lado com título, descrição, botões "Próximo / Pular / Anterior"
- 5 passos no Dashboard:
  1. "Bem-vindo!" (centro da tela)
  2. Spotlight nos botões de criar nova análise
  3. Spotlight nos filtros
  4. Spotlight num card de projeto (Ver/Duplicar/Excluir)
  5. Spotlight no menu lateral (ferramentas)
- Estado persistido: `localStorage.setItem('onboarding_completed', 'true')`
- Botão "Refazer tour" no footer do sidebar para reabrir manualmente

---

## Detalhes Técnicos

- Migration: 1 nova tabela `project_versions` com RLS
- Bibliotecas: nenhuma nova (usa `recharts`, `lucide-react`, `@radix-ui` já instalados)
- Total de arquivos: ~12 (3 novos + 9 editados)
- `App.tsx`: adicionar rota `/comparar` dentro de `AppLayout`
- Sidebar: novo item "Comparar projetos" (visível só quando há 2+ projetos)
- Retrocompatível com dados existentes
