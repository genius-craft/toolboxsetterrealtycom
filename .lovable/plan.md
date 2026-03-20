

# Plano: Toggle de Endereço Google Maps nas Ferramentas

## Problema
O usuário quer poder incluir opcionalmente um link compartilhável do Google Maps nos projetos das ferramentas. Se ativo, o endereço aparece; se desativado, não.

## Mudanças

### 1. `src/components/tools/ProjectHeader.tsx`
- Adicionar props opcionais: `googleMapsLink`, `onGoogleMapsLinkChange`, `showAddress`, `onShowAddressChange`
- Adicionar um toggle (Switch) com label "Endereço do imóvel"
- Quando ativo, mostrar campo de texto para colar o link do Google Maps
- Placeholder: "Cole o link do Google Maps aqui"

### 2. Páginas das ferramentas (Simulador, Decisor, PrecoTeto, HighestBestUse, Permuta)
- Adicionar estados `showAddress` (boolean) e `googleMapsLink` (string)
- Passar para o ProjectHeader (ou incluir inline onde ProjectHeader não é usado)
- Incluir nos inputs salvos no banco e no carregamento de projetos
- Incluir no export PDF (se link estiver preenchido, mostrar no cabeçalho do relatório)

### 3. `src/lib/pdfExport.ts`
- Receber `googleMapsLink` opcional nos parâmetros
- Se presente, exibir o endereço/link abaixo do nome do projeto no PDF

## Layout do toggle no ProjectHeader

```text
┌─────────────────────────────────────┐
│ Nome do Projeto                     │
│ [___________________________]       │
│                                     │
│ Tipo de Investimento                │
│ [Compra Pronta] [Build-to-Suit]     │
│                                     │
│ Endereço do Imóvel  [toggle ○]      │
│ (quando ativo:)                     │
│ [Cole o link do Google Maps aqui__] │
└─────────────────────────────────────┘
```

## Detalhes técnicos
- Props opcionais no ProjectHeader para não quebrar ferramentas que não usam
- Dados salvos no JSONB `inputs` dos projetos (sem migration necessária)
- O link é armazenado como string simples no state

