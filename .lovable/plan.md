
# Plano: Otimização Máxima para Mobile

## Visão Geral

Este plano aborda otimizações em **todos os componentes e páginas** para garantir uma experiência mobile fluida e profissional.

---

## 1. Layout Principal (ToolLayout)

**Arquivo:** `src/components/tools/ToolLayout.tsx`

### Problemas Identificados:
- Em mobile, o layout empilha os painéis verticalmente, mas o painel direito (Dashboard) fica muito extenso
- Não há indicação visual de que existem mais resultados abaixo
- O título não aparece em mobile

### Solução:
- Mostrar título em mobile no topo
- Adicionar indicador visual de "swipe para ver mais"
- Ajustar padding para telas menores

```typescript
// Mudanças principais:
- Exibir título em mobile: "lg:block" → sempre visível
- Reduzir padding em mobile: "p-6" → "p-4 sm:p-6"
- Altura mínima ajustada para mobile
```

---

## 2. Grid de KPIs

**Arquivo:** `src/pages/Simulador.tsx` (e outras ferramentas)

### Problema:
- Grid de 4 colunas em mobile fica apertado
- Valores grandes são truncados

### Solução:
- Mobile: 2 colunas (grid-cols-2)
- Tablet: 4 colunas
- Desktop: 4 colunas

```tsx
// De:
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

// Para:
<div className="grid grid-cols-2 gap-3 sm:gap-4">
```

---

## 3. KPICard Responsivo

**Arquivo:** `src/components/tools/KPICard.tsx`

### Problemas:
- Padding excessivo em mobile
- Fontes muito grandes para telas pequenas
- Ícone ocupa muito espaço

### Solução:
```tsx
// Ajustes já parcialmente implementados, mas reforçar:
- Padding: "p-3 sm:p-4 lg:p-6"
- Label: "text-[10px] sm:text-xs"
- Value: "text-lg sm:text-xl lg:text-2xl"
- Ícone: "h-4 w-4 sm:h-5 sm:w-5"
```

**Status:** Já implementado, mas validar consistência.

---

## 4. Análise de Sensibilidade (Heatmap)

**Arquivo:** `src/components/tools/SensitivityHeatmap.tsx`

### Problema Crítico:
- Tabela com `min-w-[500px]` força scroll horizontal
- Células muito pequenas em mobile
- Legenda ilegível

### Solução:
- Reduzir variações de 7 para 5 em mobile
- Usar breakpoints para mostrar versão compacta
- Legenda simplificada em mobile

```tsx
// Nova lógica:
const isMobile = useIsMobile();
const MOBILE_VARIATIONS = [-0.10, -0.05, 0, 0.05, 0.10]; // 5 colunas
const DESKTOP_VARIATIONS = [-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15]; // 7 colunas
const VARIATIONS = isMobile ? MOBILE_VARIATIONS : DESKTOP_VARIATIONS;

// Reduzir min-width e ajustar células
<div className="min-w-[300px] sm:min-w-[500px]">
  // Células: "min-h-[40px] sm:min-h-[48px]"
</div>
```

---

## 5. Matriz de Cenários

**Arquivo:** `src/components/tools/ScenarioMatrix.tsx`

### Problema:
- Tabela horizontal não cabe em telas pequenas
- Headers ocupam muito espaço

### Solução:
- Em mobile, usar layout de cards empilhados ao invés de tabela
- Cada cenário vira um card independente

```tsx
// Em mobile:
{isMobile ? (
  <div className="space-y-4">
    {scenarios.map((scenario) => (
      <ScenarioCard key={scenario.key} {...scenario} />
    ))}
  </div>
) : (
  <table>...</table>
)}
```

---

## 6. Gráfico de Fluxo de Caixa

**Arquivo:** `src/components/tools/CashFlowChart.tsx`

### Problema:
- YAxis ocupa 70px fixos, reduzindo área do gráfico
- Rótulos podem sobrepor

### Solução:
```tsx
// Ajustes responsivos:
<YAxis width={isMobile ? 50 : 70} />
<XAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
```

---

## 7. Botões de Ação

**Arquivo:** `src/pages/Simulador.tsx` (linhas 500-532)

### Problema:
- Em mobile, 3 botões lado a lado ficam apertados
- Texto truncado

### Solução:
- Em mobile, empilhar verticalmente
- Usar ícones sem texto em mobile compacto
- Adicionar safe-area para iPhone (notch)

