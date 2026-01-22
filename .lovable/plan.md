

# Plano: Exibir Taxa de Administração Mensal no PDF

## Objetivo

Alterar a exibição da Taxa de Administração no PDF para mostrar o valor **mensal** ao invés do anual.

---

## Alteração Atual vs. Proposta

### Atual (PDF)
```text
Taxa Administração (R$ 73.000 × 6,0%)    R$ 52.560/ano
```

### Proposto (PDF)
```text
Taxa Administração (R$ 73.000 × 6,0%)    R$ 4.380/mês
```

---

## Alteração no Código

### Arquivo: `src/lib/pdfExport.ts` (linha 481)

**Antes:**
```typescript
{ 
  label: `Taxa Administração (${formatCurrency(totalMonthlyRent)} × ${formatPercentage(data.opexBreakdown.managementFee)})`, 
  value: `${formatCurrency(data.opexBreakdown.managementAmount)}/ano` 
},
```

**Depois:**
```typescript
{ 
  label: `Taxa Administração (${formatCurrency(totalMonthlyRent)} × ${formatPercentage(data.opexBreakdown.managementFee)})`, 
  value: `${formatCurrency(data.opexBreakdown.managementAmount / 12)}/mês` 
},
```

---

## Resumo

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/pdfExport.ts` | Dividir `managementAmount` por 12 e mudar sufixo para `/mês` |

Esta é uma alteração simples de uma única linha que corrige a exibição para mostrar o valor mensal da taxa de administração.

