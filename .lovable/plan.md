

# Plano: PDF Completo para o Simulador de Viabilidade

## Objetivo

Criar um relatório PDF mais detalhado e completo ("ficha") para o Simulador de Viabilidade, incluindo:
1. **Detalhamento de cada valor de investimento (CAPEX)**
2. **Lista de todos os lojistas/inquilinos e seus valores**
3. **Seção com 3 cenários: Pessimista, Realista e Otimista**

---

## 1. Estrutura do Novo PDF

O PDF passará de ~2 páginas para um relatório completo de 3-4 páginas com as seguintes seções:

```text
PÁGINA 1:
┌─────────────────────────────────────┐
│  SETTER TOOLBOX                     │
│  Simulador de Viabilidade           │
│  Ativo: [Nome do Projeto]           │
│  Data: 21/01/2026                   │
├─────────────────────────────────────┤
│  INDICADORES PRINCIPAIS (KPIs)      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │Cap   │ │ TIR  │ │ VPL  │ │Multi ││
│  │Rate  │ │      │ │      │ │plica.││
│  └──────┘ └──────┘ └──────┘ └──────┘│
├─────────────────────────────────────┤
│  VEREDICTO                          │
│  [Excelente/Bom/Regular/Ruim]       │
└─────────────────────────────────────┘

PÁGINA 2:
┌─────────────────────────────────────┐
│  DETALHAMENTO DO INVESTIMENTO       │
│  (Breakdown completo do CAPEX)      │
│                                     │
│  Preço de Aquisição    R$ 2.000.000 │
│  Custos de Fechamento  R$    60.000 │
│  Reforma / Retrofit    R$   100.000 │
│  Obras Turnkey         R$        0  │
│  ─────────────────────────────────  │
│  INVESTIMENTO TOTAL    R$ 2.160.000 │
├─────────────────────────────────────┤
│  RECEITA - DETALHAMENTO POR LOJISTA │
│                                     │
│  Loja 1 (Cafeteria)     R$ 15.000   │
│  Loja 2 (Farmácia)      R$ 12.000   │
│  Loja 3 (Pet Shop)      R$  8.000   │
│  ─────────────────────────────────  │
│  TOTAL MENSAL           R$ 35.000   │
│  TOTAL ANUAL           R$ 420.000   │
├─────────────────────────────────────┤
│  DESPESAS OPERACIONAIS (OPEX)       │
│                                     │
│  IPTU (Anual)           R$ 12.000   │
│  Condomínio (Anual)     R$  6.000   │
│  Taxa Administração (8%)R$  3.360   │
│  ─────────────────────────────────  │
│  TOTAL OPEX             R$ 21.360   │
└─────────────────────────────────────┘

PÁGINA 3:
┌─────────────────────────────────────┐
│  ANÁLISE DE CENÁRIOS                │
│                                     │
│ ┌─────────┬─────────┬─────────┬─────────┐
│ │ Métrica │ Pessim. │ Realista│ Otimista│
│ ├─────────┼─────────┼─────────┼─────────┤
│ │Cap Rate │  5.2%   │  7.8%   │  8.5%   │
│ │NOI Mês  │R$ 8.500 │R$12.500 │R$14.000 │
│ │Payback  │19.2 anos│13.0 anos│11.9 anos│
│ │Vacância │  20%    │   5%    │   0%    │
│ └─────────┴─────────┴─────────┴─────────┘
├─────────────────────────────────────┤
│  PREMISSAS DO MODELO                │
│                                     │
│  Índice de Reajuste     IGPM (4%)   │
│  Horizonte de Saída     10 anos     │
│  Cap Rate de Saída      7%          │
│  Custo de Oportunidade  12%         │
└─────────────────────────────────────┘
```

---

## 2. Alterações Necessárias

### 2.1 Atualizar Interface `SimuladorPDFData`

Adicionar campos para os dados detalhados:

```typescript
export interface SimuladorPDFData {
  projectName: string;
  kpis: {
    entryCapRate: number;
    irr: number;
    npv: number;
    equityMultiple: number;
    totalInvestment: number;
    noi: number;
  };
  verdict: string;
  
  // NOVOS CAMPOS
  capexBreakdown: {
    purchasePrice: number;
    closingCostsAmount: number;  // Valor em R$
    closingCostsPercent: number; // Percentual
    renovationCost: number;
    turnkeyCost: number;
  };
  
  rentalUnits: Array<{
    name: string;
    monthlyRent: number;
  }>;
  
  opexBreakdown: {
    propertyTax: number;
    condoFee: number;
    managementFee: number;
    managementAmount: number; // Valor em R$
  };
  
  scenarios: {
    pessimistic: ScenarioData;
    realistic: ScenarioData;
    optimistic: ScenarioData;
  };
  
  assumptions: {
    adjustmentIndex: string;
    rentGrowth: number;
    holdingPeriod: number;
    exitCapRate: number;
    discountRate: number;
    vacancyRate: number;
  };
}
```

### 2.2 Atualizar `generateSimuladorPDF`

