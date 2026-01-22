

# Plano: Adicionar Explicação da Vacância no PDF

## Objetivo

Adicionar uma seção de **Receita com Vacância** no PDF que mostre claramente:
1. Receita Bruta Anual
2. Percentual de Vacância aplicado
3. Receita Líquida (após vacância)

---

## Dados Disponíveis

A interface `SimuladorPDFData` já possui todos os dados necessários:

| Campo | Localização |
|-------|-------------|
| Receita Mensal Total | `data.totalMonthlyRent` |
| Taxa de Vacância | `data.assumptions.vacancyRate` |
| NOI Final | `data.kpis.noi` |

---

## Alteração Proposta

### Arquivo: `src/lib/pdfExport.ts` (linhas 461-473)

Modificar a seção **"Receita - Detalhamento por Lojista"** para incluir as linhas de vacância após o total anual:

**Antes:**
```typescript
{
  title: 'Receita - Detalhamento por Lojista',
  type: 'key-value',
  data: [
    ...data.rentalUnits.map(unit => ({
      label: unit.name,
      value: `${formatCurrency(unit.monthlyRent)}/mês`,
    })),
    { label: 'TOTAL MENSAL', value: formatCurrency(totalMonthlyRent), highlight: true },
    { label: 'TOTAL ANUAL', value: formatCurrency(totalAnnualRent), highlight: true },
  ],
},
```

**Depois:**
```typescript
{
  title: 'Receita - Detalhamento por Lojista',
  type: 'key-value',
  data: [
    ...data.rentalUnits.map(unit => ({
      label: unit.name,
      value: `${formatCurrency(unit.monthlyRent)}/mês`,
    })),
    { label: 'TOTAL MENSAL', value: formatCurrency(totalMonthlyRent), highlight: true },
    { label: 'RECEITA BRUTA ANUAL', value: formatCurrency(totalAnnualRent), highlight: true },
    { label: `Vacância (${formatPercentage(data.assumptions.vacancyRate)})`, value: `-${formatCurrency(totalAnnualRent * data.assumptions.vacancyRate)}` },
    { label: 'RECEITA LÍQUIDA ANUAL', value: formatCurrency(totalAnnualRent * (1 - data.assumptions.vacancyRate)), highlight: true },
  ],
},
```

---

## Resultado Esperado no PDF

### Com Vacância de 4%:
```text
+-----------------------------------------------------------+
| Receita - Detalhamento por Lojista                        |
+-----------------------------------------------------------+
| Loja Principal                            R$ 72.000/mes   |
| TOTAL MENSAL                              R$ 72.000       |
| RECEITA BRUTA ANUAL                       R$ 864.000      |
| Vacancia (4,0%)                           -R$ 34.560      |
| RECEITA LIQUIDA ANUAL                     R$ 829.440      |
+-----------------------------------------------------------+
```

### Com Vacância de 0%:
```text
+-----------------------------------------------------------+
| Receita - Detalhamento por Lojista                        |
+-----------------------------------------------------------+
| Loja Principal                            R$ 72.000/mes   |
| TOTAL MENSAL                              R$ 72.000       |
| RECEITA BRUTA ANUAL                       R$ 864.000      |
| Vacancia (0,0%)                           R$ 0            |
| RECEITA LIQUIDA ANUAL                     R$ 864.000      |
+-----------------------------------------------------------+
```

---

## Resumo Tecnico

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/pdfExport.ts` | Adicionar 3 linhas na secao de receita: Receita Bruta, Vacancia e Receita Liquida |

Esta alteracao deixa o PDF mais transparente, mostrando exatamente como a vacancia impacta a receita antes de calcular o NOI e o Cap Rate.

