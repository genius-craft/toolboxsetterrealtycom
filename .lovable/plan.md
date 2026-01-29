

# Plano: Adicionar Dados de OPEX ao Decisor

## Objetivo

Adicionar campos de despesas operacionais (OPEX) ao calculador Decisor para que o NOI seja calculado corretamente, descontando:
1. **Condomínio** - Taxa mensal de condomínio
2. **IPTU** - Imposto predial (valor anual)
3. **Taxa de Administração** - Percentual sobre o aluguel recebido

---

## Lógica Atual vs. Nova

| Métrica | Antes | Depois |
|---------|-------|--------|
| NOI Anual | `Aluguel × 12` | `(Aluguel × 12) - Condomínio Anual - IPTU - Taxa Adm Anual` |
| Cap Rate | Baseado no aluguel bruto | Baseado no NOI líquido real |

---

## Alterações Necessárias

### 1. Novos Campos no Formulário (`Decisor.tsx`)

Adicionar nova seção "Custos Operacionais (OPEX)" com:

```text
+------------------------------------+
|  CUSTOS OPERACIONAIS (OPEX)    ▼   |
+------------------------------------+
| Condomínio (mensal)                |
| R$ [__________________]            |
|                                    |
| IPTU (anual)                       |
| R$ [__________________]            |
|                                    |
| Taxa de Administração              |
| [====●===============] 8%          |
+------------------------------------+
```

### 2. Atualizar Cálculo do NOI

```typescript
// Novos estados
const [condoFee, setCondoFee] = useState(0);      // mensal
const [propertyTax, setPropertyTax] = useState(0); // anual
const [managementFee, setManagementFee] = useState(0.08); // 8%

// Cálculo do NOI
const annualGrossRent = monthlyRent * 12;
const annualCondoFee = condoFee * 12;
const annualManagementFee = annualGrossRent * managementFee;
const annualNOI = annualGrossRent - annualCondoFee - propertyTax - annualManagementFee;
```

### 3. Exibir Resumo de OPEX no Dashboard

Adicionar card mostrando a decomposição:

```text
+----------------------------------+
| Estrutura de Custos (OPEX)       |
+----------------------------------+
| Receita Bruta      R$ 400.000/ano|
| - Condomínio       R$ 12.000/ano |
| - IPTU             R$ 8.000/ano  |
| - Taxa Adm (8%)    R$ 32.000/ano |
+----------------------------------+
| = NOI Líquido      R$ 348.000/ano|
+----------------------------------+
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Decisor.tsx` | Adicionar estados e inputs de OPEX, atualizar cálculo do NOI |
| `src/lib/pdfExport.ts` | Incluir OPEX no relatório PDF |

---

## Detalhes Técnicos

### Estados a adicionar:

```typescript
// OPEX inputs
const [condoFee, setCondoFee] = useState(0);
const [propertyTax, setPropertyTax] = useState(0);
const [managementFee, setManagementFee] = useState(0.08);
```

### Cálculo atualizado:

```typescript
// Convert monthly to annual for calculations
const annualGrossRent = monthlyRent * 12;
const annualCondoFee = condoFee * 12;
const annualManagementFee = annualGrossRent * managementFee;
const totalOpex = annualCondoFee + propertyTax + annualManagementFee;
const annualNOI = annualGrossRent - totalOpex;
const targetCapRate = targetMonthlyCapRate * 12;
```

### Atualizar save/load do projeto:

```typescript
inputs: {
  // ... existentes
  condoFee,
  propertyTax,
  managementFee,
}
```

### Nova seção no formulário:

```tsx
<CollapsibleInputCard title="Custos Operacionais (OPEX)" icon={Receipt}>
  <CurrencyInput
    label="Condomínio (mensal)"
    value={condoFee}
    onChange={setCondoFee}
    tooltip="condoFee"
  />
  <CurrencyInput
    label="IPTU (anual)"
    value={propertyTax}
    onChange={setPropertyTax}
    tooltip="propertyTax"
  />
  <PercentageSlider
    label="Taxa de Administração"
    value={managementFee}
    onChange={setManagementFee}
    min={0}
    max={0.15}
    step={0.01}
    tooltip="managementFee"
  />
</CollapsibleInputCard>
```

---

## Resultado Esperado

| Campo | Descrição |
|-------|-----------|
| Condomínio | Input de valor mensal em R$ |
| IPTU | Input de valor anual em R$ |
| Taxa Adm | Slider de 0% a 15% |
| NOI | Calculado automaticamente descontando todos os custos |
| Cap Rate | Baseado no NOI líquido (mais preciso) |

