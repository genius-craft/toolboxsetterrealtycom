

# Plano: Nova Ferramenta - Preço Teto 🎯

## Objetivo

Criar a **5ª ferramenta independente** do Setter Toolbox chamada "Preço Teto" que inverte a lógica do Simulador: dado um retorno alvo (TIR ou Cap Rate), calcula automaticamente o **preço máximo de aquisição**.

---

## Conceito

```text
┌─────────────────────────────────────────────────────────────┐
│  SIMULADOR (Lógica Normal)                                  │
│  Preço R$ 2M + Inputs → TIR = 12,5%                         │
│                                                             │
│  PREÇO TETO (Lógica Inversa)                                │
│  TIR Alvo 15% + Inputs → Preço Máximo = R$ 1,65M            │
└─────────────────────────────────────────────────────────────┘
```

---

## Resultado Visual

A ferramenta terá o mesmo layout das outras (ToolLayout), com inputs à esquerda e dashboard à direita:

```text
┌──────────────────────────────────────┬──────────────────────────────────┐
│           INPUTS (Esquerda)          │       DASHBOARD (Direita)        │
├──────────────────────────────────────┼──────────────────────────────────┤
│                                      │                                  │
│  📝 Nome do Projeto                  │  ┌────────────────────────────┐  │
│  ___________________________         │  │   PREÇO TETO               │  │
│                                      │  │                            │  │
│  ┌─────────────────────────────────┐ │  │   R$ 1.850.000             │  │
│  │ 🎯 Retorno Alvo                 │ │  │                            │  │
│  │                                 │ │  │   Para atingir TIR de 15%  │  │
│  │  ○ Por Cap Rate                 │ │  └────────────────────────────┘  │
│  │  ● Por TIR                      │ │                                  │
│  │                                 │ │  ┌──────────┐ ┌──────────┐       │
│  │  TIR Alvo: [15%] ───────○───    │ │  │ TIR      │ │ Cap Rate │       │
│  └─────────────────────────────────┘ │  │ 15.0%    │ │ 7.2%     │       │
│                                      │  └──────────┘ └──────────┘       │
│  ┌─────────────────────────────────┐ │                                  │
│  │ 💰 Receita                      │ │  ┌────────────────────────────┐  │
│  │                                 │ │  │ Comparativo                │  │
│  │  Aluguel Mensal: R$ 15.000      │ │  │                            │  │
│  │  Crescimento:    3% a.a.        │ │  │  Se pagar R$ 2.000.000:    │  │
│  │  Vacância:       5%             │ │  │  TIR seria 11,2%           │  │
│  └─────────────────────────────────┘ │  │  Cap seria 6,1%            │  │
│                                      │  │                            │  │
│  ┌─────────────────────────────────┐ │  │  Margem de negociação:     │  │
│  │ 📊 Custos                       │ │  │  R$ 150.000 (8,1%)         │  │
│  │                                 │ │  └────────────────────────────┘  │
│  │  Custos Fechamento: 4%          │ │                                  │
│  │  Custo Obra: R$ 100.000         │ │  [💾 Salvar]  [📄 PDF]          │
│  │  IPTU: R$ 8.000/ano             │ │                                  │
│  │  Condomínio: R$ 500/mês         │ │                                  │
│  │  Taxa Adm: 8%                   │ │                                  │
│  └─────────────────────────────────┘ │                                  │
│                                      │                                  │
│  ┌─────────────────────────────────┐ │                                  │
│  │ 📅 Horizonte                    │ │                                  │
│  │                                 │ │                                  │
│  │  Período Holding: 10 anos       │ │                                  │
│  │  Cap Rate Saída: 7%             │ │                                  │
│  └─────────────────────────────────┘ │                                  │
└──────────────────────────────────────┴──────────────────────────────────┘
```

---

## Arquitetura

| Elemento | Valor |
|----------|-------|
| Rota | `/preco-teto` |
| Título | Preço Teto |
| Ícone Sidebar | `Target` (lucide-react) |
| Tipo de Projeto | `preco_teto` |
| Layout | ToolLayout (igual às outras) |

---

## Arquivos a Criar/Modificar

