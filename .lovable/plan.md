
# Plano: Exibir Cap Rate Mensal no Card do Projeto

## Objetivo

Substituir a exibição da **TIR** pelo **Cap Rate Mensal** nos cards de projetos do tipo Simulador no Dashboard.

---

## Alterações Necessárias

### 1. Salvar monthlyCapRate nos Results (src/pages/Simulador.tsx)

Atualmente o `results` salvo não inclui o `monthlyCapRate`. Precisamos adicioná-lo:

**Antes:**
```typescript
results: {
  totalInvestment: calculations.totalInvestment,
  noi: calculations.noi,
  entryCapRate: calculations.entryCapRate,
  irr: calculations.irr,
  npv: calculations.npv,
  equityMultiple: calculations.equityMultiple,
  verdict: calculations.verdict,
},
```

**Depois:**
```typescript
results: {
  totalInvestment: calculations.totalInvestment,
  noi: calculations.noi,
  entryCapRate: calculations.entryCapRate,
  monthlyCapRate: (calculations.noi / 12) / calculations.totalInvestment, // NOVO
  irr: calculations.irr,
  npv: calculations.npv,
  equityMultiple: calculations.equityMultiple,
  verdict: calculations.verdict,
},
```

---

### 2. Alterar Dashboard para Exibir Cap Rate Mensal (src/pages/Dashboard.tsx)

**Antes (linha 208-215):**
```typescript
{project.project_type === 'simulador' && project.results.irr && (
  <div className="flex justify-between">
    <span className="text-muted-foreground">TIR</span>
    <span className="font-mono text-accent">
      {formatPercentage(project.results.irr)}
    </span>
  </div>
)}
```

**Depois:**
```typescript
{project.project_type === 'simulador' && project.results.monthlyCapRate && (
  <div className="flex justify-between">
    <span className="text-muted-foreground">Cap Rate Mensal</span>
    <span className="font-mono text-accent">
      {formatPercentage(project.results.monthlyCapRate)}
    </span>
  </div>
)}
```

---

## Compatibilidade com Projetos Antigos

Projetos salvos anteriormente não terão o campo `monthlyCapRate`. Para garantir compatibilidade, podemos calcular on-the-fly se não existir:

```typescript
{project.project_type === 'simulador' && (
  <div className="flex justify-between">
    <span className="text-muted-foreground">Cap Rate Mensal</span>
    <span className="font-mono text-accent">
      {formatPercentage(
        project.results.monthlyCapRate ?? 
        (project.results.noi / 12) / project.results.totalInvestment
      )}
    </span>
  </div>
)}
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Simulador.tsx` | Adicionar `monthlyCapRate` ao objeto `results` no save |
| `src/pages/Dashboard.tsx` | Trocar TIR por Cap Rate Mensal nos cards de simulador |

---

## Resultado Esperado

O card do projeto no Dashboard mostrará:

```text
┌─────────────────────────────────────────┐
│ 📊 SIMULADOR              📅 22/01/2026 │
│                                         │
│ Projeto Araçatuba                       │
│ Cap Rate Mensal              0,9%       │
│                                         │
│  [👁 Ver]                    [🗑]       │
└─────────────────────────────────────────┘
```
