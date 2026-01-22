

# Plano: Exibir Cap Rate com Precisão de 2 Casas Decimais no PDF

## Problema Identificado

O Cap Rate Mensal está sendo formatado com apenas **1 casa decimal** (padrão da função `formatPercentage`), causando arredondamento:

| Valor Real | Exibido Atualmente | Deveria Exibir |
|------------|-------------------|----------------|
| 0,87% | 0,8% ou 0,9% | 0,87% |

## Causa Raiz

Na linha 445 do `src/lib/pdfExport.ts`:
```typescript
{ label: 'Cap Rate Mensal (Estimado)', value: formatPercentage(data.kpis.monthlyCapRate), highlight: true }
```

A função `formatPercentage` usa `decimals = 1` por padrão.

---

## Solução

### Arquivo: `src/lib/pdfExport.ts` (linha 445)

**Antes:**
```typescript
{ label: 'Cap Rate Mensal (Estimado)', value: formatPercentage(data.kpis.monthlyCapRate), highlight: true },
```

**Depois:**
```typescript
{ label: 'Cap Rate Mensal (Estimado)', value: formatPercentage(data.kpis.monthlyCapRate, 2), highlight: true },
```

---

## Resultado no PDF

### Antes
```text
┌─────────────────────────────────────┐
│ Rentabilidade Estimada              │
├─────────────────────────────────────┤
│ Cap Rate Mensal (Estimado)    0,8%  │
└─────────────────────────────────────┘
```

### Depois
```text
┌─────────────────────────────────────┐
│ Rentabilidade Estimada              │
├─────────────────────────────────────┤
│ Cap Rate Mensal (Estimado)   0,87%  │
└─────────────────────────────────────┘
```

---

## Resumo

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/pdfExport.ts` | Adicionar parâmetro `2` na chamada `formatPercentage()` para Cap Rate |

Esta é uma alteração simples de uma única linha que corrige a precisão do Cap Rate no PDF.