### 1. NOVO: `src/pages/PrecoTeto.tsx`

Página principal da ferramenta seguindo o padrão do Simulador.tsx:

**Inputs (Esquerda):**
- Nome do projeto (ProjectHeader simplificado)
- Card "Retorno Alvo": 
  - Radio: Por Cap Rate ou Por TIR
  - Slider para retorno alvo (1% a 30%)
  - Input opcional: "Preço de referência" para comparativo
- Card "Receita": Aluguel mensal, crescimento, vacância
- Card "Custos": Fechamento (%), obra, IPTU, condomínio, taxa adm
- Card "Horizonte": Período holding, cap rate saída

**Dashboard (Direita):**
- Card destacado com PREÇO TETO calculado
- KPIs: TIR e Cap Rate resultantes no preço teto
- Card Comparativo: mostra "Se pagar R$ X, a TIR seria Y%"
- Resumo do investimento
- Botões Salvar e PDF

---

### 2. `src/lib/calculations.ts`

Adicionar duas novas funções:

```typescript
// Cálculo direto para Cap Rate
export function calculateMaxPriceByCapRate(
  noi: number,
  targetCapRate: number,
  closingCostsRate: number,
  constructionCost: number
): number {
  // Cap Rate = NOI / Investimento Total
  // Investimento Total = Preço × (1 + closingCosts) + construction
  // Preço = (NOI / targetCapRate - construction) / (1 + closingCosts)
  
  if (targetCapRate <= 0) return 0;
  const totalInvestmentNeeded = noi / targetCapRate;
  const maxPrice = (totalInvestmentNeeded - constructionCost) / (1 + closingCostsRate);
  return Math.max(0, maxPrice);
}

// Busca binária para TIR
export function calculateMaxPriceByIRR(
  params: {
    targetIRR: number;
    annualRent: number;
    rentGrowth: number;
    vacancyRate: number;
    operatingExpenses: number;
    holdingPeriod: number;
    exitCapRate: number;
    closingCostsRate: number;
    constructionCost: number;
  }
): number {
  // Busca binária entre R$ 100k e R$ 100M
  // Converge quando diferença < R$ 1.000
}
```

---

### 3. `src/hooks/useProjects.ts`

Adicionar novo tipo ao union:

```typescript
export type ProjectType = 'simulador' | 'permuta' | 'hbu' | 'decisor' | 'preco_teto';
```

---

### 4. `src/hooks/useAdminProjects.ts`

Adicionar ao union type:

```typescript
export type ProjectType = 'simulador' | 'permuta' | 'highest-best-use' | 'decisor' | 'preco_teto';
```

---

### 5. `src/App.tsx`

Adicionar nova rota:

```typescript
import PrecoTeto from "./pages/PrecoTeto";

<Route path="/preco-teto" element={
  <AppLayout title="Preço Teto">
    <PrecoTeto />
  </AppLayout>
} />
```

---

### 6. `src/components/layout/AppSidebar.tsx`

Adicionar item ao menu:

```typescript
const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Simulador', url: '/simulador', icon: Calculator },
  { title: 'Permuta', url: '/permuta', icon: ArrowLeftRight },
  { title: 'H&BU', url: '/highest-best-use', icon: BarChart3 },
  { title: 'Decisor', url: '/decisor', icon: CheckCircle },
  { title: 'Preço Teto', url: '/preco-teto', icon: Target },  // NOVO
];
```

---

### 7. `src/components/tools/InfoTooltip.tsx`

Adicionar termos ao glossário:

```typescript
maxPrice: {
  title: 'Preço Teto',
  description: 'Valor máximo que você pode pagar pelo imóvel para atingir o retorno alvo. Considera custos de fechamento, obra e projeções de receita/despesa.',
},
targetIRR: {
  title: 'TIR Alvo',
  description: 'Taxa Interna de Retorno desejada para o investimento. A calculadora encontra o preço que resulta exatamente nesta TIR.',
},
referencePrice: {
  title: 'Preço de Referência',
  description: 'Valor pedido pelo vendedor ou preço de mercado. Usado para calcular a margem de negociação em relação ao preço teto.',
},
```

---

### 8. `src/lib/pdfExport.ts`

