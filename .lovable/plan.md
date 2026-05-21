# Melhorar KPIs do Dashboard

Hoje o topo do `/dashboard` tem 4 cards rasos (Análises, Investimento, TIR média, mini-sparkline com "Top: X"). Pouco acionável e a métrica mais importante do nicho (Cap Rate) sequer aparece.

## Novos KPIs

**Linha 1 — 4 cards densos (com delta e benchmark)**

1. **Análises** — total + `▲ +X%` vs. mês anterior + sparkline 6m embutida no canto. Hint: "X este mês".
2. **Investimento total** — soma + hint "Ticket médio: R$ Y".
3. **TIR média** — % + badge comparativo vs CDI (assume 12%a.a.): verde se TIR > CDI, âmbar se ±2pp, vermelho se < CDI. Hint: "Faixa: min%–max%".
4. **Cap Rate mensal médio** — média dos `results.monthlyCapRate` dos projetos do Simulador. Hint: "X projetos com Cap Rate".

**Linha 2 — destaque + distribuição**

5. **Top projeto** (2/3 da largura) — card destacado com nome, tipo (ícone colorido), métrica vencedora (TIR ou Cap Rate), botão "Abrir →" que leva direto para a calculadora.
6. **Distribuição por tipo** (1/3 da largura) — mini barras horizontais com contagem por tipo (Simulador/Permuta/H&BU/Decisor/Preço Teto), usando as cores já definidas em `projectTypeConfig`.

## Detalhes técnicos

- Estender `aggregates` em `useMemo` para calcular:
  - `monthDelta`: `(thisMonth - prevMonth) / max(1, prevMonth)` em %
  - `avgTicket`: `totalInvestment / total`
  - `irrMin`, `irrMax`, `avgCapRate` (só simulador)
  - `byType`: `Record<ProjectType, number>`
  - `top`: melhor projeto (TIR ou Cap Rate ponderado) com `id`, `name`, `type`, `metric`, `value`
- Criar `KpiCard` mais rico que o atual `StatCard`: aceita `delta` (number+label), `trend` (sparkline opcional), `benchmark` (badge com tom semântico).
- Manter cores semânticas: `text-accent` (laranja Setter) para TIR, verde HSL var p/ positivo, vermelho/âmbar para alerta — sem cores fora do design system.
- Constante `CDI_BENCHMARK = 0.12` em topo do arquivo (comentário marcando que deve virar `tool_config` futuramente).
- Mobile: linha 1 vira `grid-cols-2`, linha 2 empilha `grid-cols-1`. Sparkline esconde em telas < sm.
- Sem mudanças em backend, hooks ou tipos — toda a lógica nova é frontend, derivada de `useProjects()`.

## Arquivo afetado

- `src/pages/Dashboard.tsx` — única edição.
  - +1 ícone em imports (`Percent`, `ArrowUpRight`, `ArrowDownRight`).
  - Expandir `aggregates` (+~30 linhas).
  - Substituir componente `StatCard` por `KpiCard` (+ overload para "Top projeto" e "Distribuição").
  - Trocar o bloco `{aggregates && ...}` por duas linhas de grid.

## Fora de escopo

- Não mexer nos cards de projeto abaixo, no Compare, no tour, ou no estado vazio.
- Não criar tabela `benchmarks` — CDI fica hard-coded com TODO.
- Sem novas dependências.
