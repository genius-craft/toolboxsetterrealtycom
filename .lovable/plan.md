

# Plano: Simplificar Indicadores do PDF para Apenas Cap Rate Mensal

## Objetivo

Substituir a grid de 6 indicadores por um único box destacado mostrando apenas o **Cap Rate Mensal (Estimado)**.

---

## Mudança Visual

### Layout Atual (a ser removido)
```text
┌────────────────────────────────────────────────────────────────┐
│  INDICADORES PRINCIPAIS                                        │
├────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │Cap Rate │ │Cap Rate │ │  TIR    │ │  VPL    │               │
│ │Anual    │ │Mensal   │ │ 16,4%   │ │R$ 2,4M  │               │
│ │ 34,2%   │ │  0,9%   │ │         │ │         │               │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│ ┌─────────┐ ┌─────────┐                                       │
│ │Multiplic│ │NOI      │                                       │
│ │ 3.80x   │ │Mensal   │                                       │
│ └─────────┘ └─────────┘                                       │
└────────────────────────────────────────────────────────────────┘
```

### Novo Layout (único box)
```text
┌────────────────────────────────────────────────────────────────┐
│  RENTABILIDADE ESTIMADA                                        │
├────────────────────────────────────────────────────────────────┤
│         ┌─────────────────────────────────────────┐            │
│         │   Cap Rate Mensal (Estimado)           │            │
│         │                                         │            │
│         │              0,9%                       │            │
│         └─────────────────────────────────────────┘            │
└────────────────────────────────────────────────────────────────┘
```

---

## Alterações no Código

### Arquivo: `src/lib/pdfExport.ts`

**Alterar a seção de KPIs (linhas 406-419):**

De:
```typescript
sections: [
  {
    title: 'Indicadores Principais',
    type: 'kpi-grid',
    data: [
      { label: 'Cap Rate Anual', value: ... },
      { label: 'Cap Rate Mensal', value: ... },
      { label: 'TIR', value: ... },
      { label: 'VPL', value: ... },
      { label: 'Multiplicador', value: ... },
      { label: 'NOI Mensal', value: ... },
    ],
  },
  // ... outras seções
]
```

Para:
```typescript
sections: [
  {
    title: 'Rentabilidade Estimada',
    type: 'kpi-grid',
    data: [
      { label: 'Cap Rate Mensal (Estimado)', value: formatPercentage(data.kpis.monthlyCapRate), highlight: true },
    ],
  },
  // ... outras seções
]
```

### Ajustar Renderização do Box Único

Modificar `renderKPIGrid` para exibir um único box de forma centralizada e destacada quando houver apenas 1 item:

```typescript
function renderKPIGrid(doc: jsPDF, kpis: PDFKPIItem[], x: number, y: number, width: number): number {
  // Se for apenas 1 KPI, renderizar de forma centralizada
  if (kpis.length === 1) {
    const singleKpi = kpis[0];
    const boxWidth = width * 0.6;  // 60% da largura
    const boxHeight = 35;          // Altura maior
    const boxX = x + (width - boxWidth) / 2;  // Centralizado

    // Background box
    doc.setFillColor(...COLORS.warmBg);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 4, 4, 'F');

    // Label centralizado
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(singleKpi.label, boxX + boxWidth / 2, y + 12, { align: 'center' });

    // Valor grande centralizado
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(singleKpi.value, boxX + boxWidth / 2, y + 28, { align: 'center' });

    return y + boxHeight + 4;
  }

  // ... resto da função para múltiplos KPIs (manter código existente)
}
```

---

## Estrutura Final do PDF

```text
┌─────────────────────────────────────────────────────────────┐
│  [S] SETTER TOOLBOX                                         │
│      Simulador de Viabilidade                               │
├─────────────────────────────────────────────────────────────┤
│  Ativo: Projeto Araçatuba                                   │
│  Data: 21/01/2026                                           │
├─────────────────────────────────────────────────────────────┤
│  RENTABILIDADE ESTIMADA                                     │
│              ┌────────────────────────┐                     │
│              │ Cap Rate Mensal (Est.) │                     │
│              │         0,9%           │                     │
│              └────────────────────────┘                     │
├─────────────────────────────────────────────────────────────┤
│  DETALHAMENTO DO INVESTIMENTO (CAPEX)                       │
│  Preço de Aquisição .................. R$ 2.100.000         │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│  RECEITA - DETALHAMENTO POR LOJISTA                         │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│  DESPESAS OPERACIONAIS (OPEX)                               │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│  Este relatório é para fins informativos.                   │
│                                    Gerado por Setter Toolbox│
└─────────────────────────────────────────────────────────────┘
```

---

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/pdfExport.ts` | Reduzir array de KPIs de 6 para 1 item |
| `src/lib/pdfExport.ts` | Renomear título da seção para "Rentabilidade Estimada" |
| `src/lib/pdfExport.ts` | Modificar `renderKPIGrid` para centralizar box único |

O PDF ficará mais limpo e direto ao ponto, destacando apenas o Cap Rate Mensal (Estimado) como métrica principal de rentabilidade.

