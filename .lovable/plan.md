

# Plano: Reestruturar Seção de Investimento (CAPEX) e Taxa de Administração

## Objetivo

Substituir o campo único "Reforma / Retrofit" por um cálculo baseado em **m² construídos × custo por m²**, e ajustar a exibição da taxa de administração para mostrar a fórmula completa.

---

## 1. Nova Estrutura da Seção CAPEX

### Layout Atual
```text
┌─────────────────────────────────────────┐
│ Investimento (CAPEX)                    │
├─────────────────────────────────────────┤
│ Preço de Aquisição        R$ 2.100.000  │
│ Custos de Fechamento            4,0%    │
│ Reforma / Retrofit        R$ 3.600.000  │
│ Incluir Obras Turnkey?           [✓]    │
│ Custo Turnkey             R$ 1.500.000  │
└─────────────────────────────────────────┘
```

### Novo Layout Proposto
```text
┌─────────────────────────────────────────────────────┐
│ Investimento (CAPEX)                                │
├─────────────────────────────────────────────────────┤
│ Preço de Aquisição              R$ 2.100.000        │
│ Custos de Fechamento                  4,0%          │
│                                                     │
│ --- Obra (Shell) ---                                │
│ Metros Construídos                    1.500 m²      │
│ Custo por m²                      R$ 2.000,00       │
│ Total Obra Shell           =    R$ 3.000.000        │  ← Calculado automaticamente
│                                                     │
│ Incluir Obras Turnkey?                 [✓]          │
│ Custo Turnkey                   R$ 1.500.000        │
│                                                     │
│ TOTAL DE OBRA (Shell + Turnkey)  R$ 4.500.000       │  ← Soma calculada
└─────────────────────────────────────────────────────┘
```

---

## 2. Alterações nos Estados (src/pages/Simulador.tsx)

### Remover
```typescript
const [renovationCost, setRenovationCost] = useState(100000);
```

### Adicionar
```typescript
const [builtArea, setBuiltArea] = useState(500);           // Metros construídos (m²)
const [costPerSqm, setCostPerSqm] = useState(2000);        // Custo por m² (R$)
```

### Calcular Automaticamente
```typescript
const shellCost = builtArea * costPerSqm;                  // Total obra shell
const totalConstructionCost = shellCost + (hasTurnkey ? turnkeyCost : 0);  // Shell + Turnkey
```

---

## 3. Atualizar UI da Seção CAPEX

```typescript
<CollapsibleInputCard title="Investimento (CAPEX)" icon={Building2}>
  <CurrencyInput
    label="Preço de Aquisição"
    value={purchasePrice}
    onChange={setPurchasePrice}
    tooltip="purchasePrice"
  />
  <PercentageSlider
    label="Custos de Fechamento"
    value={closingCosts}
    onChange={setClosingCosts}
    ...
  />

  {/* Nova seção: Obra Shell */}
  <div className="border-t border-border pt-4 mt-4">
    <h4 className="text-sm font-medium text-muted-foreground mb-3">Obra (Shell)</h4>
    
    {/* Input: Metros Construídos */}
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium">Metros Construídos</Label>
        <GlossaryTooltip term="builtArea" />
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={builtArea}
          onChange={(e) => setBuiltArea(Number(e.target.value))}
          className="font-mono"
        />
        <span className="text-sm text-muted-foreground">m²</span>
      </div>
    </div>
    
    {/* Input: Custo por m² */}
    <CurrencyInput
      label="Custo por m² (construção/reforma)"
      value={costPerSqm}
      onChange={setCostPerSqm}
      tooltip="costPerSqm"
    />
    
    {/* Resultado: Total Shell (somente leitura) */}
    <div className="flex justify-between items-center py-2 bg-muted/50 rounded px-3">
      <span className="text-sm font-medium">Total Obra Shell</span>
      <span className="font-mono font-bold text-accent">{formatCurrency(shellCost)}</span>
    </div>
  </div>

  {/* Turnkey (mantém como está) */}
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-1.5">
      <Label className="text-sm font-medium">Incluir Obras Turnkey?</Label>
      <GlossaryTooltip term="turnkeyCost" />
    </div>
    <Switch checked={hasTurnkey} onCheckedChange={setHasTurnkey} />
  </div>
  {hasTurnkey && (
    <CurrencyInput
      label="Custo Turnkey"
      value={turnkeyCost}
      onChange={setTurnkeyCost}
      tooltip="turnkeyCost"
    />
  )}

  {/* Total de Obra (Shell + Turnkey) */}
  <div className="flex justify-between items-center py-3 bg-primary/10 rounded px-3 mt-2">
    <span className="text-sm font-bold">TOTAL DE OBRA</span>
    <span className="font-mono font-bold text-lg">{formatCurrency(totalConstructionCost)}</span>
  </div>
</CollapsibleInputCard>
```

---

## 4. Atualizar a Exibição da Taxa de Administração (OPEX)

### Layout Atual
```text
Taxa de Administração    [===slider===]   8%
```

### Novo Layout Proposto
```text
Taxa de Administração                      8%
  R$ 73.000 × 8% = R$ 5.840/mês
```

