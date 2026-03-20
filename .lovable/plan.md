

# Plano: Campo de Observações nas Ferramentas + PDF

## O que será feito
Adicionar um campo de texto "Observações" nas ferramentas (Simulador, Decisor, PrecoTeto, HighestBestUse, Permuta) e incluí-lo no final do PDF exportado, antes do rodapé.

## Mudanças

### 1. `src/components/tools/ProjectHeader.tsx`
- Adicionar props opcionais `observations` e `onObservationsChange`
- Renderizar `Textarea` com label "Observações" e placeholder "Anotações, premissas, contexto..."
- Só aparece se `onObservationsChange` for passado (retrocompatível)

### 2. Páginas das ferramentas (5 arquivos)
- Adicionar estado `observations` (string) em cada ferramenta
- Passar para `ProjectHeader` (ou inline no Permuta que não usa ProjectHeader)
- Incluir em `inputs` ao salvar e restaurar ao carregar
- Incluir no `handleReset`
- Passar `observations` para a função de export PDF

### 3. `src/lib/pdfExport.ts`
- Adicionar `observations?: string` na interface `PDFConfig`
- Antes do rodapé, se `observations` estiver preenchido, renderizar uma seção "OBSERVAÇÕES" com o texto em caixa com fundo bege
- Usar `checkNewPage` para garantir espaço

### Layout no PDF

```text
┌──────────────────────────────────────────┐
│ (seções existentes...)                   │
│                                          │
│ ▌ OBSERVAÇÕES                            │
│ ┌──────────────────────────────────────┐ │
│ │ Texto livre escrito pelo usuário...  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ─────────────────────────────────────── │
│ Disclaimer...                            │
│ Contato: (19) 97122-3648 | setter.realty │
└──────────────────────────────────────────┘
```

## Detalhes técnicos
- Dados salvos no JSONB `inputs` — sem migration
- Textarea com `maxLength={500}`
- `doc.splitTextToSize()` usado para quebrar linhas no PDF

