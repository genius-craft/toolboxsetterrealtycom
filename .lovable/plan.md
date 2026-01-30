
# Plano: Adicionar Tooltips Explicativos nos KPIs do Admin

## Objetivo

Adicionar ícones de interrogação (?) ao lado de cada KPI nos visualizadores admin que, ao passar o mouse, exibem explicações do glossário financeiro.

---

## Componentes Já Existentes

O projeto já possui todo o sistema de tooltips pronto:

- **`InfoTooltip`** - Ícone (?) com tooltip
- **`GlossaryTooltip`** - Wrapper que busca termos do glossário
- **`financialGlossary`** - Dicionário com 25+ termos financeiros

---

## Arquivos a Modificar

### 1. `src/components/tools/KPICard.tsx`

Adicionar suporte a um tooltip opcional:

```typescript
interface KPICardProps {
  label: string;
  value: string;
  tooltip?: React.ReactNode;  // NOVO
  // ... resto igual
}
```

O ícone (?) aparecerá ao lado do label quando `tooltip` for fornecido.

### 2. `src/components/admin/ProjectViewerSimulador.tsx`

Adicionar tooltips nos 4 KPIs principais:

| KPI | Termo do Glossário |
|-----|-------------------|
| Cap Rate Entrada | `capRate` |
| TIR | `irr` |
| VPL | `npv` (será adicionado) |
| Multiplicador | `equityMultiple` |

E nos itens do resumo: NOI, Yield, Taxa de Desconto.

### 3. `src/components/admin/ProjectViewerPermuta.tsx`

Adicionar tooltips em:

| Item | Termo |
|------|-------|
| VP das Unidades | `presentValue` |
| Permuta Líquida | `permuta` |
| Valor Presente Líquido | `presentValue` |

### 4. `src/components/admin/ProjectViewerHBU.tsx`

Adicionar tooltips na tabela comparativa:

| Métrica | Termo |
|---------|-------|
| VGV | `vgv` |
| VPL | `npv` |
| Margem | (novo: margem de lucro) |

### 5. `src/components/admin/ProjectViewerDecisor.tsx`

Adicionar tooltips em:

| Item | Termo |
|------|-------|
| Cap Rate Implícito | `capRate` |
| Score Qualitativo | (novo) |
| Localização | `locationQuality` |
| Risco Inquilino | `tenantRisk` |
| Liquidez Futura | `futureLiquidity` |
| Condição do Ativo | `assetCondition` |

### 6. `src/components/tools/InfoTooltip.tsx`

Adicionar novos termos ao glossário:

```typescript
npv: {
  title: 'VPL (Valor Presente Líquido)',
  description: 'Soma de todos os fluxos de caixa futuros trazidos a valor presente, menos o investimento inicial. VPL positivo indica que o investimento gera valor.',
},
margin: {
  title: 'Margem de Lucro',
  description: 'Lucro bruto dividido pela receita total (VGV). Indica o percentual de cada real de venda que sobra como lucro.',
},
qualityScore: {
  title: 'Score Qualitativo',
  description: 'Pontuação de 0-100 baseada em fatores qualitativos: localização, risco do inquilino, liquidez e condição do ativo.',
},
```

---

## Visual Final

Antes:
```
┌────────────┐
│ CAP RATE   │
│   8,2%     │
└────────────┘
```

Depois:
```
┌────────────────┐
│ CAP RATE  (?)  │  ← Hover mostra explicação
│     8,2%       │
└────────────────┘
```

---

## Exemplo de Tooltip

Ao passar o mouse no (?):

```
╭─────────────────────────────────────────────────╮
│ Cap Rate (Taxa de Capitalização)                │
│                                                 │
│ NOI ÷ Valor do Imóvel. Mede o retorno anual     │
│ sobre o capital investido, sem considerar       │
│ financiamento. Referência: 6-10% a.a.           │
╰─────────────────────────────────────────────────╯
```

---

## Resumo de Alterações

| Arquivo | Ação |
|---------|------|
| `src/components/tools/KPICard.tsx` | Adicionar prop `tooltip` opcional |
| `src/components/tools/InfoTooltip.tsx` | Adicionar termos `npv`, `margin`, `qualityScore` |
| `src/components/admin/ProjectViewerSimulador.tsx` | Adicionar `GlossaryTooltip` nos KPIs e resumo |
| `src/components/admin/ProjectViewerPermuta.tsx` | Adicionar tooltips nas métricas |
| `src/components/admin/ProjectViewerHBU.tsx` | Adicionar tooltips na tabela |
| `src/components/admin/ProjectViewerDecisor.tsx` | Adicionar tooltips nos KPIs e avaliação |