Criar seções adicionais para o PDF:

**Novas Seções:**
1. **Detalhamento do Investimento (CAPEX)** - tipo `key-value`
2. **Receita por Lojista** - tipo `key-value` com subtotal
3. **Despesas Operacionais (OPEX)** - tipo `key-value`
4. **Análise de Cenários** - tipo `table` (3 colunas)
5. **Premissas do Modelo** - tipo `key-value`

### 2.3 Atualizar Chamada em `Simulador.tsx`

Passar todos os dados necessários para a função de exportação:

```typescript
const handleExportPDF = async () => {
  setIsExportingPDF(true);
  try {
    const closingCostsAmount = purchasePrice * closingCosts;
    const managementAmount = totalMonthlyRent * 12 * managementFee;
    
    await generateSimuladorPDF({
      projectName: projectName || 'Projeto sem nome',
      kpis: { ... },
      verdict: calculations.verdict,
      
      // Novos dados
      capexBreakdown: {
        purchasePrice,
        closingCostsAmount,
        closingCostsPercent: closingCosts,
        renovationCost,
        turnkeyCost: hasTurnkey ? turnkeyCost : 0,
      },
      
      rentalUnits: rentalUnits, // Array já existente
      
      opexBreakdown: {
        propertyTax,
        condoFee,
        managementFee,
        managementAmount,
      },
      
      scenarios: scenarios, // Objeto já calculado
      
      assumptions: {
        adjustmentIndex,
        rentGrowth: effectiveRentGrowth,
        holdingPeriod,
        exitCapRate,
        discountRate,
        vacancyRate,
      },
    });
    
    toast({ title: 'PDF gerado com sucesso!' });
  } catch (error) {
    toast({ title: 'Erro ao gerar PDF', variant: 'destructive' });
  } finally {
    setIsExportingPDF(false);
  }
};
```

---

## 3. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/pdfExport.ts` | Atualizar `SimuladorPDFData` e `generateSimuladorPDF` com novas seções |
| `src/pages/Simulador.tsx` | Passar dados adicionais na chamada `handleExportPDF` |

---

## 4. Detalhes de Implementação

### Seção: Detalhamento do Investimento
```typescript
{
  title: 'Detalhamento do Investimento (CAPEX)',
  type: 'key-value',
  data: [
    { label: 'Preço de Aquisição', value: formatCurrency(capexBreakdown.purchasePrice) },
    { label: `Custos de Fechamento (${formatPercentage(capexBreakdown.closingCostsPercent)})`, value: formatCurrency(capexBreakdown.closingCostsAmount) },
    { label: 'Reforma / Retrofit', value: formatCurrency(capexBreakdown.renovationCost) },
    { label: 'Obras Turnkey', value: formatCurrency(capexBreakdown.turnkeyCost) },
    { label: 'INVESTIMENTO TOTAL', value: formatCurrency(kpis.totalInvestment), highlight: true },
  ],
}
```

### Seção: Lojistas
```typescript
{
  title: 'Receita - Detalhamento por Lojista',
  type: 'key-value',
  data: [
    ...rentalUnits.map(unit => ({
      label: unit.name,
      value: formatCurrency(unit.monthlyRent) + '/mês',
    })),
    { label: 'TOTAL MENSAL', value: formatCurrency(totalMonthly), highlight: true },
    { label: 'TOTAL ANUAL', value: formatCurrency(totalMonthly * 12), highlight: true },
  ],
}
```

### Seção: Cenários
```typescript
{
  title: 'Análise de Cenários',
  type: 'table',
  columns: ['Pessimista', 'Realista', 'Otimista'],
  data: [
    { label: 'Cap Rate', values: [formatPercentage(pessimistic.capRate), formatPercentage(realistic.capRate), formatPercentage(optimistic.capRate)] },
    { label: 'NOI Mensal', values: [formatCurrency(pessimistic.noiMonthly), formatCurrency(realistic.noiMonthly), formatCurrency(optimistic.noiMonthly)] },
    { label: 'Payback', values: [`${pessimistic.paybackYears.toFixed(1)} anos`, `${realistic.paybackYears.toFixed(1)} anos`, `${optimistic.paybackYears.toFixed(1)} anos`] },
    { label: 'Vacância', values: [formatPercentage(pessimistic.vacancyPremise), formatPercentage(realistic.vacancyPremise), formatPercentage(optimistic.vacancyPremise)] },
  ],
}
```

---

## 5. Resultado Esperado

Após a implementação, o PDF do Simulador será um relatório executivo completo contendo:

- **4-6 KPIs principais** em destaque
- **Veredicto visual** com cor e descrição
- **Breakdown completo do CAPEX** com cada linha de investimento
- **Lista de todos os lojistas** com nome e valor individual
- **OPEX detalhado** com cada componente de despesa
- **Tabela de 3 cenários** (Pessimista, Realista, Otimista)
- **Premissas utilizadas** para transparência

Este formato profissional permite apresentar a análise completa a investidores e parceiros de negócio.

