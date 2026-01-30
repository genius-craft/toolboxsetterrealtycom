
# Plano: Corrigir Cálculo do Cap Rate na Análise de Sensibilidade

## Problema Identificado

A **Análise de Sensibilidade** (SensitivityHeatmap) está usando uma fórmula **simplificada e incorreta**:

```typescript
// Atual - INCORRETO
const sensitivityCapRateCalc = useCallback((investment: number, annualRent: number) => {
  return investment > 0 ? annualRent / investment : 0;  // Ignora despesas!
}, []);
```

### Comparação das Fórmulas

| Local | Fórmula Atual | Fórmula Correta |
|-------|---------------|-----------------|
| `calculations.entryCapRate` | `NOI / Investimento` | Correto |
| `sensitivityCapRateCalc` | `Aluguel Bruto / Investimento` | **INCORRETO** |

### O que está faltando no cálculo

1. **Vacância** - Taxa de desocupação
2. **IPTU** - Imposto predial anual
3. **Condomínio** - Taxa condominial anual
4. **Taxa de Administração** - % sobre receita efetiva

---

## Solução Proposta

### 1. Atualizar interface do SensitivityHeatmap

**Arquivo:** `src/components/tools/SensitivityHeatmap.tsx`

Modificar para receber parâmetros de OPEX em vez de uma função de cálculo:

```typescript
interface SensitivityHeatmapProps {
  baseInvestment: number;
  baseMonthlyRent: number;       // Aluguel mensal base
  vacancyRate: number;           // Taxa de vacância (0.05 = 5%)
  propertyTax: number;           // IPTU anual (R$)
  condoFee: number;              // Condomínio anual (R$)
  managementFeeRate: number;     // Taxa administração (0.08 = 8%)
  className?: string;
}
```

### 2. Implementar cálculo real do NOI dentro do componente

Nova lógica para cada célula da matriz:

```typescript
const matrix = useMemo(() => {
  return VARIATIONS.map((rentVar) => {
    return VARIATIONS.map((invVar) => {
      // Ajustar valores base pelas variações
      const adjustedInvestment = baseInvestment * (1 + invVar);
      const adjustedMonthlyRent = baseMonthlyRent * (1 + rentVar);
      
      // Calcular NOI real
      const annualGrossRent = adjustedMonthlyRent * 12;
      const effectiveRent = annualGrossRent * (1 - vacancyRate);
      const managementFee = effectiveRent * managementFeeRate;
      const totalOpex = propertyTax + condoFee + managementFee;
      const noi = effectiveRent - totalOpex;
      
      // Cap Rate = NOI / Investimento Total
      const capRate = adjustedInvestment > 0 ? noi / adjustedInvestment : 0;
      
      return {
        capRate,
        investment: adjustedInvestment,
        rent: adjustedMonthlyRent,
        noi,
        isBase: invVar === 0 && rentVar === 0,
      };
    });
  });
}, [baseInvestment, baseMonthlyRent, vacancyRate, propertyTax, condoFee, managementFeeRate]);
```

### 3. Atualizar chamada no Simulador.tsx

**Arquivo:** `src/pages/Simulador.tsx`

Remover a função `sensitivityCapRateCalc` e passar os parâmetros de OPEX:

```tsx
// Remover
const sensitivityCapRateCalc = useCallback(...);

// Atualizar
<SensitivityHeatmap
  baseInvestment={calculations.totalInvestment}
  baseMonthlyRent={totalMonthlyRent}
  vacancyRate={vacancyRate}
  propertyTax={propertyTax}
  condoFee={condoFee}
  managementFeeRate={managementFee}
/>
```

### 4. Atualizar generateSensitivityMatrix em calculations.ts

**Arquivo:** `src/lib/calculations.ts`

Atualizar a função para calcular NOI real:

```typescript
export function generateSensitivityMatrix(
  baseInvestment: number,
  baseMonthlyRent: number,
  vacancyRate: number,
  propertyTax: number,
  condoFee: number,
  managementFeeRate: number,
  variations: number[] = [-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15]
): SensitivityCell[][] {
  return variations.map((rentVar) => {
    return variations.map((invVar) => {
      const adjustedInvestment = baseInvestment * (1 + invVar);
      const adjustedMonthlyRent = baseMonthlyRent * (1 + rentVar);
      
      // Calcular NOI real
      const annualGrossRent = adjustedMonthlyRent * 12;
      const effectiveRent = annualGrossRent * (1 - vacancyRate);
      const managementFee = effectiveRent * managementFeeRate;
      const noi = effectiveRent - propertyTax - condoFee - managementFee;
      
      // Cap Rate = NOI / Investimento
      const capRate = adjustedInvestment > 0 ? noi / adjustedInvestment : 0;
      
      return {
        capRate,
        investment: adjustedInvestment,
        rent: adjustedMonthlyRent,
        isBase: invVar === 0 && rentVar === 0,
      };
    });
  });
}
```

---

## Resumo de Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `src/components/tools/SensitivityHeatmap.tsx` | Nova interface com OPEX + cálculo NOI real |
| `src/pages/Simulador.tsx` | Remover função simplificada, passar parâmetros OPEX |
| `src/lib/calculations.ts` | Atualizar `generateSensitivityMatrix()` com NOI real |

---

## Impacto Visual Esperado

**Antes (incorreto):**
- Células mostrando Cap Rates inflados (ex: 9.0%, 10.5%)
- Cenários parecem mais atrativos do que realmente são

**Depois (correto):**
- Cap Rates refletindo rentabilidade real após despesas
- Valores menores e mais conservadores (ex: 6.5%, 7.2%)
- Melhor tomada de decisão para o investidor

---

## Exemplo de Cálculo

Para um cenário base:
- Investimento: R$ 2.060.000
- Aluguel Mensal: R$ 15.000
- Vacância: 5%
- IPTU: R$ 12.000/ano
- Condomínio: R$ 6.000/ano
- Taxa Administração: 8%

**Cálculo Incorreto (atual):**
```
Cap Rate = (15.000 × 12) / 2.060.000 = 8.74%
```

**Cálculo Correto (proposto):**
```
Receita Bruta = 15.000 × 12 = 180.000
Receita Efetiva = 180.000 × (1 - 0.05) = 171.000
Taxa Administração = 171.000 × 0.08 = 13.680
OPEX Total = 12.000 + 6.000 + 13.680 = 31.680
NOI = 171.000 - 31.680 = 139.320
Cap Rate = 139.320 / 2.060.000 = 6.76%
```

Diferença: **-1.98 pontos percentuais** - muito significativo para decisões de investimento!
