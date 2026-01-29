
# Plano: Visualização Visual de Projetos para Admin

## Problema Atual

Quando você clica em "Ver" (👁️) na tela Admin Projetos, o sistema exibe os dados em **JSON bruto**:

```json
{
  "purchasePrice": 2000000,
  "closingCosts": 0.03,
  ...
}
```

Você quer ver os projetos **exatamente como o usuário vê** - com KPIs formatados, gráficos, veredictos visuais, etc.

---

## Solução Proposta

Criar componentes de visualização específicos para cada tipo de ferramenta (Simulador, Permuta, H&BU, Decisor) que renderizam os dados de forma visual e amigável.

---

## Arquivos a Criar

### 1. `src/components/admin/ProjectViewerSimulador.tsx`

Exibe projetos do Simulador com:
- KPIs: Cap Rate, TIR, VPL, Multiplicador
- Resumo do Investimento
- Veredicto visual (Excelente/Bom/Moderado/Arriscado)

### 2. `src/components/admin/ProjectViewerPermuta.tsx`

Exibe projetos de Permuta com:
- Comparativo Venda vs Parceria
- Timeline visual (aprovação → construção → venda)
- Veredicto: qual opção é melhor

### 3. `src/components/admin/ProjectViewerHBU.tsx`

Exibe projetos de Highest & Best Use com:
- Score cards (Residencial/Comercial/Misto)
- Tabela comparativa
- Recomendação vencedora

### 4. `src/components/admin/ProjectViewerDecisor.tsx`

Exibe projetos do Decisor com:
- Semáforo GO/NEGOCIAR/NO-GO
- Análise de preço (pedido vs máximo)
- Avaliação qualitativa com estrelas

---

## Arquivos a Modificar

### `src/pages/AdminProjects.tsx`

Substituir o JSON bruto no Dialog por um componente que:
1. Identifica o `project_type`
2. Renderiza o visualizador apropriado

---

## Estrutura Visual por Tipo

### Simulador - Visual Esperado

```
+------------------------------------------+
| 📊 Projeto: Loja Centro                  |
+------------------------------------------+
| Usuário: João Silva | 29/01/2026         |
+------------------------------------------+

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ CAP RATE   │ │    TIR     │ │    VPL     │ │ MULTIPLIC. │
│   8,2%     │ │   15,3%    │ │ R$ 450K    │ │   2,1x     │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

+------------------------------------------+
| Resumo do Investimento                   |
| • Investimento Total: R$ 2.060.000       |
| • NOI Ano 1: R$ 168.000                  |
| • Yield Anual: 8,2%                      |
+------------------------------------------+

                    ┌──────────────┐
        Veredicto:  │  EXCELENTE   │
                    └──────────────┘
```

### Permuta - Visual Esperado

```
+------------------------------------------+
| 🔄 Projeto: Terreno Av. Paulista         |
+------------------------------------------+

┌─────────────────┐     ┌─────────────────┐
│  VENDER AGORA   │ VS  │    PARCERIA     │
│                 │     │                 │
│  R$ 8.000.000   │     │ R$ 9.500.000    │
│                 │     │ (Valor Presente)│
└─────────────────┘     └─────────────────┘

+------------------------------------------+
| 📊 Análise                               |
| • Prazo Total: 5 anos                    |
| • VP das Unidades: R$ 6.5M               |
| • Custo de Carrego: -R$ 180K             |
+------------------------------------------+

           ┌──────────────────────┐
  MELHOR:  │  PARCERIA (+18,7%)   │
           └──────────────────────┘
```

### Decisor - Visual Esperado

```
+------------------------------------------+
| ⚖️ Projeto: Galpão Logístico ABC         |
+------------------------------------------+

        ┌─────────────────────────┐
        │         🟢 GO           │
        │   Avance com negociação │
        └─────────────────────────┘

┌────────────┐ ┌────────────┐
│ CAP RATE   │ │   SCORE    │
│  0,72%/mês │ │   75/100   │
└────────────┘ └────────────┘

+------------------------------------------+
| Análise de Preço                         |
| • Preço Pedido: R$ 5M                    |
| • Preço Máximo: R$ 5,8M                  |
| • Gap: +R$ 800K (+16%)                   |
+------------------------------------------+

| ⭐⭐⭐⭐⭐ Localização                      |
| ⭐⭐⭐⭐☆ Risco Inquilino                  |
| ⭐⭐⭐☆☆ Liquidez Futura                  |
| ⭐⭐⭐⭐☆ Condição do Ativo                |
```