```tsx
// De:
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">

// Para:
<div className="flex flex-col gap-2 pb-safe">
  <div className="flex gap-2">
    <Button className="flex-1">
      <FolderOpen className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Abrir Projeto</span>
    </Button>
    <Button className="flex-1">
      <Save className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Salvar</span>
    </Button>
  </div>
  <Button className="w-full">
    <FileText className="h-4 w-4 mr-2" />
    Exportar PDF
  </Button>
</div>
```

---

## 8. Inputs Colapsáveis

**Arquivo:** `src/components/tools/CollapsibleInputCard.tsx`

### Problema:
- Padding muito grande em mobile
- Título pode quebrar em 2 linhas

### Solução:
```tsx
// Ajustar padding:
<button className="p-3 sm:p-4 lg:p-5">
  <h3 className="font-serif text-base sm:text-lg">
```

---

## 9. RentalUnitsCard (Unidades de Locação)

**Arquivo:** `src/components/tools/RentalUnitsCard.tsx`

### Problema:
- Inputs de nome e valor lado a lado ficam apertados
- Input de nome tem `max-w-[120px]` fixo

### Solução:
- Em mobile, empilhar nome sobre valor
- Remover max-width do input de nome

```tsx
<div className="flex flex-col sm:flex-row sm:items-center gap-2">
  <Input className="w-full sm:w-[120px]" /> {/* Nome */}
  <Input className="w-full sm:flex-1" />    {/* Valor */}
  <Button />
</div>
```

---

## 10. CSS Global - Safe Areas

**Arquivo:** `src/index.css`

### Adição para suporte a notch do iPhone:
```css
@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 16px);
  }
  
  .pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
  }
}

/* Melhorar touch targets */
@media (max-width: 640px) {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## 11. Sliders e Inputs Touch-Friendly

**Arquivo:** `src/components/tools/PercentageSlider.tsx`

### Problema:
- Thumb do slider muito pequeno para touch
- Área de toque insuficiente

### Solução:
```tsx
// Aumentar área de toque
<Slider className="cursor-pointer touch-none" />
```

---

## 12. Dialog em Mobile

**Arquivo:** Todos os dialogs

### Problema:
- Dialogs podem ser difíceis de fechar em mobile

### Solução:
- Usar Drawer (vaul) em mobile ao invés de Dialog

```tsx
const isMobile = useIsMobile();

{isMobile ? (
  <Drawer open={open} onOpenChange={setOpen}>
    <DrawerContent>...</DrawerContent>
  </Drawer>
) : (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>...</DialogContent>
  </Dialog>
)}
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Prioridade | Alteração |
|---------|------------|-----------|
| `src/components/tools/ToolLayout.tsx` | Alta | Padding, título mobile, indicador scroll |
| `src/components/tools/SensitivityHeatmap.tsx` | Alta | Versão compacta 5 colunas para mobile |
| `src/components/tools/ScenarioMatrix.tsx` | Alta | Layout de cards em mobile |
| `src/pages/Simulador.tsx` | Alta | Botões responsivos, grid KPIs |
| `src/components/tools/KPICard.tsx` | Média | Validar padding/fontes |
| `src/components/tools/CollapsibleInputCard.tsx` | Média | Padding mobile |
| `src/components/tools/RentalUnitsCard.tsx` | Média | Inputs empilhados em mobile |
| `src/components/tools/CashFlowChart.tsx` | Média | YAxis width responsivo |
| `src/index.css` | Média | Safe areas, touch targets |
| `src/pages/PrecoTeto.tsx` | Média | Mesmos ajustes do Simulador |
| `src/pages/Decisor.tsx` | Média | Mesmos ajustes do Simulador |
| `src/pages/HighestBestUse.tsx` | Média | Mesmos ajustes do Simulador |
| `src/pages/Permuta.tsx` | Média | Mesmos ajustes do Simulador |

---

## Resultado Esperado

### Antes:
- Conteúdo cortado em telas pequenas
- Scroll horizontal forçado em tabelas
- Botões apertados e difíceis de tocar
- Textos truncados

### Depois:
- Layout fluido que se adapta a qualquer tela
- Tabelas transformadas em cards em mobile
- Touch targets de 44px+ (padrão Apple)
- Safe areas para iPhones com notch
- Experiência nativa e profissional
