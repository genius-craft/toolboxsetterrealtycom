
# Plano: Corrigir Cálculo da Taxa de Administração

## Problema Identificado

A taxa de administração está sendo calculada sobre o **aluguel bruto total**, quando deveria ser calculada sobre o **valor efetivamente recebido** (após desconto da vacância).

**Cálculo Atual (INCORRETO):**
```
Taxa Admin = Aluguel Bruto × Taxa
```

**Cálculo Correto:**
```
Taxa Admin = (Aluguel Bruto × (1 - Vacância)) × Taxa
           = Valor Recebido × Taxa
```

### Exemplo Numérico

| Situação | Valor |
|----------|-------|
| Aluguel Bruto Anual | R$ 420.000 |
| Vacância | 5% |
| Aluguel Efetivo | R$ 399.000 |
| Taxa Admin (8%) | |

- **Atual (errado):** R$ 420.000 × 8% = R$ 33.600
- **Correto:** R$ 399.000 × 8% = R$ 31.920

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Simulador.tsx` | Ajustar cálculo nas linhas 148-152 |
| `src/lib/calculations.ts` | Ajustar `calculateScenarioMetrics` nas linhas 358-362 |
| `src/lib/pdfExport.ts` | Verificar se PDF usa a fórmula correta |

---

## Alterações Detalhadas

### 1. Simulador.tsx (linhas 145-152)

**Antes:**
```typescript
const annualRent = totalMonthlyRent * 12;
const annualManagement = annualRent * managementFee;
const operatingExpenses = propertyTax + condoFee + annualManagement;
const effectiveGrossIncome = annualRent * (1 - vacancyRate);
const noi = effectiveGrossIncome - operatingExpenses;
```

**Depois:**
```typescript
const annualRent = totalMonthlyRent * 12;
const effectiveGrossIncome = annualRent * (1 - vacancyRate);
const annualManagement = effectiveGrossIncome * managementFee; // Corrigido!
const operatingExpenses = propertyTax + condoFee + annualManagement;
const noi = effectiveGrossIncome - operatingExpenses;
```

### 2. calculations.ts - calculateScenarioMetrics (linhas 356-362)

**Antes:**
```typescript
const annualRent = inputs.monthlyRent * 12;
const annualManagement = annualRent * inputs.managementFee;
const operatingExpenses = inputs.propertyTax + inputs.condoFee + annualManagement;
const effectiveGrossIncome = annualRent * (1 - vacancyRate);
```

**Depois:**
```typescript
const annualRent = inputs.monthlyRent * 12;
const effectiveGrossIncome = annualRent * (1 - vacancyRate);
const annualManagement = effectiveGrossIncome * inputs.managementFee; // Corrigido!
const operatingExpenses = inputs.propertyTax + inputs.condoFee + annualManagement;
```

### 3. Atualização do PDF Export

O cálculo do `managementAmount` na exportação PDF também precisa ser ajustado:

**Em Simulador.tsx handleExportPDF (linhas 294-295):**

**Antes:**
```typescript
const annualRent = totalMonthlyRent * 12;
const managementAmount = annualRent * managementFee;
```

**Depois:**
```typescript
const annualRent = totalMonthlyRent * 12;
const effectiveRent = annualRent * (1 - vacancyRate);
const managementAmount = effectiveRent * managementFee;
```

---

## Impacto da Correção

Após a correção:

1. **NOI será maior** - porque as despesas operacionais serão menores
2. **Cap Rate será maior** - proporcionalmente ao aumento do NOI
3. **TIR e VPL serão maiores** - fluxos de caixa mais positivos
4. **Veredicto pode melhorar** - dependendo dos valores

A correção reflete a prática real do mercado imobiliário onde a taxa de administração é cobrada apenas sobre os valores efetivamente recebidos.

---

## Resultado Esperado

Ao exportar o PDF ou visualizar os resultados, o valor da taxa de administração será calculado corretamente como:

**Taxa de Administração = Valor Recebido × Taxa Administrativa**

E este valor aparecerá como despesa a descontar do NOI.