### H&BU - Visual Esperado

```
+------------------------------------------+
| 🏗️ Projeto: Terreno Zona Mista           |
+------------------------------------------+

┌────────────┐ ┌────────────┐ ┌────────────┐
│RESIDENCIAL │ │ COMERCIAL  │ │ USO MISTO  │
│   72 pts   │ │   85 pts   │ │   78 pts   │
│            │ │  🏆 WINNER │ │            │
└────────────┘ └────────────┘ └────────────┘

+------------------------------------------+
| Comparativo                              |
|             Resid.  Comerc.   Misto      |
| VGV         R$ 24M  R$ 30M    R$ 27M     |
| Lucro       R$ 4M   R$ 6M     R$ 5M      |
| NPV         R$ 2,8M R$ 4,2M   R$ 3,5M    |
| Margem      16,7%   20%       18,5%      |
+------------------------------------------+

RECOMENDAÇÃO: Comercial
"Maior VPL e margem, localização central
favorece uso comercial."
```

---

## Detalhes Técnicos

### Componente Principal de Roteamento

```typescript
// src/components/admin/ProjectViewer.tsx
import { ProjectViewerSimulador } from './ProjectViewerSimulador';
import { ProjectViewerPermuta } from './ProjectViewerPermuta';
import { ProjectViewerHBU } from './ProjectViewerHBU';
import { ProjectViewerDecisor } from './ProjectViewerDecisor';

interface ProjectViewerProps {
  projectType: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  projectName: string;
  userName?: string;
  updatedAt?: string;
}

export function ProjectViewer({ projectType, ...props }: ProjectViewerProps) {
  switch (projectType) {
    case 'simulador':
      return <ProjectViewerSimulador {...props} />;
    case 'permuta':
      return <ProjectViewerPermuta {...props} />;
    case 'highest-best-use':
    case 'hbu':
      return <ProjectViewerHBU {...props} />;
    case 'decisor':
      return <ProjectViewerDecisor {...props} />;
    default:
      return <FallbackJSONViewer {...props} />;
  }
}
```

### Atualização do Dialog em AdminProjects

```typescript
// Substituir o JSON por:
<DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
  <ProjectViewer
    projectType={viewingProject.project_type}
    inputs={viewingProject.inputs}
    results={viewingProject.results}
    projectName={viewingProject.name}
    userName={viewingProject.user_name}
    updatedAt={viewingProject.updated_at}
  />
</DialogContent>
```

---

## Benefícios

| Antes | Depois |
|-------|--------|
| JSON bruto difícil de ler | Visual rico e intuitivo |
| Precisa interpretar dados | KPIs formatados prontos |
| Sem contexto visual | Veredictos coloridos |
| Igual para todos os tipos | Customizado por ferramenta |

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/admin/ProjectViewer.tsx` | **Novo** - Componente roteador |
| `src/components/admin/ProjectViewerSimulador.tsx` | **Novo** |
| `src/components/admin/ProjectViewerPermuta.tsx` | **Novo** |
| `src/components/admin/ProjectViewerHBU.tsx` | **Novo** |
| `src/components/admin/ProjectViewerDecisor.tsx` | **Novo** |
| `src/pages/AdminProjects.tsx` | **Modificar** - Usar ProjectViewer no Dialog |

---

## Reutilização de Componentes Existentes

Os visualizadores irão reutilizar componentes já existentes:
- `KPICard` - Para exibir métricas formatadas
- `VerdictBadge` - Para mostrar veredictos visuais
- `formatCurrency`, `formatPercentage` - Para formatação de valores
- Estilos e cores do design system atual
