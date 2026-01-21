

# Plano: Refinamento do PDF Export do Simulador

## Objetivo

Simplificar e refinar o PDF do Simulador removendo seções desnecessárias, adicionando Cap Rate Anual e Mensal, e melhorando o visual com cores mais suaves e bordas arredondadas.

---

## 1. Seções a REMOVER

| Seção | Motivo |
|-------|--------|
| Veredicto | Marcado em amarelo pelo usuário |
| Análise de Cenários | Marcado em amarelo pelo usuário |
| Premissas do Modelo | Marcado em amarelo pelo usuário |

---

## 2. Indicadores a ADICIONAR

Na seção "Indicadores Principais" (KPI Grid), adicionar:

- **Cap Rate Anual** - NOI / Investimento Total (já existe como `entryCapRate`)
- **Cap Rate Mensal** - (NOI / 12) / Investimento Total

---

## 3. Novo Layout do Cabeçalho

O cabeçalho atual mostra apenas texto. O novo design incluirá:

```text
┌─────────────────────────────────────────────────────────────┐
│  ┌───┐                                                      │
│  │ S │  SETTER TOOLBOX                                      │
│  └───┘  Simulador de Viabilidade                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Quadrado com a letra "S" (imitando o sidebar)
- "SETTER" em fonte bold
- "TOOLBOX" ao lado, mesma fonte

---

## 4. Refinamento Visual

### Cores Mais Suaves
Alterar a paleta de cores:

| Elemento | Atual | Novo |
|----------|-------|------|
| Cabeçalho/Títulos | #B89B7A (laranja forte) | #C4A882 (dourado suave) |
| Background boxes | #F8F8F8 (cinza frio) | #FAF8F6 (bege quente) |
| Texto secundário | #646464 (cinza) | #7A7A7A (cinza mais claro) |

### Bordas Arredondadas
- Aumentar raio das caixas de KPI: de `2mm` para `4mm`
- Bordas mais suaves nas seções

---

## 5. Estrutura Final do PDF (1 página)

```text
┌─────────────────────────────────────────────────────────────┐
│  [S] SETTER TOOLBOX                                         │
│      Simulador de Viabilidade                               │
├─────────────────────────────────────────────────────────────┤
│  Ativo: Projeto Araçatuba                                   │
│  Data: 21/01/2026                                           │
├─────────────────────────────────────────────────────────────┤
│  INDICADORES PRINCIPAIS                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │Cap Rate     │ │Cap Rate     │ │ TIR         │            │
│  │Anual: 9.5%  │ │Mensal: 0.79%│ │ 18.2%       │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │VPL          │ │Multiplicador│ │NOI Mensal   │            │
│  │R$ 450.000   │ │2.35x        │ │R$ 16.625    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│  DETALHAMENTO DO INVESTIMENTO (CAPEX)                       │
│  Preço de Aquisição .................. R$ 2.100.000         │
│  Custos de Fechamento (3%) ........... R$ 63.000            │
│  Reforma / Retrofit .................. R$ 50.000            │
│  Obras Turnkey ....................... R$ 0                 │
│  INVESTIMENTO TOTAL .................. R$ 2.213.000         │
├─────────────────────────────────────────────────────────────┤
│  RECEITA - DETALHAMENTO POR LOJISTA                         │
│  Loja 1 (Farmácia) ................... R$ 18.000/mês        │
│  Loja 2 (Pet Shop) ................... R$ 12.000/mês        │
│  Loja 3 (Cafeteria) .................. R$ 8.000/mês         │
│  TOTAL MENSAL ........................ R$ 38.000            │
│  TOTAL ANUAL ......................... R$ 456.000           │
├─────────────────────────────────────────────────────────────┤
│  DESPESAS OPERACIONAIS (OPEX)                               │
│  IPTU (Anual) ........................ R$ 12.000            │
│  Condomínio (Anual) .................. R$ 6.000             │
│  Taxa Administração (8%) ............. R$ 34.656            │
│  TOTAL OPEX .......................... R$ 52.656            │
│  NOI Anual (Receita - OPEX) .......... R$ 199.544           │
├─────────────────────────────────────────────────────────────┤
│  Este relatório é para fins informativos.                   │
│                                    Gerado por Setter Toolbox│
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/pdfExport.ts` | Atualizar cores, cabeçalho com logo, bordas arredondadas |
| `src/lib/pdfExport.ts` | Remover seções: Veredicto, Análise de Cenários, Premissas |
| `src/lib/pdfExport.ts` | Adicionar Cap Rate Mensal nos KPIs |
| `src/pages/Simulador.tsx` | Passar Cap Rate Mensal para o PDF |

---

## 7. Alterações Detalhadas

### 7.1 Atualizar Paleta de Cores

```typescript
const COLORS = {
  primary: [196, 168, 130] as [number, number, number], // #C4A882 - dourado suave
  dark: [45, 45, 48] as [number, number, number],
  gray: [122, 122, 122] as [number, number, number],
  lightGray: [220, 218, 215] as [number, number, number],
  warmBg: [250, 248, 246] as [number, number, number], // Novo - fundo bege
  // ... resto igual
};
```

### 7.2 Novo Cabeçalho com Logo

```typescript
// === HEADER ===
doc.setFillColor(...COLORS.primary);
doc.rect(0, 0, pageWidth, 35, 'F');

// Logo "S" box
doc.setFillColor(255, 255, 255);
doc.roundedRect(margin, 8, 12, 12, 2, 2, 'F');
doc.setTextColor(...COLORS.primary);
doc.setFontSize(10);
doc.setFont('helvetica', 'bold');
doc.text('S', margin + 4.5, 16);

// "SETTER TOOLBOX" text
doc.setTextColor(...COLORS.white);
doc.setFontSize(20);
doc.setFont('helvetica', 'bold');
doc.text('SETTER ', margin + 16, 17);
doc.text('TOOLBOX', margin + 46, 17); // Mesmo estilo, sem cor diferente no PDF
```

### 7.3 Adicionar Cap Rate Mensal

Interface atualizada:
```typescript
kpis: {
  entryCapRate: number;      // Cap Rate Anual
  monthlyCapRate: number;    // NOVO - Cap Rate Mensal
  irr: number;
  npv: number;
  equityMultiple: number;
  totalInvestment: number;
  noi: number;
};
```

KPIs no PDF:
```typescript
{
  title: 'Indicadores Principais',
  type: 'kpi-grid',
  data: [
    { label: 'Cap Rate Anual', value: formatPercentage(data.kpis.entryCapRate) },
    { label: 'Cap Rate Mensal', value: formatPercentage(data.kpis.monthlyCapRate) },
    { label: 'TIR', value: formatPercentage(data.kpis.irr) },
    { label: 'VPL', value: formatCompactCurrency(data.kpis.npv) },
    { label: 'Multiplicador', value: `${data.kpis.equityMultiple.toFixed(2)}x` },
    { label: 'NOI Mensal', value: formatCurrency(data.kpis.noi / 12) },
  ],
}
```

### 7.4 Remover Seções

Remover da array `sections`:
- Seção "Veredicto" (type: 'verdict')
- Seção "Análise de Cenários" (type: 'table')
- Seção "Premissas do Modelo" (type: 'key-value' no final)

---

## 8. Resultado Esperado

O PDF final terá:
- Layout limpo de 1 página
- Cabeçalho com logo [S] ao lado de "SETTER TOOLBOX"
- 6 KPIs incluindo Cap Rate Anual e Mensal
- Cores mais suaves e caixas com bordas arredondadas
- Sem seções de veredicto, cenários ou premissas

