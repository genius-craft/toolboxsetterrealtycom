
# Plano: Correção de Erros na Revisão

## Resumo dos Erros Identificados

| Erro | Arquivo | Gravidade |
|------|---------|-----------|
| Vacância não deduzida no NOI | `src/pages/Decisor.tsx` | **Crítico** |
| Taxa Administração sobre Receita Bruta (deveria ser Efetiva) | `src/pages/Decisor.tsx` | Alto |
| Label incorreto no PDF: "TOTAL OPEX (Total Efetivamente Recebido)" | `src/lib/pdfExport.ts` | Médio |
| PDF do Decisor não mostra vacância no OPEX | `src/lib/pdfExport.ts` | Médio |

---

## 1. Corrigir Cálculo do NOI no Decisor

**Arquivo:** `src/pages/Decisor.tsx`

### Problema Atual (linhas 107-112)
```typescript
const annualGrossRent = monthlyRent * 12;
const annualCondoFee = condoFee * 12;
const annualManagementFee = annualGrossRent * managementFee; // ❌ Sobre bruto
const totalOpex = annualCondoFee + propertyTax + annualManagementFee;
const annualNOI = annualGrossRent - totalOpex; // ❌ Sem vacância
```

### Solução
Adicionar campo de vacância e corrigir a fórmula:

```typescript
// Novo estado
const [vacancyRate, setVacancyRate] = useState(0.05); // 5%

// Cálculos corrigidos
const annualGrossRent = monthlyRent * 12;
const effectiveGrossIncome = annualGrossRent * (1 - vacancyRate); // ✅ Deduz vacância
const annualCondoFee = condoFee * 12;
const annualManagementFee = effectiveGrossIncome * managementFee; // ✅ Sobre efetivo
const totalOpex = annualCondoFee + propertyTax + annualManagementFee;
const annualNOI = effectiveGrossIncome - totalOpex; // ✅ NOI real
```

### Adicionar Input de Vacância

Na seção "Custos Operacionais (OPEX)" (por volta da linha 475), adicionar:

```tsx
<PercentageSlider
  label="Taxa de Vacância"
  value={vacancyRate}
  onChange={setVacancyRate}
  min={0}
  max={0.20}
  step={0.01}
  tooltip="vacancyRate"
/>
```

### Atualizar Dashboard de OPEX

Na estrutura de custos no Dashboard (linhas 309-335), mostrar a vacância:

```tsx
<div className="space-y-2 text-sm">
  <div className="flex justify-between">
    <span className="text-muted-foreground">Receita Bruta</span>
    <span className="font-mono">{formatCompactCurrency(annualGrossRent)}/ano</span>
  </div>
  <div className="flex justify-between">
    <span className="text-muted-foreground">- Vacância ({formatPercentage(vacancyRate)})</span>
    <span className="font-mono text-red-500">-{formatCompactCurrency(annualGrossRent * vacancyRate)}/ano</span>
  </div>
  <div className="flex justify-between">
    <span className="text-muted-foreground">= Receita Efetiva</span>
    <span className="font-mono">{formatCompactCurrency(effectiveGrossIncome)}/ano</span>
  </div>
  {/* ... resto dos custos ... */}
</div>
```

### Atualizar Funções de Save/Load/Export

Adicionar `vacancyRate` e `effectiveGrossIncome` em:
- `handleSave()` (inputs)
- `handleLoadProject()` 
- `handleExportPDF()`

---

## 2. Corrigir Label no PDF do Simulador

**Arquivo:** `src/lib/pdfExport.ts`

### Problema (linha 484)
```typescript
{ label: 'TOTAL OPEX (Total Efetivamente Recebido)', value: formatCurrency(totalOpex), highlight: true },
```

**"Total Efetivamente Recebido"** é uma descrição de RECEITA, não de DESPESA. Isso confunde o leitor.

### Solução (linha 484)
```typescript
{ label: 'TOTAL OPEX ANUAL', value: formatCurrency(totalOpex), highlight: true },
```

---

## 3. Corrigir PDF do Decisor para Mostrar Vacância

**Arquivo:** `src/lib/pdfExport.ts`

### Atualizar Interface (linhas 510-517)

```typescript
opex?: {
  condoFee: number;
  propertyTax: number;
  managementFee: number;
  vacancyRate: number;           // ✅ Novo
  annualGrossRent: number;
  effectiveGrossIncome: number;  // ✅ Novo
  totalOpex: number;
  annualNOI: number;
};
```

### Atualizar Seção OPEX no PDF (linhas 567-578)

```typescript
if (data.opex && data.opex.totalOpex > 0) {
  sections.push({
    title: 'Custos Operacionais (OPEX)',
    type: 'key-value',
    data: [
      { label: 'Receita Bruta Anual', value: formatCurrency(data.opex.annualGrossRent) },
      { label: `Vacância (${formatPercentage(data.opex.vacancyRate)})`, value: `-${formatCurrency(data.opex.annualGrossRent * data.opex.vacancyRate)}` },
      { label: 'Receita Efetiva', value: formatCurrency(data.opex.effectiveGrossIncome) },
      { label: 'Condomínio (anual)', value: `-${formatCurrency(data.opex.condoFee * 12)}` },
      { label: 'IPTU (anual)', value: `-${formatCurrency(data.opex.propertyTax)}` },
      { label: `Taxa Adm (${formatPercentage(data.opex.managementFee)})`, value: `-${formatCurrency(data.opex.effectiveGrossIncome * data.opex.managementFee)}` },
      { label: 'NOI Líquido Anual', value: formatCurrency(data.opex.annualNOI), highlight: true },
    ],
  });
}
```

---

## 4. Atualizar Glossário com Termo de Vacância

**Arquivo:** `src/components/tools/InfoTooltip.tsx`

O termo `vacancyRate` já existe no glossário, mas vamos validar que está correto:

```typescript
vacancyRate: {
  title: 'Taxa de Vacância',
  description: 'Percentual médio de desocupação esperado. Imóveis comerciais bem localizados: 3-5%. Imóveis em áreas secundárias: 8-15%.',
},
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `src/pages/Decisor.tsx` | Adicionar estado `vacancyRate`, corrigir cálculos NOI, atualizar UI do OPEX, atualizar save/load/export |
| `src/lib/pdfExport.ts` | Corrigir label "TOTAL OPEX", adicionar vacância na interface e seção do Decisor |

---

## Comparativo Antes/Depois

### Cálculo do NOI no Decisor

**Antes (incorreto):**
```
Aluguel Mensal: R$ 33.333
Receita Bruta Anual: R$ 400.000
Condomínio: R$ 0
IPTU: R$ 0
Taxa Adm (8%): R$ 32.000 (sobre bruto)
NOI: R$ 400.000 - R$ 32.000 = R$ 368.000
```

**Depois (correto):**
```
Aluguel Mensal: R$ 33.333
Receita Bruta Anual: R$ 400.000
Vacância (5%): -R$ 20.000
Receita Efetiva: R$ 380.000
Condomínio: R$ 0
IPTU: R$ 0
Taxa Adm (8%): R$ 30.400 (sobre efetivo)
NOI: R$ 380.000 - R$ 30.400 = R$ 349.600
```

**Diferença no NOI:** R$ 18.400/ano (5% a menos - impacto significativo na decisão de investimento!)

---

## Benefícios

1. **Consistência**: Simulador e Decisor usarão a mesma lógica de cálculo
2. **Precisão**: NOI refletirá a realidade do mercado imobiliário
3. **Clareza**: Labels corretos no PDF evitam confusão
4. **Profissionalismo**: Relatórios mais completos com detalhamento de vacância
