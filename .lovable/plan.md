
# Plano: Ajustar Posição do Botão do WhatsApp

## Problema
O botão flutuante do WhatsApp (`fixed bottom-6 right-6`) está sobrepondo os botões de ação (Abrir Projeto, Salvar, Exportar PDF) que ficam na parte inferior do painel direito das ferramentas.

## Solução Proposta

### Opção Escolhida: Subir o botão do WhatsApp

Mover o botão do WhatsApp para uma posição mais alta na tela, ficando acima da linha dos botões de ação.

**Arquivo:** `src/components/WhatsAppButton.tsx`

```tsx
// Mudar de bottom-6 para bottom-24
className="fixed bottom-24 right-6 z-40 group"
```

**Alteração:** `bottom-6` (24px) → `bottom-24` (96px)

Isso posiciona o botão do WhatsApp aproximadamente 96px acima do canto inferior direito, deixando espaço suficiente para os botões de ação que ocupam cerca de 50-60px de altura.

## Resumo de Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `src/components/WhatsAppButton.tsx` | Mudar `bottom-6` para `bottom-24` |

## Resultado Esperado

```text
+--------------------------------------------------+
|                                                  |
|                                                  |
|                                                  |
|                                     [WhatsApp]   |  <-- Novo: bottom-24
|                                                  |
|  [Abrir Projeto] [Salvar] [Exportar PDF]         |  <-- Sem sobreposição
+--------------------------------------------------+
```