### Código da Seção OPEX
```typescript
<CollapsibleInputCard title="Despesas (OPEX)" icon={Receipt}>
  <CurrencyInput
    label="IPTU (Anual)"
    value={propertyTax}
    onChange={setPropertyTax}
    tooltip="propertyTax"
  />
  <CurrencyInput
    label="Condomínio (Anual)"
    value={condoFee}
    onChange={setCondoFee}
    tooltip="condoFee"
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
  {/* Nova linha mostrando o cálculo */}
  <div className="text-sm text-muted-foreground pl-2 -mt-2">
    {formatCurrency(totalMonthlyRent)} × {formatPercentage(managementFee)} = {formatCurrency(totalMonthlyRent * managementFee)}/mês
  </div>
</CollapsibleInputCard>
```

---

## 5. Atualizar Cálculos (calculations useMemo)

```typescript
const calculations = useMemo(() => {
  const shellCost = builtArea * costPerSqm;                    // NOVO
  const turnkeyAmount = hasTurnkey ? turnkeyCost : 0;
  const totalConstructionCost = shellCost + turnkeyAmount;     // NOVO
  
  const totalInvestment = purchasePrice * (1 + closingCosts) + totalConstructionCost;  // ATUALIZADO
  
  // ... resto dos cálculos permanece igual
}, [purchasePrice, closingCosts, builtArea, costPerSqm, hasTurnkey, turnkeyCost, ...]);
```

---

## 6. Atualizar handleSave e handleLoadProject

### handleSave - Salvar novos campos
```typescript
inputs: {
  // ... outros campos
  builtArea,        // NOVO
  costPerSqm,       // NOVO
  // renovationCost removido ou mantido para compatibilidade
}
```

### handleLoadProject - Carregar com fallback
```typescript
setBuiltArea(inputs.builtArea ?? 500);
setCostPerSqm(inputs.costPerSqm ?? 2000);
// Se projeto antigo tiver renovationCost, calcular equivalente
if (inputs.renovationCost && !inputs.builtArea) {
  setBuiltArea(500);
  setCostPerSqm(inputs.renovationCost / 500);
}
```

---

## 7. Atualizar PDF Export

### Arquivo: src/lib/pdfExport.ts

#### Atualizar Interface
```typescript
export interface SimuladorPDFData {
  // ... outros campos
  capexBreakdown: {
    purchasePrice: number;
    closingCostsAmount: number;
    closingCostsPercent: number;
    builtArea: number;           // NOVO - metros quadrados
    costPerSqm: number;          // NOVO - custo por m²
    shellCost: number;           // NOVO - total shell
    turnkeyCost: number;
    totalConstructionCost: number;  // NOVO - shell + turnkey
  };
  // ...
}
```

#### Atualizar Seção CAPEX no PDF
```typescript
{
  title: 'Detalhamento do Investimento (CAPEX)',
  type: 'key-value',
  data: [
    { label: 'Preço de Aquisição', value: formatCurrency(data.capexBreakdown.purchasePrice) },
    { label: `Custos de Fechamento (${formatPercentage(data.capexBreakdown.closingCostsPercent)})`, value: formatCurrency(data.capexBreakdown.closingCostsAmount) },
    { label: `Obra Shell (${data.capexBreakdown.builtArea}m² × ${formatCurrency(data.capexBreakdown.costPerSqm)}/m²)`, value: formatCurrency(data.capexBreakdown.shellCost) },
    { label: 'Obras Turnkey', value: formatCurrency(data.capexBreakdown.turnkeyCost) },
    { label: 'TOTAL DE OBRA', value: formatCurrency(data.capexBreakdown.totalConstructionCost), highlight: true },
    { label: 'INVESTIMENTO TOTAL', value: formatCurrency(data.kpis.totalInvestment), highlight: true },
  ],
},
```

#### Atualizar Seção OPEX para mostrar fórmula
```typescript
{
  title: 'Despesas Operacionais (OPEX)',
  type: 'key-value',
  data: [
    { label: 'IPTU (Anual)', value: formatCurrency(data.opexBreakdown.propertyTax) },
    { label: 'Condomínio (Anual)', value: formatCurrency(data.opexBreakdown.condoFee) },
    { 
      label: `Taxa Administração (${formatCurrency(totalMonthlyRent)} × ${formatPercentage(data.opexBreakdown.managementFee)})`, 
      value: formatCurrency(data.opexBreakdown.managementAmount) + '/ano' 
    },
    { label: 'TOTAL OPEX', value: formatCurrency(totalOpex), highlight: true },
    { label: 'NOI Anual (Receita - OPEX)', value: formatCurrency(data.kpis.noi), highlight: true },
  ],
},
```

---

## 8. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Simulador.tsx` | Adicionar estados `builtArea` e `costPerSqm`, atualizar UI da seção CAPEX e OPEX |
| `src/pages/Simulador.tsx` | Atualizar `calculations` useMemo para usar novos campos |
| `src/pages/Simulador.tsx` | Atualizar `handleSave` e `handleLoadProject` |
| `src/pages/Simulador.tsx` | Atualizar `handleExportPDF` com novos dados |
| `src/lib/pdfExport.ts` | Atualizar interface `SimuladorPDFData` |
| `src/lib/pdfExport.ts` | Atualizar seções CAPEX e OPEX do PDF |

---

## Resumo Visual

### Antes
```
Reforma / Retrofit: R$ 3.000.000
```

### Depois
```
Metros Construídos:     1.500 m²
Custo por m²:           R$ 2.000,00
Total Obra Shell:       R$ 3.000.000  (calculado)
─────────────────────────────────────
Turnkey:                R$ 1.500.000
─────────────────────────────────────
TOTAL DE OBRA:          R$ 4.500.000
```

