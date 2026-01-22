

# Plano: Adicionar "(Total Efetivamente Recebido)" ao TOTAL OPEX no PDF

## Objetivo

Atualizar o label do **TOTAL OPEX** no PDF para incluir a indicação de que representa o valor líquido efetivamente recebido.

---

## Alteração

### Arquivo: `src/lib/pdfExport.ts` (linha 482)

**Antes:**
```typescript
{ label: 'TOTAL OPEX', value: formatCurrency(totalOpex), highlight: true },
```

**Depois:**
```typescript
{ label: 'TOTAL OPEX (Total Efetivamente Recebido)', value: formatCurrency(totalOpex), highlight: true },
```

---

## Resultado no PDF

### Antes
```text
┌─────────────────────────────────────────────────────┐
│ Despesas Operacionais (OPEX)                        │
├─────────────────────────────────────────────────────┤
│ IPTU (Anual)                           R$ 12.000    │
│ Condomínio (Anual)                     R$ 24.000    │
│ Taxa Administração (R$ 73.000 × 6,0%)  R$ 4.380/mês │
│ TOTAL OPEX                             R$ 88.560    │
│ NOI Anual (Receita - OPEX)             R$ 787.440   │
└─────────────────────────────────────────────────────┘
```

### Depois
```text
┌─────────────────────────────────────────────────────────────┐
│ Despesas Operacionais (OPEX)                                │
├─────────────────────────────────────────────────────────────┤
│ IPTU (Anual)                                   R$ 12.000    │
│ Condomínio (Anual)                             R$ 24.000    │
│ Taxa Administração (R$ 73.000 × 6,0%)          R$ 4.380/mês │
│ TOTAL OPEX (Total Efetivamente Recebido)       R$ 88.560    │
│ NOI Anual (Receita - OPEX)                     R$ 787.440   │
└─────────────────────────────────────────────────────────────┘
```

---

## Resumo

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/pdfExport.ts` | Adicionar "(Total Efetivamente Recebido)" ao label do TOTAL OPEX |

Esta é uma alteração simples de texto no label.