Adicionar função de exportação:

```typescript
export interface PrecoTetoPDFData {
  projectName: string;
  calculationMode: 'capRate' | 'irr';
  targetReturn: number;
  maxPrice: number;
  referencePrice: number | null;
  kpis: {
    resultingCapRate: number;
    resultingIRR: number;
    totalInvestment: number;
    noi: number;
  };
  inputs: {
    monthlyRent: number;
    rentGrowth: number;
    vacancyRate: number;
    closingCosts: number;
    constructionCost: number;
    operatingExpenses: number;
    holdingPeriod: number;
    exitCapRate: number;
  };
}

export async function generatePrecoTetoPDF(data: PrecoTetoPDFData): Promise<void>
```

---

### 9. NOVO: `src/components/admin/ProjectViewerPrecoTeto.tsx`

Visualizador para admin ver projetos deste tipo, seguindo o padrão do ProjectViewerSimulador.tsx.

---

### 10. `src/components/admin/ProjectViewer.tsx`

Adicionar case para o novo tipo:

```typescript
case 'preco_teto':
  return <ProjectViewerPrecoTeto {...commonProps} />;
```

---

## Detalhes Técnicos

### Algoritmo de Busca Binária (TIR)

```typescript
function calculateMaxPriceByIRR(params): number {
  let minPrice = 100_000;      // R$ 100k
  let maxPrice = 100_000_000;  // R$ 100M
  const tolerance = 1000;       // R$ 1.000

  while (maxPrice - minPrice > tolerance) {
    const midPrice = (minPrice + maxPrice) / 2;
    
    // Calcula investimento total com este preço
    const totalInvestment = midPrice * (1 + closingCostsRate) + constructionCost;
    
    // Projeta fluxos de caixa
    const cashFlows = projectCashFlows({
      totalInvestment,
      annualRent,
      rentGrowth,
      vacancyRate,
      operatingExpenses,
      expenseGrowth: 0.02,
      holdingPeriod,
      exitCapRate,
    });
    
    // Calcula TIR resultante
    const irr = calculateIRR(cashFlows);
    
    if (irr > targetIRR) {
      minPrice = midPrice; // Pode pagar mais
    } else {
      maxPrice = midPrice; // Precisa pagar menos
    }
  }
  
  return (minPrice + maxPrice) / 2;
}
```

### Fórmula Direta (Cap Rate)

```text
Cap Rate = NOI / Investimento Total
Investimento Total = Preço × (1 + custosFechamento) + custoObra

Resolvendo para Preço:
Preço Máximo = (NOI / Cap Rate Alvo - custoObra) / (1 + custosFechamento)
```

---

## Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/PrecoTeto.tsx` | **CRIAR** - Página principal |
| `src/lib/calculations.ts` | Adicionar `calculateMaxPriceByCapRate` e `calculateMaxPriceByIRR` |
| `src/hooks/useProjects.ts` | Adicionar tipo `preco_teto` |
| `src/hooks/useAdminProjects.ts` | Adicionar tipo `preco_teto` |
| `src/App.tsx` | Adicionar rota `/preco-teto` |
| `src/components/layout/AppSidebar.tsx` | Adicionar item "Preço Teto" no menu |
| `src/components/tools/InfoTooltip.tsx` | Adicionar termos `maxPrice`, `targetIRR`, `referencePrice` |
| `src/lib/pdfExport.ts` | Adicionar `generatePrecoTetoPDF` |
| `src/components/admin/ProjectViewerPrecoTeto.tsx` | **CRIAR** - Visualizador admin |
| `src/components/admin/ProjectViewer.tsx` | Adicionar case para `preco_teto` |

---

## Notas de Implementação

- A busca binária converge em ~20 iterações (log₂ de 100M/1000)
- Reutiliza componentes existentes: `CurrencyInput`, `PercentageSlider`, `CollapsibleInputCard`, `KPICard`
- Layout segue padrão do `ToolLayout` (inputs à esquerda, dashboard à direita)
- Salvamento usa mesma estrutura `toolbox_projects` com `project_type: 'preco_teto'`
- O card "Comparativo" mostra a diferença entre o preço teto e o preço de referência (se informado)

